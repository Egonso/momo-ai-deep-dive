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
            { label: "SkillsMP - The Skills Library", type: "link", url: "https://skillsmp.com/" }
        ],
        youtubeId: {
            live: "meet.google.com/ood-roxf-hpn" // Using this field for the Meet link for now, UI will need to handle it or we add a new field
        }
    },
    {
        id: "mar-2026-rag",
        title: "KI-News-Stammtisch: Monatsrückblick & Agentic Work",
        description: "Ein Deep Dive in die Woche der Giganten: OpenAI vs Anthropic, OpenClaw Saga, und wie Agentic Coding die Arbeitswelt verändert.",
        longDescription: `
**Der Februar war wild.**
In den letzten 30 Tagen ist mehr passiert als im gesamten letzten Halbjahr. Wir sortieren das Chaos:

**Themen:**
*   **Giganten-Krieg:** OpenAI (GPT-4.5/5.3) vs. Anthropic (Claude 3.7/4.6) - Wer führt wirklich?
*   **OpenClaw Saga:** Wie ein viraler Open-Source Agent in 2 Wochen von \"Hype\" zu \"Security Nightmare\" zu \"Acquired by OpenAI\" wurde.
*   **Agentic Coding:** Warum Tools wie *Codex App* und *Clauda Code* die Art wie wir Software bauen für immer verändern.
*   **Video & IP:** Sora, Kling 3.0, Seedance 2.0 - und die Klagen von Disney & Co.
*   **Regulatory & Moral:** Pentagon vs. AI Labs, EU AI Act Umsetzung in DE/AT und was \"Alignment\" heute bedeutet.

**Für wen ist das?**
Für Unternehmer, Devs und Entscheider, die verstehen wollen, wohin die Reise geht (und zwar nicht erst in 5 Jahren, sondern nächsten Montag).
        `,
        theme: "amber",
        date: "2026-03-02T18:30:00.000Z", // 1st Monday March (19:30 CET)
        revealAt: "2026-02-03T08:00:00.000Z",
        durationHours: 3,
        location: "Penthouse Büro",
        address: "Magazinstraße 4, 5020 Salzburg",
        capacity: 25,
        takeaways: [
            "Agentic Coding Workflows & Best Practices",
            "Security & Compliance Update (EU AI Act)",
            "Latest Model Benchmarks (God Mode vs. Flash Mode)",
            "Marktübersicht: Wer gewinnt das 'Frontier' Rennen?",
            "Netzwerken mit Salzburgs KI-Szene"
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
