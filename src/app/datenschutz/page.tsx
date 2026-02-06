export default function Datenschutz() {
    return (
        <div className="min-h-screen p-8 md:p-16 max-w-3xl mx-auto text-zinc-400">
            <h1 className="text-3xl font-bold text-white mb-2">Datenschutzerklärung</h1>
            <p className="mb-8">Gemäß EU-Datenschutz-Grundverordnung (DSGVO)</p>

            <div className="space-y-8 text-sm leading-relaxed">

                {/* 1. Übersicht */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Datenschutz auf einen Blick</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h3 className="text-white font-bold mb-2">Minimale Daten</h3>
                            <p className="text-xs">Wir erheben nur die Daten, die für unsere Services notwendig sind.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h3 className="text-white font-bold mb-2">Transparenz</h3>
                            <p className="text-xs">Sie wissen immer, welche Daten wir haben und wofür wir sie nutzen.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h3 className="text-white font-bold mb-2">Ihre Rechte</h3>
                            <p className="text-xs">Auskunft, Berichtigung, Löschung - Sie haben die volle Kontrolle.</p>
                        </div>
                    </div>
                </section>

                {/* 2. Verantwortlicher */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Verantwortlicher</h2>
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-xl">
                        <p><strong className="text-white">ZukunftBilden GmbH</strong></p>
                        <p>Magazinstraße 4, 5020 Salzburg, Österreich</p>
                        <p>Firmenbuchnummer: 619238w</p>
                        <br />
                        <p><strong>Geschäftsführer:</strong> Momo Maximilian Feichtinger</p>
                        <p><strong>E-Mail:</strong> <a href="mailto:office@momofeichtinger.com" className="text-theme-primary">office@momofeichtinger.com</a></p>
                        <p><strong>Telefon:</strong> +43 681 81655313</p>
                        <p><strong>Datenschutz:</strong> <a href="mailto:datenschutz@momofeichtinger.com" className="text-theme-primary">datenschutz@momofeichtinger.com</a></p>
                    </div>
                </section>

                {/* 3. Welche Daten */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Welche Daten erheben wir?</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-white font-medium mb-1">1. Automatisch erhobene Daten</h3>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Server-Log-Dateien: IP-Adresse, Browser-Typ, Betriebssystem, Referrer-URL, Datum und Uhrzeit des Zugriffs</li>
                                <li>Cookies: Technisch notwendige Cookies für die Funktionalität der Website</li>
                                <li>Nutzungsstatistiken: Anonymisierte Daten über die Nutzung unserer Website</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-1">2. Von Ihnen bereitgestellte Daten</h3>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Kontaktformular: Name, E-Mail-Adresse, Nachricht</li>
                                <li>Newsletter-Anmeldung: E-Mail-Adresse, optional Name</li>
                                <li>Community-Mitgliedschaft: Name, E-Mail, Profilinformationen, Zahlungsdaten (verschlüsselt)</li>
                                <li>Beratungsanfragen: Kontaktdaten, Unternehmensinformationen, Projektdetails</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 4. Zweck & Rechtsgrundlage */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Zweck der Datenverarbeitung</h2>
                    <p>Rechtsgrundlagen (Art. 6 DSGVO):</p>
                    <div className="grid gap-2">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-theme-primary font-bold">Art. 6 (1) a</span> Einwilligung: Newsletter, Marketing-Kommunikation, Community-Teilnahme
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-theme-primary font-bold">Art. 6 (1) b</span> Vertragserfüllung: Bereitstellung unserer Services, Zahlungsabwicklung
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-theme-primary font-bold">Art. 6 (1) c</span> Rechtliche Verpflichtung: Steuerliche Aufbewahrungspflichten, Rechnungsstellung
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-theme-primary font-bold">Art. 6 (1) f</span> Berechtigtes Interesse: Website-Sicherheit, Spam-Schutz, Geschäftsentwicklung
                        </div>
                    </div>
                </section>

                {/* 5. Datenweitergabe */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Datenweitergabe und Drittanbieter</h2>
                    <ul className="space-y-4">
                        <li>
                            <strong className="text-white block">Hosting-Anbieter (Netlify/Vercel)</strong>
                            Standort: USA/Global, Datenschutzabkommen: Standard Contractual Clauses<br />
                            Zweck: Website-Bereitstellung und -Performance
                        </li>
                        <li>
                            <strong className="text-white block">E-Mail-Service-Provider / Firebase Auth</strong>
                            Standort: USA/Global, DSGVO-konform (SCCs)<br />
                            Zweck: Authentifizierung, Newsletter-Versand, Transaktions-E-Mails
                        </li>
                    </ul>
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-xs">
                        <strong>Wichtiger Hinweis zu Drittländern:</strong> Einige unserer Dienstleister haben ihren Sitz in Drittländern (außerhalb der EU). In diesen Fällen stellen wir durch geeignete Garantien (wie Standard Contractual Clauses) sicher, dass Ihre Daten angemessen geschützt sind.
                    </div>
                </section>

                {/* 6. Speicherdauer */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Speicherdauer</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-white font-medium mb-1">Automatische Löschung</h3>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Server-Logs: 30 Tage</li>
                                <li>Cookies: Nach Session oder 1 Jahr</li>
                                <li>Newsletter: Bis zum Widerruf</li>
                                <li>Kontaktanfragen: 2 Jahre</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-medium mb-1">Gesetzliche Aufbewahrung</h3>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Rechnungen: 7 Jahre (UGB)</li>
                                <li>Verträge: 7 Jahre (UGB)</li>
                                <li>Steuerunterlagen: 7 Jahre (BAO)</li>
                                <li>Mitgliedsdaten: Während der Mitgliedschaft + 3 Jahre</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 7. Rechte */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Ihre Rechte</h2>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white/5 rounded border border-white/5">🔍 Auskunftsrecht (Art. 15 DSGVO)</div>
                        <div className="p-3 bg-white/5 rounded border border-white/5">✏️ Berichtigungsrecht (Art. 16 DSGVO)</div>
                        <div className="p-3 bg-white/5 rounded border border-white/5">🗑️ Löschungsrecht (Art. 17 DSGVO)</div>
                        <div className="p-3 bg-white/5 rounded border border-white/5">⏸️ Einschränkungsrecht (Art. 18 DSGVO)</div>
                        <div className="p-3 bg-white/5 rounded border border-white/5">📤 Datenübertragbarkeit (Art. 20 DSGVO)</div>
                        <div className="p-3 bg-white/5 rounded border border-white/5">❌ Widerspruchsrecht (Art. 21 DSGVO)</div>
                    </div>
                    <p>
                        So können Sie Ihre Rechte ausüben: <br />
                        E-Mail: <a href="mailto:datenschutz@momofeichtinger.com" className="text-theme-primary">datenschutz@momofeichtinger.com</a> <br />
                        Wir antworten innerhalb von 30 Tagen auf Ihre Anfrage.
                    </p>
                </section>

                {/* 8. Datensicherheit */}
                <section className="space-y-4">
                    <h2 className="text-white text-lg font-medium">Datensicherheit</h2>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>SSL/TLS-Verschlüsselung (HTTPS)</li>
                        <li>Sichere Server-Infrastruktur & Firewalls</li>
                        <li>Zugriffskontrolle & Backups</li>
                    </ul>
                </section>

                {/* 9. Änderung */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <p><strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde (z.B. Österreichische Datenschutzbehörde, dsb.gv.at) zu beschweren.</p>
                    <p>
                        <strong>Änderungen dieser Datenschutzerklärung:</strong> Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an geänderte Rechtslagen oder bei Änderungen unserer Services anzupassen.
                    </p>
                    <p className="italic">Letzte Aktualisierung: Januar 2026</p>
                </section>
            </div>
        </div>
    )
}
