"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Calendar, MapPin, Download, Share2, Check, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EventConfig } from "@/data/events";
import QRCode from "react-qr-code";
import { useState, useRef } from "react";
import { toPng } from 'html-to-image';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface Attendee {
    name: string;
    email: string;
    whatsapp: string;
}

// VEVENT Helper for QR Code
const generateQrData = (event: EventConfig) => {
    const start = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${start}
LOCATION:${event.location}
DESCRIPTION:Support: office@momofeichtinger.com / WA +4368181655313
END:VEVENT`;
};

interface TicketWalletProps {
    event: EventConfig;
    ticketType: 'in-person' | 'online';
    user: {
        displayName: string | null;
        email: string | null;
        photoURL: string | null;
    };
    attendees?: Attendee[];
    onCancel: () => void;
    onEdit: () => void;
}

export function TicketWallet({ event, ticketType, user, attendees, onCancel, onEdit }: TicketWalletProps) {
    const [copied, setCopied] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Menu State
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const ticketRef = useRef<HTMLDivElement>(null);

    // Helpers
    const getGoogleCalendarUrl = () => {
        const start = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(event.date).getTime() + (event.durationHours * 60 * 60 * 1000)).toISOString().replace(/-|:|\.\d\d\d/g, "");

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&text=${encodeURIComponent(event.title)}`;
    };

    const downloadIcs = () => {
        const start = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(new Date(event.date).getTime() + (event.durationHours * 60 * 60 * 1000)).toISOString().replace(/-|:|\.\d\d\d/g, "");

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'event.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadTicketPdf = async () => {
        if (!ticketRef.current) return;
        try {
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 3 });
            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [600, 300] // Custom size matching the aspect ratio roughly
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Momo-AI-Ticket-${event.id}.pdf`);
        } catch (err) {
            console.error('PDF download failed', err);
        }
    };

    const handleGoogleCalendar = () => {
        window.open(getGoogleCalendarUrl(), '_blank');
    };

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Ich bin beim Momo AI Deep Dive dabei! ${event.title}`,
            url: window.location.origin
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-left"
        >
            {/* Ticket Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                {/* ... header content ... */}
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Check className="w-5 h-5 text-theme-primary" />
                        {ticketType === 'in-person' ? 'Penthouse Ticket' : 'Stream Access'}
                    </h3>
                    <p className="text-sm text-zinc-400">
                        {attendees && attendees.length > 0
                            ? `${attendees.length} Personen registriert`
                            : `Reserviert für ${user.displayName || user.email}`
                        }
                    </p>
                </div>
                {/* User Avatar & Logout Menu */}
                <div className="relative z-50">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative group focus:outline-none"
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className={`w-10 h-10 rounded-full border transition-colors ${menuOpen ? 'border-theme-primary ring-2 ring-theme-primary/30' : 'border-white/10 group-hover:border-white/30'}`} />
                        ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${menuOpen ? 'bg-theme-primary text-black' : 'bg-theme-primary/10 text-theme-primary group-hover:bg-theme-primary/20'}`}>
                                {user.email?.[0].toUpperCase()}
                            </div>
                        )}
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#020617] rounded-full"></div>
                    </button>

                    {/* The Pretty Little Popup */}
                    {menuOpen && (
                        <div className="absolute right-0 top-12 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden flex flex-col gap-1">
                            {!logoutConfirm ? (
                                <>
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-sm font-bold text-white truncate">{user.displayName || 'Deep Diver'}</p>
                                        <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => setLogoutConfirm(true)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        </div>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="p-3 space-y-3 bg-red-500/5 rounded-lg">
                                    <p className="text-xs text-red-200 text-center font-medium">Wirklich abmelden?</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs w-full bg-slate-800 hover:bg-slate-700" onClick={() => setLogoutConfirm(false)}>
                                            Bleiben
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="h-8 text-xs w-full"
                                            onClick={() => {
                                                signOut(auth);
                                                setMenuOpen(false);
                                            }}
                                        >
                                            Bye!
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* The Ticket Body - CAPTURE REF */}
            <div ref={ticketRef} className="relative bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-4">
                        {/* Event Info */}
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Event</p>
                            <p className="text-white font-bold leading-tight">{event.title}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Wann</p>
                            <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                <Calendar className="w-4 h-4 text-theme-primary" />
                                {formatDate(event.date)}, 19:30
                            </div>
                        </div>

                        {/* Attendee List in Ticket */}
                        {attendees && attendees.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-white/5">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Gäste</p>
                                <div className="text-sm text-white/90 space-y-0.5">
                                    {attendees.map((a, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-theme-primary rounded-full" />
                                            {a.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* QR Code Area */}
                    <div className="bg-white p-2 rounded-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <QRCode
                            value={generateQrData(event)}
                            size={80}
                            className="w-20 h-20"
                            level="M"
                        />
                    </div>
                </div>

                {/* Footer URL for image context */}
                <div className="absolute bottom-2 right-4 text-[10px] text-white/20 font-mono">
                    kideepdive.strategenwerk.com
                </div>
            </div>

            {/* Dashboard Actions */}
            <div className="space-y-3">
                <h4 className="text-xs text-zinc-500 uppercase tracking-wilder font-semibold">Dein Zugang</h4>
                <div className="grid grid-cols-1 gap-3">
                    <Button variant="signal" size="lg" className="h-12 border-theme-primary/30" onClick={() => window.location.href = '/archive'}>
                        <Check className="w-5 h-5 mr-3" />
                        Zum Knowledge Base / Archiv
                    </Button>

                    {ticketType === 'online' && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-200 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <div>
                                <p className="font-bold">Live Stream Zugang</p>
                                <p className="text-xs opacity-70">Der Stream startet hier auf der Startseite um 19:30.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={downloadTicketPdf}>
                        <Download className="w-4 h-4 mr-2" />
                        Ticket als PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs text-zinc-500 hover:text-white" onClick={handleGoogleCalendar}>
                        <Calendar className="w-3 h-3 mr-2" />
                        Google Kalender
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-[10px] text-zinc-600 hover:text-zinc-400 py-1 h-auto" onClick={downloadIcs}>
                        .ics Datei laden
                    </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full h-auto flex flex-col gap-1 py-2" onClick={handleShare}>
                    {copied ? <Check className="w-5 h-5 mb-1 text-green-500" /> : <Share2 className="w-5 h-5 mb-1" />}
                    <span>{copied ? 'Link Kopiert' : 'Event Teilen'}</span>
                </Button>
            </div>

            <div className="pt-4 border-t border-white/5 text-center space-y-4">

                {/* Contact Info */}
                <div className="text-xs text-zinc-500 space-y-1">
                    <p>Fragen? <a href="mailto:office@momofeichtinger.com" className="text-zinc-400 hover:text-white transition-colors">office@momofeichtinger.com</a></p>
                    <p>oder WhatsApp: <a href="https://wa.me/4368181655313" className="text-zinc-400 hover:text-white transition-colors">+43 681 816 553 13</a></p>
                </div>

                {/* Edit & Cancel Action */}
                {!isCancelling ? (
                    <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3 text-left flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors" onClick={onEdit}>
                            <div>
                                <p className="text-sm text-white font-medium">Ticket bearbeiten</p>
                                <p className="text-xs text-zinc-500">Gäste hinzufügen / entfernen</p>
                            </div>
                            <Button variant="ghost" size="sm" className="bg-transparent border border-white/10">
                                Editieren
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setIsCancelling(true)}
                                className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
                            >
                                Komplettes Ticket stornieren
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-red-200 font-medium mb-2">Wirklich stornieren?</p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="danger" size="sm" onClick={onCancel}>
                                Ja, weg damit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsCancelling(false)}>
                                Behalten
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </motion.div>
    )
}
