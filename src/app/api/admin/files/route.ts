import { NextResponse } from "next/server";
import { fileManager } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await fileManager.listFiles();
        return NextResponse.json({ files: result.files });
    } catch (error: any) {
        console.error("List files error:", error);
        return NextResponse.json({ error: error.message || "Failed to list files" }, { status: 500 });
    }
}
