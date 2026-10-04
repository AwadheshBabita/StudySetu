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
      return NextResponse.json({ error: "कृपया एक PDF फ़ाइल चुनें।" }, { status: 400 });
    }
    if (!password.trim()) {
      return NextResponse.json({ error: "कृपया पासवर्ड दर्ज करें।" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const tempId = crypto.randomBytes(8).toString("hex");
    const inputPath = path.join(os.tmpdir(), `in_prot_${tempId}.pdf`);
    const outputPath = path.join(os.tmpdir(), `out_prot_${tempId}.pdf`);

    await fs.writeFile(inputPath, fileBuffer);

    const pyScript = `
import sys
from pypdf import PdfReader, PdfWriter

inp = sys.argv[1]
out = sys.argv[2]
pwd = sys.argv[3]

reader = PdfReader(inp)
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt(user_password=pwd, owner_password=pwd + "_admin", algorithm="AES-128")

with open(out, "wb") as f:
    writer.write(f)
`;

    try {
      await execFileAsync("python3", ["-c", pyScript, inputPath, outputPath, password]);

      const lockedBuffer = await fs.readFile(outputPath);

      await Promise.all([
        fs.unlink(inputPath).catch(() => {}),
        fs.unlink(outputPath).catch(() => {})
      ]);

      return new NextResponse(lockedBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="locked_${file.name || 'document.pdf'}"`,
        },
      });
    } catch (pyErr: any) {
      await Promise.all([
        fs.unlink(inputPath).catch(() => {}),
        fs.unlink(outputPath).catch(() => {})
      ]);

      console.error("Encryption error:", pyErr);
      return NextResponse.json(
        { error: "PDF में पासवर्ड लगाने में त्रुटि आई। कृपया फ़ाइल जाँचें।" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Protect route error:", error);
    return NextResponse.json({ error: "सर्वर पर प्रोसेसिंग विफल रही।" }, { status: 500 });
  }
}
