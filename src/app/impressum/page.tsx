export default function Impressum() {
    return (
        <div className="min-h-screen p-8 md:p-16 max-w-2xl mx-auto text-zinc-400">
            <h1 className="text-3xl font-bold text-white mb-8">Impressum</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-white font-medium mb-2">Angaben gemäß § 5 TMG</h2>
                    <p>Momo Feichtinger</p>
                    <p>Strategenwerk</p>
                    <p>Magazinstraße 4</p>
                    <p>5020 Salzburg</p>
                    <p>Österreich</p>
                </section>

                <section>
                    <h2 className="text-white font-medium mb-2">Kontakt</h2>
                    <p>E-Mail: momo@strategenwerk.com</p>
                </section>

                <section>
                    <h2 className="text-white font-medium mb-2">Haftung für Inhalte</h2>
                    <p className="text-sm">
                        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
                    </p>
                </section>
            </div>
        </div>
    )
}
