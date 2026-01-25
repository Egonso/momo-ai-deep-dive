import { NextRequest, NextResponse } from "next/server";
import { fileManager } from "@/lib/gemini";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Create temp file
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempPath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
        await writeFile(tempPath, buffer);

        console.log(`Uploading to Gemini: ${file.name} (${file.type})`);

        // Upload to Gemini
        const uploadResponse = await fileManager.uploadFile(tempPath, {
            mimeType: file.type,
            displayName: file.name,
        });

        // Cleanup temp file
        await unlink(tempPath);

        console.log(`Upload success: ${uploadResponse.file.name}`);

        return NextResponse.json({ success: true, file: uploadResponse.file });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
