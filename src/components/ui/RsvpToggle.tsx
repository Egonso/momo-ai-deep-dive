"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users, MonitorPlay } from "lucide-react";

interface RsvpToggleProps {
    mode: 'in-person' | 'online';
    onChange: (mode: 'in-person' | 'online') => void;
    penthouseSeatsLeft: number;
}

export function RsvpToggle({ mode, onChange, penthouseSeatsLeft }: RsvpToggleProps) {
    return (
        <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5 flex relative mb-6">
            <button
                onClick={() => onChange('in-person')}
                className={cn(
                    "flex-1 relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-1",
                    mode === 'in-person' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Penthouse
                </span>
                <span className={cn(
                    "text-xs",
                    penthouseSeatsLeft > 0 ? "text-theme-primary" : "text-red-500"
                )}>
                    {penthouseSeatsLeft > 0
                        ? (penthouseSeatsLeft <= 5 ? `${penthouseSeatsLeft} Plätze frei` : 'Wenige Plätze')
                        : 'Warteliste'}
                </span>
            </button>

            <button
                onClick={() => onChange('online')}
                className={cn(
                    "flex-1 relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-200 flex flex-col items-center gap-1",
                    mode === 'online' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                <span className="flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4" /> Stream
                </span>
                <span className="text-xs text-zinc-500">Unbegrenzt</span>
            </button>

            {/* Sliding Background */}
            <div
                className={cn(
                    "absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-out border border-white/5",
                    mode === 'in-person' ? "left-1" : "left-[calc(50%+2px)]" // Simple calc for 2-item grid
                )}
            />

            {mode === 'online' && (
                <div className="absolute -bottom-6 left-0 right-0 text-center w-full">
                    <span className="text-[10px] text-zinc-500 animate-in fade-in slide-in-from-top-1 block">
                        *Auf vor Ort Teilnehmende wird zuerst Rücksicht genommen
                    </span>
                </div>
            )}
        </div>
    );
}
