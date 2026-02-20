"use client";

import { EVENTS } from "@/data/events";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Calendar, Play, Download, ArrowLeft, Lock, MessageSquare, Video, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/components/forum/CommentSection";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ArchivePage() {
    const [user, setUser] = useState<User | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    // Show events that are revealed (so we can discuss them before they happen)
    const activeEvents = EVENTS.filter(e => {
        return new Date(e.revealAt) <= new Date();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    useEffect(() => {
        // Safety timeout to prevent "forever loading"
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                await checkAccess(u);
            } else {
                setLoading(false);
            }
            clearTimeout(timer);
        });
        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const checkAccess = async (u: User) => {
        try {
            const q = query(
                collection(db, "rsvps"),
                where("uid", "==", u.uid),
                where("status", "==", "confirmed")
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setHasAccess(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const login = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500">Lade Archiv...</div>;

    if (!user || !hasAccess) {
        return (
            <main className="min-h-screen w-full bg-[#020617] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-theme-primary/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-md w-full text-center space-y-8 p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-slate-400" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold">Members Only</h1>
                        <p className="text-slate-400">
                            Das Archiv ist exklusiv für Deep Dive Teilnehmer (Live oder Online).
                            Nach deinem ersten Besuch schaltet sich dieser Bereich frei.
                        </p>
                    </div>

                    {!user ? (
                        <Button fullWidth onClick={login} variant="signal">Login to Verify</Button>
                    ) : (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
                            Keine bestätigten Tickets gefunden. <br />
                            <Link href="/" className="underline text-white hover:text-theme-primary">Melde dich für das nächste Event an.</Link>
                        </div>
                    )}
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen w-full bg-[#020617] text-white p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-12">
                {/* Minimal Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Zurück
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Access Granted</span>
                        </div>
                        <button
                            onClick={() => auth.signOut()}
                            className="text-slate-500 hover:text-white text-xs uppercase tracking-wider transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold">The Knowledge Base</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Ressourcen, Recordings und Q&A zu vergangenen Sessions.
                    </p>
                </div>

                {/* Forum Feed Layout */}
                <div className="space-y-12">
                    {activeEvents.length === 0 ? (
                        <div className="border border-white/5 bg-slate-900/40 rounded-3xl p-8 md:p-12 text-center space-y-6 max-w-2xl mx-auto">
                            {/* ... Empty State (kept mostly same but rare to hit now since we have a revealed event) ... */}
                            <div className="w-20 h-20 bg-gradient-to-br from-theme-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Play className="w-8 h-8 text-white/50" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Noch ist es ruhig hier...</h2>
                            <p className="text-slate-400">Sobald Events sichtbar sind, erscheinen sie hier.</p>
                        </div>
                    ) : (
                        activeEvents.map(event => (
                            <div key={event.id} className="relative pl-8 md:pl-12 border-l border-white/10 space-y-8 pb-12 last:pb-0">
                                {/* Timeline Dot */}
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-theme-primary shadow-[0_0_10px_theme('colors.cyan.500')]"></div>

                                <div className="space-y-6">
                                    {/* Event Header */}
                                    <div>
                                        <span className="text-xs font-mono text-theme-primary mb-2 block">{formatDate(event.date)}</span>
                                        <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
                                        <p className="text-slate-400 max-w-3xl leading-relaxed whitespace-pre-wrap">
                                            {(event.longDescription || event.description).split(/(\*\*.*?\*\*)/).map((part, i) =>
                                                part.startsWith('**') && part.endsWith('**') ?
                                                    <strong key={i} className="text-white">{part.slice(2, -2)}</strong> :
                                                    part
                                            )}
                                        </p>
                                    </div>

                                    {/* Main Content Card */}
                                    <div className="grid gap-6">
                                        {/* Live Stream / Replay Area */}
                                        {event.youtubeId?.replay ? (
                                            <Card className="bg-slate-900/40 border-white/5 overflow-hidden">
                                                <div className="aspect-video bg-black relative group cursor-pointer border-b border-white/5">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${event.youtubeId.replay}`}
                                                        title={event.title}
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </Card>
                                        ) : event.youtubeId?.live && event.youtubeId.live.includes("meet.google.com") ? (
                                            <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-bold text-blue-200">Online Stream Access</h3>
                                                        <p className="text-sm text-blue-300/60">Google Meet Link für Online-Teilnehmer</p>
                                                    </div>
                                                    <a
                                                        href={event.youtubeId.live.startsWith('http') ? event.youtubeId.live : `https://${event.youtubeId.live}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="signal" className="bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50">
                                                            <Video className="w-4 h-4 mr-2" />
                                                            Join Stream
                                                        </Button>
                                                    </a>
                                                </div>
                                            </Card>
                                        ) : null}

                                        {/* Premium Resources Grid */}
                                        {event.assets.length > 0 && (
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-bold text-theme-primary uppercase tracking-widest">Event Ressourcen</h4>
                                                    <div className="h-px bg-theme-primary/20 flex-1" />
                                                </div>

                                                {/* Embedded Videos */}
                                                {event.assets.filter(a => a.type === 'video').map((asset, i) => (
                                                    <div key={`video-${i}`} className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                                                        <div className="aspect-video">
                                                            <iframe
                                                                src={asset.url}
                                                                className="w-full h-full"
                                                                allow="autoplay; encrypted-media"
                                                                allowFullScreen
                                                                title={asset.label}
                                                            />
                                                        </div>
                                                        <div className="px-4 py-3 bg-slate-900/80 border-t border-white/5">
                                                            <p className="text-sm font-medium text-slate-300">{asset.label}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Download & Link Assets */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {event.assets.filter(a => a.type !== 'video').map((asset, i) => (
                                                        <a
                                                            key={i}
                                                            href={asset.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="group flex flex-col justify-center p-4 bg-slate-900/50 hover:bg-theme-primary/10 border border-white/5 hover:border-theme-primary/30 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/5 rounded-full blur-[40px] group-hover:bg-theme-primary/20 transition-colors" />
                                                            <div className="relative z-10 flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                                                    {asset.type === 'link' ? <ExternalLink className="w-5 h-5 text-theme-primary" /> : <Download className="w-5 h-5 text-emerald-400" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">{asset.label}</p>
                                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                                                        {asset.type === 'pdf' ? 'PDF DOKUMENT' : asset.type === 'code' ? 'ZIP DOWNLOAD' : 'EXTERNER LINK'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discussion / Forum Thread */}
                                    <CommentSection eventId={event.id} user={user} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
