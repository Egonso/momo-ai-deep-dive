"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EVENTS } from "@/data/events";
import { Button } from "@/components/ui/Button";
import { X, UserPlus } from "lucide-react";

interface AddUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddUserDialog({ isOpen, onClose, onSuccess }: AddUserDialogProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState<'in-person' | 'online'>('in-person');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const eventId = EVENTS[0].id;
            // Generate a manual ID
            const manualId = `manual_${Date.now()}`;
            const rsvpId = `${eventId}_${manualId}`;

            // Create RSVP
            await setDoc(doc(db, "rsvps", rsvpId), {
                eventId,
                uid: manualId,
                userName: name,
                userEmail: email,
                type,
                status: 'confirmed',
                attendees: [{ name, email, whatsapp: '' }], // Minimal attendee structure
                timestamp: new Date().toISOString(),
                isManual: true,
                adminNotes: "Added manually by admin"
            });

            onSuccess();
            onClose();
            setName("");
            setEmail("");
        } catch (err) {
            console.error(err);
            alert("Error creating user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-theme-primary" />
                        Manual RSVP
                    </h2>
                    <p className="text-sm text-slate-400">Add a user who didn't register via the app.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-theme-primary outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-theme-primary outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Ticket Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('in-person')}
                                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${type === 'in-person' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                            >
                                Penthouse
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('online')}
                                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${type === 'online' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                            >
                                Online Stream
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button fullWidth variant="signal" isLoading={loading}>
                            Create RSVP
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
