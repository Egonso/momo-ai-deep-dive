"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Shield, MessageSquarePlus } from "lucide-react";
import { Button } from "../ui/Button";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function FeedbackWidget() {
    // UI State
    const [isOpen, setIsOpen] = useState(false);

    // Data State
    const [content, setContent] = useState("");
    const [myFeedback, setMyFeedback] = useState<any[]>([]);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [mounted, setMounted] = useState(false);

    // Auth State
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // State for Unread
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial Load & Subscription for Unread/Inox
    useEffect(() => {
        if (!user) return;

        // Listen to ALL my feedback to check for updates
        const q = query(
            collection(db, "feedback"),
            where("uid", "==", user.uid),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMyFeedback(msgs);

            // Calculate Unread: Messages with adminReply AND status 'answered' (or just reply present)
            // We need a local way to track "read". For now, if widget is closed, it's unread if newly updated?
            // Simplest: If widget is CLOSED, count "answered" messages that came/updated recently?
            // Or simpler: check against a localStorage 'lastRead' timestamp.

            const lastRead = localStorage.getItem('feedback_last_read') || '0';
            const unread = msgs.filter((m: any) =>
                m.adminReply && new Date(m.timestamp).getTime() > parseInt(lastRead) // This timestamp is creation, not reply. Optimally we need replyTimestamp.
                // Fallback: If creation is new? No. 
                // Let's assume if it has a reply, it's "new" until opened? 
                // Better: Just check if we have ANY replies that we haven't seen.
            );

            // Actually, let's just show a Dot if there are replies and the widget is closed OR tab is not inbox.
            // AND mark as read when we open inbox.
        });

        return () => unsubscribe();
    }, [user]);

    // Better Unread Logic:
    // We just count replies. We compare with "lastKnownReplyCount" stored in LS.
    useEffect(() => {
        if (myFeedback.length === 0) return;

        const replies = myFeedback.filter((m: any) => m.adminReply).length;
        const known = parseInt(localStorage.getItem('known_replies_count') || '0');

        if (replies > known) {
            setUnreadCount(replies - known);
            // Auto-Open if closed
            if (!isOpen) {
                setIsOpen(true);
            }
        }
    }, [myFeedback]); // Trigger on feedback update

    useEffect(() => {
        if (isOpen) {
            const replies = myFeedback.filter((m: any) => m.adminReply).length;
            localStorage.setItem('known_replies_count', replies.toString());
            setUnreadCount(0);
        }
    }, [isOpen, myFeedback]);


    const scrollToBottom = () => {
        const el = document.getElementById('chat-feed');
        if (el) el.scrollTop = el.scrollHeight;
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [isOpen, myFeedback]);

    const handleSubmit = async () => {
        if (!content.trim() || !user) return;
        // Identify context: if the last message was from me and has no reply, maybe append? 
        // No, simplest is just new doc. It mimics chat perfectly fine.

        setStatus('submitting');
        try {
            await addDoc(collection(db, "feedback"), {
                uid: user.uid,
                userName: user.displayName || 'Anonymous',
                userEmail: user.email,
                type: 'chat', // Simplified type
                content,
                status: 'new',
                timestamp: new Date().toISOString()
            });
            setStatus('success');
            setContent("");
            setTimeout(() => {
                setStatus('idle');
                scrollToBottom();
            }, 500);
        } catch (err) {
            console.error("Feedback error", err);
            setStatus('idle');
        }
    };

    if (!mounted || !user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-16 right-0 w-[380px] h-[600px] bg-slate-950 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-theme-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-theme-primary/20">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Momo's Support</h3>
                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat Stream */}
                        <div id="chat-feed" className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0B0F17] scroll-smooth custom-scrollbar">
                            {myFeedback.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
                                    <MessageSquare className="w-12 h-12 mb-2" />
                                    <p className="text-sm text-center max-w-[200px]">Schreib mir direkt hier wenn du Fragen hast.</p>
                                </div>
                            ) : (
                                // Render Chronologically (already sorted ASC in query)
                                myFeedback.map((item) => (
                                    <div key={item.id} className="space-y-4">
                                        {/* User Message */}
                                        <div className="flex justify-end">
                                            <div className="max-w-[85%] space-y-1">
                                                <div className="bg-theme-primary text-slate-950 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium shadow-sm">
                                                    {item.content}
                                                </div>
                                                <p className="text-[10px] text-slate-600 text-right mr-1">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Admin Reply (if exists) */}
                                        {item.adminReply && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[85%] space-y-1 flex gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0 flex items-center justify-center border border-white/10 mt-1">
                                                        <Shield className="w-3 h-3 text-theme-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="bg-slate-900 border border-white/10 text-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm shadow-sm">
                                                            {item.adminReply}
                                                        </div>
                                                        {/* No timestamp for reply in current schema, implies sequential */}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-slate-950/50 backdrop-blur-md border-t border-white/5 shrink-0">
                            <div className="relative flex items-end gap-2 bg-slate-900 border border-white/10 rounded-xl p-1.5 focus-within:border-theme-primary/50 transition-colors">
                                <textarea
                                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 resize-none max-h-[100px] min-h-[40px] px-3 py-2.5 focus:outline-none custom-scrollbar"
                                    placeholder="Nachricht an Momo..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    disabled={!content.trim() || status === 'submitting'}
                                    onClick={handleSubmit}
                                    className={`shrink-0 w-8 h-8 p-0 rounded-lg flex items-center justify-center transition-all ${content.trim() ? 'bg-theme-primary text-slate-950 hover:bg-theme-primary/90' : 'bg-slate-800 text-slate-600'}`}
                                >
                                    {status === 'submitting' ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-slate-600 mt-2">
                                Momo antwortet meistens innerhalb von ein paar Stunden.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-50 ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-theme-primary text-slate-950 hover:shadow-theme-primary/25'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-7 h-7" />}

                {/* Unread Badge */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-4 border-[#020617] animate-pulse shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </motion.button>
        </div>
    );
}
