import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execPromise = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "word-convert-"));

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "pdf";

    if (!file) {
      return NextResponse.json({ error: "कृपया एक वैध Word फ़ाइल (.docx / .doc) चुनें।" }, { status: 400 });
    }

    const originalName = file.name || "document.docx";
    const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, "_");
    const inputFilePath = path.join(tempDir, originalName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputFilePath, buffer);

    const libreOfficeCmd = `soffice --headless --convert-to "pdf:writer_pdf_Export" --outdir "${tempDir}" "${inputFilePath}"`;
    await execPromise(libreOfficeCmd, { timeout: 45000 });

    const expectedPdfPath = path.join(tempDir, `${path.parse(originalName).name}.pdf`);
    
    try {
      await fs.access(expectedPdfPath);
    } catch {
      throw new Error("PDF फ़ाइल जनरेट नहीं हो सकी।");
    }

    if (format === "pdf") {
      const pdfBuffer = await fs.readFile(expectedPdfPath);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(baseName)}.pdf"`,
        },
      });
    }

    const jpgPrefix = path.join(tempDir, "page");
    const ppmCmd = `pdftoppm -jpeg -r 300 -aa yes -aaVector yes -jpegopt quality=100,chroma_subsample=4:4:4 "${expectedPdfPath}" "${jpgPrefix}"`;
    await execPromise(ppmCmd, { timeout: 45000 });

    const filesInTemp = await fs.readdir(tempDir);
    const jpgFiles = filesInTemp.filter((f) => f.startsWith("page-") && f.endsWith(".jpg")).sort();

    if (jpgFiles.length === 0) {
      throw new Error("JPG इमेज जनरेट करने में समस्या आई।");
    }

    const singleJpgPath = path.join(tempDir, jpgFiles[0]);
    const jpgBuffer = await fs.readFile(singleJpgPath);
    return new NextResponse(jpgBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(baseName)}.jpg"`,
      },
    });

  } catch (error: any) {
    console.error("Word conversion error:", error);
    return NextResponse.json(
      { error: error.message || "फ़ाइल कन्वर्जन के दौरान कोई तकनीकी समस्या आई।" },
      { status: 500 }
    );
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }
  }
}
