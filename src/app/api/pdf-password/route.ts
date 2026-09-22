import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let password = (formData.get('password') as string) || '';
    const action = (formData.get('action') as string) || 'unlock';

    if (!file) {
      return NextResponse.json({ error: 'कृपया PDF फ़ाइल चुनें।' }, { status: 400 });
    }

    password = password.trim();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = os.tmpdir();
    const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(7);
    const inputPath = path.join(tempDir, `in_${uniqueId}.pdf`);
    const outputPath = path.join(tempDir, `out_${uniqueId}.pdf`);

    await fs.writeFile(inputPath, buffer);

    try {
      const safePassword = password.replace(/(["\\$`])/g, '\\$1');

      if (action === 'unlock') {
        // pdfdetach / pdfseparate या qpdf / gs से डिक्रिप्ट करने का यूनिवर्सल कमांड
        // यदि qpdf न हो तो ghostscript सीधे अनलॉक कर देता है
        const unlockCmd = `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sPDFPassword="${safePassword}" -sOutputFile="${outputPath}" "${inputPath}" 2>&1`;

        try {
          await execAsync(unlockCmd);
        } catch (gsErr: any) {
          throw new Error('पासवर्ड अमान्य है या फ़ाइल एन्क्रिप्शन समर्थित नहीं है।');
        }
      } else {
        // पासवर्ड लगाने का कमांड (Ghostscript)
        const lockCmd = `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOwnerPassword="${safePassword}" -sUserPassword="${safePassword}" -sOutputFile="${outputPath}" "${inputPath}" 2>&1`;
        await execAsync(lockCmd);
      }

      // जाँचें कि आउटपुट फ़ाइल बनी या नहीं
      const outputBuffer = await fs.readFile(outputPath);

      await Promise.all([
        fs.unlink(inputPath).catch(() => {}),
        fs.unlink(outputPath).catch(() => {}),
      ]);

      return new NextResponse(outputBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${action === 'unlock' ? 'unlocked.pdf' : 'protected.pdf'}"`,
        },
      });
    } catch (cmdErr: any) {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
      return NextResponse.json({ error: 'पासवर्ड सही नहीं है। कृपया दोबारा जाँचें।' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'सर्वर पर फ़ाइल प्रोसेस नहीं हो सकी।' }, { status: 500 });
  }
}
