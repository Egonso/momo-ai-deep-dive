"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, Mail, CheckCircle2, Trash2, Filter, AlertCircle, Lightbulb, Star, HelpCircle, Send, RefreshCw } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface FeedbackItem {
    id: string;
    uid: string;
    userName: string;
    userEmail: string;
    type: 'question' | 'idea' | 'critique' | 'feature_request' | 'other';
    content: string;
    status: 'new' | 'read' | 'answered';
    timestamp: string;
    adminNotes?: string;
    adminReply?: string;
    replyTimestamp?: string;
}

const TYPE_ICONS = {
    question: HelpCircle,
    idea: Lightbulb,
    critique: AlertCircle,
    feature_request: Star,
    other: MessageSquare
};

export function FeedbackInbox() {
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    // Fetch logic...
    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FeedbackItem[];
            setItems(data);
        } catch (err) {
            console.error("Error loading feedback", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const selectedItem = items.find(i => i.id === selectedId);

    const selectItem = async (item: FeedbackItem) => {
        setSelectedId(item.id);
        // Mark as read if new
        if (item.status === 'new') {
            try {
                await updateDoc(doc(db, "feedback", item.id), { status: 'read' });
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'read' } : i));
            } catch (e) {
                console.error("Failed to mark read");
            }
        }
    };

    const handleSendReply = async () => {
        if (!selectedId || !replyText.trim()) return;
        setSending(true);
        try {
            await updateDoc(doc(db, "feedback", selectedId), {
                adminReply: replyText,
                replyTimestamp: new Date().toISOString(),
                status: 'answered'
            });
            // Update local state
            setItems(prev => prev.map(i => i.id === selectedId ? {
                ...i,
                adminReply: replyText,
                status: 'answered'
            } : i));
            setReplyText("");
        } catch (e) {
            alert("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Löschen?")) return;
        await deleteDoc(doc(db, "feedback", id));
        setItems(prev => prev.filter(i => i.id !== id));
        if (selectedId === id) setSelectedId(null);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 rounded-2xl bg-slate-900 overflow-hidden h-[600px]">
            {/* LEFT: List */}
            <div className="border-r border-white/10 flex flex-col h-full bg-slate-950/30">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-white">Inbox ({items.filter(i => i.status === 'new').length})</h3>
                    <Button variant="ghost" size="sm" onClick={fetchFeedback}><RefreshCw className="w-4 h-4" /></Button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {items.map(item => {
                        const Icon = TYPE_ICONS[item.type] || MessageSquare;
                        return (
                            <div
                                key={item.id}
                                onClick={() => selectItem(item)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedId === item.id
                                    ? 'bg-theme-primary/10 border-theme-primary/50'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`p-1.5 rounded-md ${selectedId === item.id ? 'bg-theme-primary text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                                            <Icon className="w-3 h-3" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className={`text-sm font-bold truncate ${item.status === 'new' ? 'text-white' : 'text-slate-400'}`}>
                                                {item.userName}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{item.type}</span>
                                        </div>
                                    </div>
                                    {item.status === 'new' && <div className="w-2 h-2 rounded-full bg-theme-primary shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-400 truncate mt-2">{item.content}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT: Chat */}
            <div className="md:col-span-2 flex flex-col h-full bg-slate-900 relative">
                {selectedItem ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
                            <div>
                                <h3 className="font-bold text-white">{selectedItem.userName}</h3>
                                <p className="text-xs text-slate-400">{selectedItem.userEmail} • {new Date(selectedItem.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <a href={`mailto:${selectedItem.userEmail}`} className="p-2 hover:bg-white/10 rounded"><Mail className="w-4 h-4 text-slate-400" /></a>
                                <button onClick={(e) => handleDelete(selectedItem.id, e)} className="p-2 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* User User Message */}
                            <div className="flex justify-start">
                                <div className="max-w-[80%] space-y-1">
                                    <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-800 text-slate-200 text-sm border border-white/5">
                                        {selectedItem.content}
                                    </div>
                                    <span className="text-[10px] text-slate-600 block pl-2">User Request</span>
                                </div>
                            </div>

                            {/* Admin Reply */}
                            {selectedItem.adminReply && (
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] space-y-1">
                                        <div className="p-4 rounded-2xl rounded-tr-sm bg-theme-primary/20 text-emerald-100 text-sm border border-theme-primary/20">
                                            {selectedItem.adminReply}
                                        </div>
                                        <span className="text-[10px] text-emerald-500/50 block text-right pr-2">You replied</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 border-t border-white/10 bg-slate-950/50">
                            {selectedItem.adminReply ? (
                                <div className="text-center text-xs text-slate-500 italic">
                                    Already replied. <button onClick={() => setReplyText(selectedItem.adminReply!)} className="underline hover:text-white">Edit</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-theme-primary/50"
                                        placeholder="Type your reply..."
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                                    />
                                    <Button variant="signal" onClick={handleSendReply} disabled={!replyText.trim() || sending}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
