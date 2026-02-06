"use client";

import { AskMomo } from "@/components/chat/AskMomo";
import { useEffect, useState } from "react";
import { getActiveEvent, getEventStatus, EventConfig } from "@/data/events";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RsvpFlow } from "@/components/rsvp/RsvpFlow";
import { formatDate } from '@/lib/utils';
import { MapPin, Clock, Calendar, CheckCircle2, Waves, Play } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EventJsonLd } from "@/components/seo/EventJsonLd";

export default function Home() {
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showStream, setShowStream] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveEvent(getActiveEvent());
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-theme-primary/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Waves className="w-8 h-8 text-theme-primary animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!activeEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-zinc-500">
        <div className="text-center space-y-4">
          <Waves className="w-16 h-16 mx-auto text-theme-primary/50" />
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Surface Calm</h1>
            <p>Keine aktiven Deep Dives gefunden.</p>
          </div>
        </div>
      </div>
    )
  }

  const status = getEventStatus(activeEvent);

  return (
    <main
      className="min-h-screen w-full relative flex flex-col items-center justify-start md:justify-center p-6 md:p-8 overflow-x-hidden font-sans"
    >
      <EventJsonLd event={activeEvent} />
      {/* Ocean Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-theme-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-theme-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Member Access Header */}
      <div className="absolute top-6 right-6 z-50">
        <Link href="/archive">
          <button className="bg-slate-900/50 backdrop-blur-md border border-white/10 hover:border-theme-primary/50 text-slate-300 hover:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 group shadow-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:animate-pulse"></div>
            Member Login
          </button>
        </Link>
      </div>

      <div className="max-w-xl w-full relative z-10 space-y-12 pb-20 pt-8 md:pt-0">

        {/* 1. Logo & Badge Header */}
        <header className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="relative group w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-theme-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="/logo.png"
                alt="Momo KI Deep Dive Logo"
                className="relative w-full h-full object-cover scale-125 drop-shadow-2xl transition-transform duration-500 group-hover:scale-135"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center flex-wrap gap-3">
              {status === 'LIVE' && <Badge variant="live" animate>Live Now</Badge>}
              {status === 'UPCOMING' && <Badge variant="ocean">Next Deep Dive</Badge>}
              {status === 'PAST' && <Badge variant="outline">Archive</Badge>}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.1] text-balance drop-shadow-lg">
              {activeEvent.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              {activeEvent.description}
            </p>
          </div>
        </header>

        {/* 2. Glassmorphism Info Grid */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 text-sm text-slate-300">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-theme-primary/10 rounded-2xl text-theme-primary shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-base">{formatDate(activeEvent.date)}</p>
                <p className="text-slate-400">1. Montag im Monat</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-theme-primary/10 rounded-2xl text-theme-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-base">{new Date(activeEvent.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p>
                <p className="text-slate-400">Einlass ab {new Date(new Date(activeEvent.date).getTime() - 15 * 60000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className="flex items-start gap-4">
            <div className="p-3 bg-theme-primary/10 rounded-2xl text-theme-primary shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-base">{activeEvent.location}</p>
              <p className="text-slate-400">{activeEvent.address}</p>
            </div>
          </div>
        </div>

        {/* 3. Deep Dive Content (Takeaways) */}
        {activeEvent.takeaways && (
          <div className="space-y-6 px-2">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-bold text-theme-primary uppercase tracking-widest">In this Dive</h3>
              <div className="h-px bg-theme-primary/20 flex-1" />
            </div>

            <ul className="space-y-4">
              {activeEvent.takeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-200 group">
                  <div className="mt-1 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-theme-primary/70 group-hover:text-theme-primary transition-colors" />
                  </div>
                  <span className="text-base md:text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Action Area */}
        <div className="relative">
          {/* Glow Effect specific for Action Area */}
          <div className="absolute -inset-1 bg-theme-primary/20 blur-xl rounded-[40px] opacity-50" />

          <Card className="relative overflow-hidden border-0 bg-slate-900/80 rounded-[32px] ring-1 ring-white/10 backdrop-blur-xl">
            {status === 'UPCOMING' && (
              <RsvpFlow event={activeEvent} />
            )}

            {status === 'LIVE' && (
              <div className="space-y-6 text-center">
                {!showStream ? (
                  <>
                    <div
                      onClick={() => setShowStream(true)}
                      className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border border-white/10"
                    >
                      <img src="/stream-bg.png" alt="Stream Background" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="z-10 w-20 h-20 rounded-full bg-theme-primary/20 backdrop-blur-md flex items-center justify-center border border-theme-primary/50 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                          <Play className="ml-1 w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                        <span className="text-white font-bold text-shadow text-sm tracking-wide">LIVE FEED</span>
                      </div>
                    </div>
                    <Button
                      fullWidth
                      variant="ocean"
                      size="lg"
                      className="rounded-xl h-14 text-lg shadow-xl shadow-theme-primary/10"
                      onClick={() => setShowStream(true)}
                    >
                      Join Stream
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                      {/* Responsive YouTube Embed */}
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${activeEvent.youtubeId?.live || 'live_stream'}?autoplay=1`}
                        title="YouTube Live Stream"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Du schaust den Live-Feed aus dem Penthouse. <br />Fragen im Chat werden beantwortet, wenn es die Zeit vor Ort zulässt.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStream(false)}
                    >
                      Stream schließen
                    </Button>
                  </div>
                )}
              </div>
            )}

            {status === 'PAST' && (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-6">This expedition has concluded.</p>
                <Link href="/archive">
                  <Button variant="outline" fullWidth size="lg">Access Archive</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* 5. Manifesto / About Section */}
        <div className="space-y-8 py-12 border-t border-white/10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Was sind Momo Deep Dives?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Kein BlaBla. Kein Hype. Nur ehrliche Deep Dives in Technologien, die unsere Arbeit wirklich verändern.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-theme-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Tiefes Eintauchen</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Jeden 1. Montag im Monat nehmen wir uns EIN relevantes KI-Thema vor. Keine Oberflächen-News, sondern echte Skills.
                Wir verwandeln Tools in Fähigkeiten (Invoices automatisieren, Videos schneiden, Recherchen im eigenen CI).
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-theme-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Signal to Noise</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Wir werden alle bombardiert. Hier gibt es nur das, was wirklich zählt. Ich filtere für euch vor.
                Keine täglichen Diskussionen, sondern kuratierte Gold Nuggets und Notifications nur wenn es wirklich relevant ist.
              </p>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <a href="https://chat.whatsapp.com/JUGEOUL1XayJgVLkAlh0Se" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp Community beitreten
              </Button>
            </a>
          </div>
        </div>

        {/* 6. Footer */}
        <footer className="text-center space-y-6 pt-12 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <p className="text-slate-500 text-sm">
            Momo KI Deep Dive &copy; 2026
          </p>
          <div className="flex justify-center gap-8 text-xs font-medium text-slate-400 tracking-wide uppercase">
            <Link href="/impressum" className="hover:text-theme-primary transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-theme-primary transition-colors">Datenschutz</Link>
            <Link href="/archive" className="hover:text-theme-primary transition-colors">Archive</Link>
          </div>
        </footer>

      </div>
      {/* <AskMomo /> */}
    </main>
  );
}
