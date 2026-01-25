"use client";

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Send, Loader2, Link as LinkIcon, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface Comment {
    id: string;
    text: string;
    userId: string;
    userName: string;
    userPhoto: string;
    resourceLink?: string;
    resourceTitle?: string;
    createdAt: any;
}

interface CommentSectionProps {
    eventId: string;
    user: User | null;
}

export function CommentSection({ eventId, user }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [resourceLink, setResourceLink] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [showResourceInput, setShowResourceInput] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Disclaimer State
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [pendingLink, setPendingLink] = useState<string | null>(null);

    const handleLinkClick = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        setPendingLink(url);
        setDisclaimerOpen(true);
    };

    const confirmExternalLink = () => {
        if (pendingLink) {
            window.open(pendingLink, '_blank');
        }
        setDisclaimerOpen(false);
        setPendingLink(null);
    };

    useEffect(() => {
        // Subscribe to comments for this event
        const q = query(
            collection(db, 'comments'),
            where('eventId', '==', eventId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Comment[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Comment);
            });
            setComments(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setSubmitting(true);
        try {
            const payload: any = {
                eventId,
                text: newComment,
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                userPhoto: user.photoURL || '',
                createdAt: serverTimestamp()
            };

            if (resourceLink.trim()) {
                payload.resourceLink = resourceLink;
                payload.resourceTitle = resourceTitle || resourceLink;
            }

            await addDoc(collection(db, 'comments'), payload);
            setNewComment('');
            setResourceLink('');
            setResourceTitle('');
            setShowResourceInput(false);
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Deep Exchange ({comments.length})</span>
            </div>

            {/* List */}
            <div className="space-y-4 pl-4 border-l border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="py-4 text-center text-slate-500"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Noch keine Kommentare. Starte die Diskussion!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="space-y-1 animate-in fade-in slide-in-from-left-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-theme-primary">{comment.userName}</span>
                                <span className="text-[10px] text-slate-600">
                                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>

                            {/* Render Community Resource */}
                            {comment.resourceLink && (
                                <div className="mt-2">
                                    <button
                                        onClick={(e) => handleLinkClick(e, comment.resourceLink!)}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-theme-primary/10 border border-theme-primary/20 rounded-lg group hover:bg-theme-primary/20 transition-colors text-left max-w-full"
                                    >
                                        <div className="p-1.5 bg-theme-primary/20 rounded-md group-hover:bg-theme-primary/30 text-theme-primary">
                                            <LinkIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-theme-primary/70 font-bold uppercase tracking-wider">Community Resource</div>
                                            <div className="text-sm text-theme-primary truncate font-medium underline decoration-dashed underline-offset-4">
                                                {comment.resourceTitle || comment.resourceLink}
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-theme-primary/50" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            {user ? (
                <div className="space-y-3 pt-2">
                    {showResourceInput && (
                        <div className="p-3 bg-white/5 rounded-xl space-y-2 border border-white/10 animate-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={resourceTitle}
                                onChange={(e) => setResourceTitle(e.target.value)}
                                placeholder="Titel der Ressource (Optional)"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-theme-primary/50"
                            />
                            <input
                                type="text"
                                value={resourceLink}
                                onChange={(e) => setResourceLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-theme-primary/50"
                            />
                        </div>
                    )}

                    <form onSubmit={handlePost} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center text-xs font-bold text-theme-primary border border-theme-primary/30 shrink-0">
                            {user.photoURL ? (
                                <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt="Me" />
                            ) : (
                                user.email?.[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Stelle eine Frage oder teile eine Erkenntnis..."
                                className="w-full bg-transparent border-b border-white/10 focus:border-theme-primary px-0 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors pr-20"
                                disabled={submitting}
                            />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowResourceInput(!showResourceInput)}
                                    className={`p-1.5 rounded-full transition-colors ${showResourceInput ? 'text-theme-primary bg-theme-primary/10' : 'text-slate-400 hover:text-white'}`}
                                    title="Ressource anhängen"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="p-1.5 text-theme-primary disabled:opacity-50 hover:scale-110 transition-transform"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="text-center p-4 bg-white/5 rounded-xl text-xs text-slate-400">
                    Bitte einloggen, um mitzudiskutieren.
                </div>
            )}

            {/* Disclaimer Modal (Simple Implementation using fixed overlay) */}
            {disclaimerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-2">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-white">Externer Link</h3>
                            <p className="text-sm text-slate-400">
                                Du verlässt den sicheren Hafen von Momo AI. <br />
                                Wir übernehmen keine Verantwortung für Inhalte der Community.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setDisclaimerOpen(false)}>Abbrechen</Button>
                            <Button variant="outline" onClick={confirmExternalLink} className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">Trotdzem öffnen</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
