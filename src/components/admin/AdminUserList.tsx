"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EVENTS } from "@/data/events";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Trash2, Edit2, MessageSquare, Check, X, UserPlus, Users, Download } from "lucide-react";

interface RsvpData {
    id: string; // Document ID
    uid: string;
    userName: string;
    userEmail: string;
    userPhoto?: string;
    type: 'in-person' | 'online';
    status: string;
    attendees?: { name: string; email: string; whatsapp?: string }[];
    adminNotes?: string;
    timestamp: string;
    isManual?: boolean;
    checkedIn?: boolean; // New field
}

export function AdminUserList() {
    const [rsvps, setRsvps] = useState<RsvpData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState("");

    // Scanner State
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean, message: string } | null>(null);

    // Use the next active event for context
    const activeEventId = EVENTS[0].id; // "feb-2026-skills"

    const fetchRsvps = async () => {
        setLoading(true);
        try {
            // Fetch all RSVPs for this event
            // Note: In a real large app, we'd index this. For <100 users, finding all is fine.
            const q = query(collection(db, "rsvps"), where("eventId", "==", activeEventId));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RsvpData[];

            // Sort by timestamp desc
            data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setRsvps(data);
        } catch (err) {
            console.error("Error fetching RSVPs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRsvps();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Wirklich löschen? Das Ticket wird ungültig.")) return;
        try {
            await deleteDoc(doc(db, "rsvps", id));
            setRsvps(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("Fehler beim Löschen");
        }
    };

    const startEditNote = (rsvp: RsvpData) => {
        setEditingNote(rsvp.id);
        setNoteInput(rsvp.adminNotes || "");
    };

    const saveNote = async (id: string) => {
        try {
            await updateDoc(doc(db, "rsvps", id), {
                adminNotes: noteInput
            });
            setRsvps(prev => prev.map(r => r.id === id ? { ...r, adminNotes: noteInput } : r));
            setEditingNote(null);
        } catch (err) {
            console.error("Failed to save note", err);
        }
    };

    // Check-In Logic
    const toggleCheckIn = async (rsvp: RsvpData) => {
        const newState = !rsvp.checkedIn;
        try {
            await updateDoc(doc(db, "rsvps", rsvp.id), { checkedIn: newState });
            setRsvps(prev => prev.map(r => r.id === rsvp.id ? { ...r, checkedIn: newState } : r));
        } catch (err) {
            alert("Check-in failed");
        }
    };

    // Scanner Logic
    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(async (decodedText) => {
                // Parse VEVENT: DESCRIPTION:Ref:USER_ID
                const match = decodedText.match(/Ref:([^\s|]+)/); // Matches Ref:UID up to space or pipe
                if (match && match[1]) {
                    const uid = match[1];
                    const rsvp = rsvps.find(r => r.uid === uid);

                    if (rsvp) {
                        if (rsvp.checkedIn) {
                            setScanResult({ success: false, message: `⚠️ ${rsvp.userName} already checked in!` });
                        } else {
                            await toggleCheckIn(rsvp);
                            setScanResult({ success: true, message: `✅ Check-In: ${rsvp.userName}` });
                        }
                    } else {
                        setScanResult({ success: false, message: `❌ Ticket not found for UID: ${uid}` });
                    }
                } else {
                    setScanResult({ success: false, message: "❌ Invalid QR Format (No Ref found)" });
                }

                // Optional: Auto-pause or clear
                // scanner.clear();
                // setScanning(false);
            }, (error) => {
                // ignore errors handles mostly
            });

            return () => {
                scanner.clear().catch(e => console.error(e));
            };
        }
    }, [scanning, rsvps]);

    const filteredRsvps = rsvps.filter(r =>
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.adminNotes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: rsvps.length,
        checkedIn: rsvps.filter(r => r.checkedIn).length, // New Stat
        inPerson: rsvps.filter(r => r.type === 'in-person').length,
        online: rsvps.filter(r => r.type === 'online').length,
        guests: rsvps.reduce((acc, curr) => acc + (curr.attendees?.length || 0) + 1, 0) // +1 for the main user if we count them as an attendee, but attendees array currently INCLUDES the guests only? No, in RsvpFlow: attendees array currently INCLUDES the guests only? No, in RsvpFlow: attendees array usually holds everyone? Wait.
        // In RsvpFlow.tsx: "setAttendees([{ name: u.displayName... }])" -> The first entry IS the user.
        // So attendees.length is the total headcount for that RSVP.
        // However, we should verify data structure. 
        // If attendees is present, use its length. If not (old data?), 1.
    };

    // Correction on stats based on RsvpFlow logic:
    // User is always attendee[0]. Guests are attendee[1+].
    const headCount = rsvps.reduce((acc, curr) => acc + (curr.attendees?.length || 1), 0);
    const inPersonCount = rsvps.filter(r => r.type === 'in-person').reduce((acc, curr) => acc + (curr.attendees?.length || 1), 0);

    const handleExport = () => {
        // Flatten all attendees
        const rows = filteredRsvps.flatMap(rsvp => {
            // If we have an attendees array, use that. The first one is usually the main user.
            if (rsvp.attendees && rsvp.attendees.length > 0) {
                return rsvp.attendees.map((a, index) => ({
                    GroupLeader: rsvp.userName,
                    Name: a.name,
                    Email: a.email,
                    WhatsApp: a.whatsapp || '',
                    Role: index === 0 ? 'Leader' : 'Guest',
                    TicketType: rsvp.type,
                    CheckedIn: rsvp.checkedIn ? 'YES' : 'NO',
                    AdminNotes: rsvp.adminNotes || '',
                    Timestamp: new Date(rsvp.timestamp).toLocaleString()
                }));
            } else {
                // Legacy fallback if no attendees array
                return [{
                    GroupLeader: rsvp.userName,
                    Name: rsvp.userName,
                    Email: rsvp.userEmail,
                    WhatsApp: '',
                    Role: 'Leader',
                    TicketType: rsvp.type,
                    CheckedIn: rsvp.checkedIn ? 'YES' : 'NO',
                    AdminNotes: rsvp.adminNotes || '',
                    Timestamp: new Date(rsvp.timestamp).toLocaleString()
                }];
            }
        });

        const headers = ["GroupLeader", "Name", "Email", "WhatsApp", "Role", "TicketType", "CheckedIn", "AdminNotes", "Timestamp"];
        const csvContent = [
            headers.join(","),
            ...rows.map(row => headers.map(header => {
                const val = (row as any)[header];
                return `"${String(val).replace(/"/g, '""')}"`; // Escape quotes
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `rsvps_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">Total RSVPs</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-xl">
                    <p className="text-xs text-green-400 uppercase">Checked In</p>
                    <p className="text-2xl font-bold text-green-300">{stats.checkedIn}</p>
                </div>
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">Headcount (Guests)</p>
                    <p className="text-2xl font-bold text-white">{headCount}</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl">
                    <p className="text-xs text-emerald-400 uppercase">In-Person</p>
                    <p className="text-2xl font-bold text-emerald-300">{inPersonCount}</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
                    <p className="text-xs text-blue-400 uppercase">Online Stream</p>
                    <p className="text-2xl font-bold text-blue-300">{stats.online}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users, emails, notes..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-theme-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="signal" onClick={() => setScanning(true)} className="bg-purple-600 hover:bg-purple-500 text-white border-purple-400/50">
                    📸 Scan Ticket
                </Button>
                <Button variant="outline" onClick={fetchRsvps} title="Refresh">
                    Refresh
                </Button>
                <Button variant="signal" onClick={handleExport} title="Download CSV">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* SCANNER MODAL */}
            {scanning && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                        <button onClick={() => { setScanning(false); setScanResult(null); }} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"><X className="w-4 h-4" /></button>
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white text-center">Scan Ticket QR</h3>
                        </div>
                        <div className="p-4">
                            <div id="reader" className="w-full rounded-lg overflow-hidden bg-black aspect-square"></div>
                            {scanResult && (
                                <div className={`mt-4 p-4 rounded-xl text-center font-bold ${scanResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {scanResult.message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Attendee</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Ticket</th>
                                <th className="px-6 py-3">Group</th>
                                <th className="px-6 py-3">Admin Notes</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading data...</td>
                                </tr>
                            ) : filteredRsvps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No attendees found.</td>
                                </tr>
                            ) : (
                                filteredRsvps.map((rsvp) => (
                                    <tr key={rsvp.id} className={`hover:bg-white/5 transition-colors group ${rsvp.checkedIn ? 'bg-green-900/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleCheckIn(rsvp)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${rsvp.checkedIn ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                                title={rsvp.checkedIn ? "Checked In (Click to undo)" : "Click to Check In"}
                                            >
                                                {rsvp.checkedIn ? <Check className="w-4 h-4 font-bold" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {rsvp.userPhoto ? (
                                                    <img src={rsvp.userPhoto} alt="" className={`w-8 h-8 rounded-full ${rsvp.checkedIn ? 'border-2 border-green-500' : 'bg-slate-800'}`} />
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rsvp.checkedIn ? 'bg-green-500/20 text-green-300' : 'bg-slate-800 text-slate-400'}`}>
                                                        {(rsvp.userName || 'U')[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={`font-medium ${rsvp.checkedIn ? 'text-green-300' : 'text-white'}`}>{rsvp.userName || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{rsvp.userEmail}</div>
                                                    {rsvp.isManual && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 rounded ml-1">MANUAL</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                            {rsvp.attendees?.[0]?.whatsapp || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={rsvp.type === 'in-person' ? 'success' : 'info'}>
                                                {rsvp.type === 'in-person' ? 'Penthouse' : 'Online'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Users className="w-3 h-3" />
                                                <span>{rsvp.attendees?.length || 1}</span>
                                            </div>
                                            {rsvp.attendees && rsvp.attendees.length > 1 && (
                                                <div className="text-[10px] text-slate-600 mt-1 truncate max-w-[150px]">
                                                    {rsvp.attendees.slice(1).map(a => a.name).join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingNote === rsvp.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-white w-full focus:border-theme-primary"
                                                        value={noteInput}
                                                        onChange={(e) => setNoteInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveNote(rsvp.id)}
                                                    />
                                                    <button onClick={() => saveNote(rsvp.id)} className="text-green-400 hover:bg-green-400/10 p-1 rounded"><Check className="w-3 h-3" /></button>
                                                    <button onClick={() => setEditingNote(null)} className="text-red-400 hover:bg-red-400/10 p-1 rounded"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => startEditNote(rsvp)}
                                                    className="cursor-pointer hover:text-white text-slate-400 text-xs flex items-center gap-2 min-h-[20px]"
                                                >
                                                    {rsvp.adminNotes ? (
                                                        <span className="text-theme-primary">{rsvp.adminNotes}</span>
                                                    ) : (
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-600">
                                                            <Edit2 className="w-3 h-3" /> Add Note
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={`mailto:${rsvp.userEmail}`} title="Email User" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(rsvp.id)}
                                                    title="Delete Ticket"
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
