"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/Button";
import { MessageSquare, X, Send, Sparkles, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AskMomo() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! Ich bin Momo AI. Frag mich alles zu den Deep Dives oder Code.' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Mock Response for MVP
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Das ist eine Demo-Antwort. Das echte Backend mit RAG kommt bald!'
            }]);
        }, 1500);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-20 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden ring-1 ring-theme-primary/20"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center border border-theme-primary/30">
                                    <Bot className="w-5 h-5 text-theme-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Ask Momo AI</h3>
                                    <p className="text-xs text-theme-primary flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-theme-primary text-black rounded-tr-none font-medium'
                                                : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Frag mich etwas..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-theme-primary/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 bg-theme-primary text-black rounded-xl hover:bg-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-colors border border-white/10 ${isOpen
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-theme-primary text-black water-glow'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </>
    );
}
