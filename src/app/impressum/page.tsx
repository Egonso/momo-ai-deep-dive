export default function Impressum() {
    return (
        <div className="min-h-screen p-8 md:p-16 max-w-2xl mx-auto text-zinc-400">
            <h1 className="text-3xl font-bold text-white mb-8">Impressum</h1>

            <div className="space-y-8">
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Angaben gemäß § 5 TMG und § 55 RStV</h2>
                    <div>
                        <h3 className="text-white font-medium mb-1">Unternehmen</h3>
                        <p>Firmenname: ZukunftBilden GmbH</p>
                        <p>Firmenbuchnummer: 619238w</p>
                        <p>Firmenbuchgericht: Landesgericht Salzburg</p>
                        <p>UID-Nummer: ATU80187319</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Kontakt</h3>
                        <p>Anschrift: Magazinstraße 4, 5020 Salzburg, Österreich</p>
                        <p>Telefon: +43 681 81655313</p>
                        <p>E-Mail: office@momofeichtinger.com</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Geschäftszweige</h3>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Jugendzentren/Bildungszentren für Jugendliche</li>
                            <li>Pädagogische Einrichtungen für Erwachsenen- und Jugendbildung</li>
                            <li>Online-Kurse</li>
                            <li>KI-Projekte und Strategieberatung</li>
                            <li>Business Innovation und Coaching</li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Geschäftsführung</h2>
                    <div>
                        <p><strong className="text-white">Momo Maximilian Feichtinger</strong><br />Geschäftsführer & Gründer</p>
                        <p className="mt-2 text-sm">Qualifikationen: KI-, Bildungs- und Business-Stratege</p>
                        <p className="text-sm">Expertise: EU-KI-Akt, Strategieberatung, Bildungsinnovation</p>
                        <p className="text-sm">Lehrtätigkeit: Privatuniversität Schloss Seeburg, FH Salzburg, Universität Salzburg</p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Rechtliche Hinweise</h2>

                    <div>
                        <h3 className="text-white font-medium mb-1">Aufsichtsbehörde</h3>
                        <p>Bezirkshauptmannschaft Salzburg-Stadt</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Berufsbezeichnung</h3>
                        <p>KI-Stratege, Bildungsexperte, Business-Berater (verliehen in Österreich)</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Zuständige Kammer</h3>
                        <p>Wirtschaftskammer Salzburg</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Anwendbare Rechtsvorschriften</h3>
                        <ul className="list-disc pl-4 space-y-1 text-sm">
                            <li>Gewerbeordnung (GewO)</li>
                            <li>EU-Datenschutz-Grundverordnung (DSGVO)</li>
                            <li>Österreichisches Datenschutzgesetz (DSG)</li>
                            <li>EU-KI-Verordnung (AI Act)</li>
                            <li>Telemediengesetz (TMG)</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Haftungsausschluss</h3>
                        <p className="text-sm">Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
                    </div>

                    <div>
                        <h3 className="text-white font-medium mb-1">Urheberrecht</h3>
                        <p className="text-sm">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
                    </div>

                    <p className="text-sm italic">Stand: Januar 2026</p>
                    <p className="text-sm">Bei Fragen zum Impressum wenden Sie sich bitte an: <a href="mailto:office@momofeichtinger.com" className="text-theme-primary">office@momofeichtinger.com</a></p>
                </section>
            </div>
        </div>
    )
}
