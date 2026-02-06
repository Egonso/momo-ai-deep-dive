export default function CodeOfConduct() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-300 p-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white font-display">Code of Conduct</h1>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">1. Kurzfassung</h2>
                    <p>Sei kein Arschloch. Wir sind hier, um zu lernen und uns auszutauschen.</p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">2. Respekt</h2>
                    <p>
                        Wir tolerieren keine Belästigung von Teilnehmern in irgendeiner Form.
                        Dazu gehören beleidigende Kommentare zu Geschlecht, sexueller Orientierung,
                        Behinderung, physischem Aussehen, Körpergröße, Rasse oder Religion.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">3. Teilen</h2>
                    <p>
                        Was im Deep Dive passiert, darf geteilt werden (Chatham House Rule gilt nicht, außer explizit erwähnt).
                        Aber respektiere die Privatsphäre anderer.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10">
                    <a href="/" className="text-theme-primary hover:underline">← Zurück zum Event</a>
                </div>
            </div>
        </main>
    )
}
