export type EventTheme = 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'ocean';

export interface EventAsset {
    label: string;
    type: 'pdf' | 'link' | 'code' | 'video';
    url: string;
}

export interface EventConfig {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    theme: EventTheme;
    date: string; // ISO 8601
    revealAt: string; // ISO 8601
    durationHours: number;
    location: string;
    address: string;
    capacity: number;
    youtubeId?: {
        live?: string;
        replay?: string;
    };
    assets: EventAsset[];
    takeaways?: string[];
}

export const EVENTS: EventConfig[] = [
    {
        id: "feb-2026-skills",
        title: "Agent Skills: Vom Tool zum Alleskönner",
        description: "Wie du ein 'KI Coding Tool' in deinen persönlichen Super-Assistenten verwandelst. Wir machen Tools zu Fähigkeiten.",
        longDescription: `
**Was ist ein \"Skill\"?**
Stell dir vor, dein KI-Assistent könnte nicht nur chatten, sondern *handeln*. Ein Skill ist ein Paket aus Wissen und Werkzeugen, das du deinem Agenten gibst.
Statt jedes Mal zu erklären \"Erstelle eine Rechnung als PDF\", gibst du ihm einmal den \"Invoice-Skill\" – und er kann es für immer.

In diesem Deep Dive bauen wir solche Fähigkeiten. Wir verwandeln einmalige Prompts in dauerhafte Power-Tools.

**Bitte mitbringen:**
Laptops gerne mitnehmen! Es ist keine Pflicht, aber von großem Vorteil, um direkt mitzumachen.
        `,
        theme: "ocean",
        date: "2026-02-02T18:30:00.000Z", // 2026-02-02 19:30 Local
        revealAt: "2026-01-10T08:00:00.000Z",
        durationHours: 2,
        location: "Penthouse Büro",
        address: "Magazinstraße 4, 5020 Salzburg",
        capacity: 20,
        takeaways: [
            "Automatische Invoices & Google Drive Sync",
            "Video Editing & Cutting Workflow",
            "High-End PDF Poster & Präsentationen (besser als Gamma)",
            "Automatisches Datei- & Download-Management",
            "Recherche & Bilderstellung im eigenen CI"
        ],
        assets: [
            { label: "Agentic Workflow Starter Kit (.zip)", type: "code", url: "/assets/events/feb-2026/Agentic_Skills_Starter_Kit.zip" },
            { label: "Präsentation Handout (.pdf)", type: "pdf", url: "/assets/events/feb-2026/Agentic_Skills_Presentation.pdf" },
            { label: "Skill Creator auf SkillsMP", type: "link", url: "https://skillsmp.com/" },
            { label: "SkillsMP - The Skills Library", type: "link", url: "https://skillsmp.com/" },
            { label: "AI Wednesday Recording (Video)", type: "video", url: "https://drive.google.com/file/d/1QUJxO0yfrQZFeHLNoRMBR1qfiObj5xFa/preview" },
            { label: "AI Wednesday Link-Sammlung", type: "link", url: "https://www.one-tab.com/page/1v3Y2-EcRP-7QkrNKLzHLg" }
        ],
        youtubeId: {
            live: "meet.google.com/ood-roxf-hpn" // Using this field for the Meet link for now, UI will need to handle it or we add a new field
        }
    },
    {
        id: "mar-2026-rag",
        title: "Agentic Working: Bau dir dein agentisches Team auf",
        description: "2024 war Prompt Engineering. 2025 Kontext Engineering. 2026 ist Access Engineering – wem gibst du welche Zugriffe? Wer jetzt nicht anfängt, hat ab nächstem Jahr ein Problem.",
        longDescription: `
**Die Evolution der KI-Skills:**
*   **2024:** Prompt Engineering – wer die richtigen Fragen stellt, bekommt die besseren Antworten.
*   **2025:** Kontext Engineering – wer seinem Agenten das richtige Wissen gibt, bekommt echte Ergebnisse.
*   **2026:** Access Engineering – wem gibst du genau welche Zugriffe? Dein Agent braucht Augen, Hände und Berechtigungen.

**Warum du kommen solltest:**
Ich zeige euch live, wie ich mein eigenes agentisches Team aufgebaut habe – inklusive aller Fehlversuche. Die mehrfachen Deinstallationen, die Reinstallationen um 3 Uhr nachts, die Momente wo alles kaputt war. Und wie es am Ende doch funktioniert hat.

Wer jetzt nicht anfängt, ist ab nächstem Jahr nicht mehr vorbereitet auf die Art, wie wir arbeiten werden. Das ist kein Hype – das ist der neue Stack.

**Bitte mitbringen:**
Laptop empfohlen! Wir bauen live.
        `,
        theme: "amber",
        date: "2026-03-02T18:30:00.000Z", // 1st Monday March (19:30 CET)
        revealAt: "2026-02-03T08:00:00.000Z",
        durationHours: 3,
        location: "Penthouse Büro",
        address: "Magazinstraße 4, 5020 Salzburg",
        capacity: 25,
        takeaways: [
            "Von Prompt Engineering → Kontext Engineering → Access Engineering",
            "Dein eigenes agentisches Team aufbauen (live Demo)",
            "Die häufigsten Fehler & Fehlversuche (aus erster Hand)",
            "Access Engineering: Wem gibst du welche Zugriffe?",
            "Vorbereitet sein auf die Arbeitswelt ab 2027"
        ],
        assets: []
    }
];

export const getActiveEvent = () => {
    const now = new Date().toISOString();
    const visibleEvents = EVENTS.filter(e => e.revealAt <= now);
    visibleEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return visibleEvents[0] || null;
}

export const getEventStatus = (event: EventConfig) => {
    const now = new Date();
    const start = new Date(event.date);
    const end = new Date(start.getTime() + event.durationHours * 60 * 60 * 1000);
    const buffer = 3 * 60 * 60 * 1000;

    if (now < start) return 'UPCOMING';
    if (now >= start && now <= new Date(end.getTime() + buffer)) return 'LIVE';
    return 'PAST';
}
