"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EVENTS } from "@/data/events";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Settings, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export function AdminSettings() {
    const event = EVENTS[0]; // Assuming next upcoming event
    const [capacity, setCapacity] = useState<string>("25");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "events", event.id);
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().capacity) {
                setCapacity(snap.data().capacity.toString());
            }
        } catch (err) {
            console.error("Error loading settings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setStatus('saving');
        try {
            const val = parseInt(capacity);
            if (isNaN(val) || val < 0) throw new Error("Invalid number");

            await setDoc(doc(db, "events", event.id), {
                capacity: val
            }, { merge: true });

            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-theme-primary" />
                Event Settings
            </h2>

            <Card className="p-6 bg-slate-900 border-white/10 space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-white mb-1">Max Capacity (In-Person)</h3>
                    <p className="text-sm text-slate-400">
                        Set the maximum number of people allowed for {event.title}.
                        Current RSVPs will be checked against this number.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white w-32 focus:outline-none focus:border-theme-primary/50"
                        placeholder="25"
                    />
                    <Button
                        variant="signal"
                        onClick={handleSave}
                        isLoading={status === 'saving'}
                        disabled={loading}
                    >
                        {status === 'success' ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved</>
                        ) : status === 'error' ? (
                            <><AlertCircle className="w-4 h-4 mr-2" /> Error</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Capacity</>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
