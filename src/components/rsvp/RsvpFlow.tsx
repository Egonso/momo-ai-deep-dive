"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RsvpToggle } from '../ui/RsvpToggle';
import { Button } from '../ui/Button';
import { TicketWallet } from '../dashboard/TicketWallet';
import { EventConfig } from '@/data/events';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

interface Attendee {
    name: string;
    email: string;
    whatsapp: string;
}

interface RsvpFlowProps {
    event: EventConfig;
}

export function RsvpFlow({ event }: RsvpFlowProps) {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState<'decision' | 'auth' | 'details' | 'ticket'>('decision');
    const [mode, setMode] = useState<'in-person' | 'online'>('in-person');
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [existingRsvp, setExistingRsvp] = useState<any>(null);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [email, setEmail] = useState('');
    const [linkSent, setLinkSent] = useState(false);

    // Check Auth & RSVP Status on Mount
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                checkRsvp(u);
            }
        });
        return () => unsubscribe();
    }, [event.id]);

    // Check for Magic Link on Mount
    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // User opened link on different device. Ask for email.
                email = window.prompt('Bitte gib deine Email erneut ein zur Bestätigung:');
            }
            if (email) {
                setStatus('loading');
                signInWithEmailLink(auth, email, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        // success, user is set by auth listener
                        setStatus('idle');
                    })
                    .catch((error) => {
                        console.error("Magic Link Error", error);
                        setErrorMessage(error.message);
                        setStatus('idle');
                    });
            }
        }
    }, []);

    const checkRsvp = async (u: User) => {
        setStatus('loading');
        try {
            const docRef = doc(db, 'rsvps', `${event.id}_${u.uid}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setExistingRsvp(data);

                setMode(data.type); // Sync local state
                if (data.attendees) setAttendees(data.attendees);
                setStep('ticket');
            } else {
                // Check if we came from a specific choice
                const storedMode = window.localStorage.getItem('rsvpMode');
                if (storedMode) {
                    setMode(storedMode as 'in-person' | 'online');
                    window.localStorage.removeItem('rsvpMode');
                    // Auto-advance to details since they already clicked the button
                    handleInitialLoginSuccess(u);
                } else {
                    setStep('decision');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatus('idle');
        }
    };

    const handleCommit = () => {
        if (user) {
            handleInitialLoginSuccess(user);
        } else {
            // Save their choice so we remember it after login
            window.localStorage.setItem('rsvpMode', mode);
            setStep('auth');
        }
    };

    const loginWithGoogle = async () => {
        setStatus('loading');
        setErrorMessage(null);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // Auth listener will handle checkRsvp automatically, but we can fast track
            if (!existingRsvp) {
                handleInitialLoginSuccess(result.user);
            }
        } catch (err: any) {
            console.error("Login Failed", err);
            setErrorMessage(err.message);
            setStatus('idle');
        }
    };

    const sendMagicLink = async () => {
        setStatus('loading');
        setErrorMessage(null);

        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setLinkSent(true);
            setStatus('idle');
        } catch (error: any) {
            console.error('Error sending email link', error);
            setErrorMessage(error.message);
            setStatus('idle');
        }
    };

    const handleInitialLoginSuccess = (u: User) => {
        // Pre-fill first attendee
        if (attendees.length === 0) {
            setAttendees([{
                name: u.displayName || '',
                email: u.email || '',
                whatsapp: ''
            }]);
        }
        // Move to details to confirm info/add others
        setStep('details');
    };

    const submitRsvp = async () => {
        if (!user) return;
        setStatus('loading');
        try {
            const rsvpData = {
                eventId: event.id,
                uid: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                userPhoto: user.photoURL,
                type: mode,
                status: 'confirmed',
                attendees: attendees,
                timestamp: new Date().toISOString()
            };

            await setDoc(doc(db, 'rsvps', `${event.id}_${user.uid}`), rsvpData);
            // Sync simple profile
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastSeen: new Date().toISOString()
            }, { merge: true });

            setExistingRsvp(rsvpData);
            setStep('ticket');
        } catch (err: any) {
            console.error("RSVP Failed", err);
            setErrorMessage("Fehler beim Speichern. Bitte versuche es erneut.");
        } finally {
            setStatus('idle');
        }
    };

    // Form Helpers
    const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
        const newAttendees = [...attendees];
        newAttendees[index] = { ...newAttendees[index], [field]: value };
        setAttendees(newAttendees);
    };

    const addAttendee = () => {
        setAttendees([...attendees, { name: '', email: '', whatsapp: '' }]);
    };

    const removeAttendee = (index: number) => {
        setAttendees(attendees.filter((_, i) => i !== index));
    };

    const handleCancel = async () => {
        if (!user) return;

        setStatus('loading');
        try {
            await deleteDoc(doc(db, 'rsvps', `${event.id}_${user.uid}`));
            setExistingRsvp(null);
            setStep('decision');
        } catch (err) {
            console.error("Cancel Failed", err);
            alert("Fehler beim Stornieren.");
        } finally {
            setStatus('idle');
        }
    };


    const handleEdit = () => {
        setStep('details');
    };

    // --- RENDER ---

    // 1. Success / Ticket View
    if (step === 'ticket' && user) {
        return (
            <TicketWallet
                event={event}
                ticketType={existingRsvp?.type || mode} // Use existing if available for consistency
                user={user}
                attendees={existingRsvp?.attendees || attendees}
                onCancel={handleCancel}
                onEdit={handleEdit}
            />
        )
    }

    // 2.5 Details / Group Registration
    if (step === 'details') {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium text-white">{existingRsvp ? 'Ticket bearbeiten' : 'Wer ist dabei?'}</h3>
                    <p className="text-sm text-slate-400">Wir brauchen Name & Kontakt für die Gästeliste.</p>
                </div>

                {/* Mode Switcher inside Form */}
                <div className="bg-black/20 p-2 rounded-xl mb-4">
                    <RsvpToggle mode={mode} onChange={setMode} penthouseSeatsLeft={4} />
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {attendees.map((attendee, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3 relative group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gast {index + 1}</span>
                                {index > 0 && (
                                    <button onClick={() => removeAttendee(index)} className="text-slate-500 hover:text-red-400">
                                        &times;
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Voller Name"
                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-theme-primary/50"
                                value={attendee.name}
                                onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="Email Adresse"
                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-theme-primary/50"
                                value={attendee.email}
                                onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="WhatsApp (z.B. +43...)"
                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-theme-primary/50"
                                value={attendee.whatsapp}
                                onChange={(e) => updateAttendee(index, 'whatsapp', e.target.value)}
                            />
                        </div>
                    ))}

                    <Button variant="outline" size="sm" fullWidth onClick={addAttendee} className="border-dashed border-white/20 text-slate-400">
                        + Weitere Person hinzufügen
                    </Button>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="signal"
                        fullWidth
                        onClick={submitRsvp}
                        isLoading={status === 'loading'}
                        disabled={attendees.some(a => !a.name || !a.email || !a.whatsapp)}
                    >
                        {existingRsvp ? 'Update speichern' : 'Anmeldung abschließen'}
                    </Button>
                    <p className="text-[10px] text-center text-slate-600 leading-tight px-4">
                        Mit der Anmeldung erlaubst du uns, dich bezüglich des Events und der WhatsApp Gruppe zu kontaktieren. Keine Werbung, nur Orga.
                    </p>
                </div>
            </motion.div>
        );
    }

    // 2. Auth View
    if (step === 'auth') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center">
                    <h3 className="text-lg font-medium text-white">Identifiziere dich</h3>
                    <p className="text-sm text-slate-400">Damit wir wissen, wer auf der Liste steht.</p>
                </div>

                {errorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-3">
                    <Button variant="outline" fullWidth onClick={loginWithGoogle} isLoading={status === 'loading'}>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                        Weiter mit Google
                    </Button>
                    {/* Magic Link Logic */}
                    {linkSent ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                            <h4 className="text-white font-medium">Email gesendet!</h4>
                            <p className="text-sm text-slate-300">Überprüfe deinen Posteingang (und Spam).</p>
                            <Button variant="ghost" size="sm" onClick={() => setLinkSent(false)}>Zurück</Button>
                        </div>
                    ) : !showEmailInput ? (
                        <Button variant="ghost" fullWidth onClick={() => setShowEmailInput(true)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Mit Email anmelden (Magic Link)
                        </Button>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="deine@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-theme-primary/50 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
                                    disabled={status === 'loading'}
                                />
                            </div>
                            <Button
                                variant="signal"
                                fullWidth
                                onClick={sendMagicLink}
                                isLoading={status === 'loading'}
                                disabled={!email || status === 'loading'}
                            >
                                Loguplink senden
                            </Button>
                            <p className="text-xs text-center text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowEmailInput(false)}>
                                Abbrechen
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-xs text-center text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={() => setStep('decision')}>
                    Zurück zur Auswahl
                </p>
            </motion.div>
        )
    }

    // 4. Check Email Link on Mount
    if (status === 'success' && !user) {
        return (
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 text-theme-primary animate-spin mx-auto" />
                <p className="text-slate-300">Verifiziere Magic Link...</p>
            </div>
        );
    }

    // 3. Default Decision View
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium ml-1">Wie bist du dabei?</label>
                <RsvpToggle
                    mode={mode}
                    onChange={setMode}
                    penthouseSeatsLeft={4} // TODO: Fetch real count from Firestore
                />
            </div>

            <Button
                fullWidth
                size="lg"
                onClick={handleCommit}
                variant="signal"
                className="group shadow-lg shadow-theme-primary/10"
                isLoading={status === 'loading'}
            >
                {mode === 'in-person' ? 'Platz reservieren' : 'Für Stream anmelden'}
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Button>

            <p className="text-xs text-center text-slate-500">
                Mit der Anmeldung akzeptierst du den <span className="underline decoration-dotted hover:text-slate-300">Code of Conduct</span>.
            </p>
        </div>
    );
}
