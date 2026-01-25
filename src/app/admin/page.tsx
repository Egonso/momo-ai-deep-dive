"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface GeminiFile {
    name: string; // resources/files/...
    displayName: string;
    mimeType: string;
    sizeBytes: string;
    createTime: string;
    updateTime: string;
    expirationTime: string;
    sha256Hash: string;
    uri: string;
    state: string; // PROCESSING, ACTIVE, FAILED
}

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// ... (interface remains)

export default function AdminPage() {
    const router = useRouter();
    const [files, setFiles] = useState<GeminiFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email === 'mo.feich@gmail.com') {
                setAuthorized(true);
                fetchFiles();
            } else {
                setAuthorized(false);
                setLoading(false);
                router.push('/'); // Silent kick
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/files");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setFiles(data.files || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Success
            await fetchFiles(); // Refresh list
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    // Silent Loading & Auth Check
    if (loading || !authorized) return null;

    return (
        <main className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Deep Dive Admin</h1>
                        <p className="text-slate-400">RAG Knowledge Base & Gemini Management</p>
                    </div>
                    <Button variant="outline" onClick={fetchFiles} isLoading={loading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </header>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Upload Section */}
                <Card className="p-8 border-dashed border-2 border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Upload Knowledge Source</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                PDF, TXT, MD supported. Max 2GB.
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploading}
                                accept=".pdf,.txt,.md,.json"
                            />
                            <Button variant="signal" disabled={uploading}>
                                {uploading ? "Uploading..." : "Select File"}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Files List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Active Knowledge Base ({files.length})</h2>
                    {loading && files.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-2xl">
                            No files in knowledge base yet.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {files.map((file) => (
                                <Card key={file.name} className="p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-800 rounded-lg">
                                            <FileText className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{file.displayName}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                <span>{new Date(file.createTime).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded-full ${file.state === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    file.state === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {file.state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500 font-mono">
                                        {file.name}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
