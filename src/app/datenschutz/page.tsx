export default function Datenschutz() {
    return (
        <div className="min-h-screen p-8 md:p-16 max-w-2xl mx-auto text-zinc-400">
            <h1 className="text-3xl font-bold text-white mb-8">Datenschutzerklärung</h1>

            <div className="space-y-6 text-sm">
                <section>
                    <h2 className="text-white text-base font-medium mb-2">1. Datenschutz auf einen Blick</h2>
                    <p>
                        Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </p>
                </section>

                <section>
                    <h2 className="text-white text-base font-medium mb-2">2. Hosting & Content Delivery Networks (CDN)</h2>
                    <p>
                        Diese Website wird bei Vercel gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                    </p>
                </section>

                <section>
                    <h2 className="text-white text-base font-medium mb-2">3. Datenerfassung auf dieser Website</h2>
                    <p>
                        <strong>Google Sign-In / Firebase Auth:</strong> Wenn Sie sich anmelden, nutzen wir Firebase Authentication (Google), um Ihre Identität zu verifizieren. Wir speichern nur technisch notwendige Cookies.
                    </p>
                </section>
            </div>
        </div>
    )
}
