import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = (formData.get("password") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "कृपया PDF फ़ाइल अपलोड करें।" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const tempId = crypto.randomBytes(8).toString("hex");
    const inputPath = path.join(os.tmpdir(), `input_${tempId}.pdf`);
    const outputPath = path.join(os.tmpdir(), `unlocked_${tempId}.pdf`);

    await fs.writeFile(inputPath, fileBuffer);

    try {
      // pdftocairo द्वारा पासवर्ड डिक्रिप्ट करके नई PDF तैयार करना
      await execFileAsync("/usr/bin/pdftocairo", [
        "-pdf",
        "-upw",
        password,
        inputPath,
        outputPath
      ]);

      const unlockedBuffer = await fs.readFile(outputPath);

      // टेम्प फ़ाइलें साफ़ करना
      await Promise.all([
        fs.unlink(inputPath).catch(() => {}),
        fs.unlink(outputPath).catch(() => {})
      ]);

      return new NextResponse(unlockedBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="unlocked_${file.name || 'document.pdf'}"`,
        },
      });
    } catch (execErr: any) {
      // फ़ाइलें साफ़ करना
      await Promise.all([
        fs.unlink(inputPath).catch(() => {}),
        fs.unlink(outputPath).catch(() => {})
      ]);

      const errMsg = (execErr.stderr || execErr.message || "").toLowerCase();
      if (errMsg.includes("password") || errMsg.includes("permission") || errMsg.includes("incorrect")) {
        return NextResponse.json({ error: "गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "पासवर्ड गलत है या PDF अनलॉक नहीं हो सकी। कृपया पासवर्ड जाँचें।" },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error("PDF unlock error:", error);
    return NextResponse.json({ error: "सर्वर पर प्रोसेसिंग विफल रही।" }, { status: 500 });
  }
}
