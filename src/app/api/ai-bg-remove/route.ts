import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'इमेज डेटा नहीं मिला' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([buffer], { type: 'image/jpeg' });

    const client = await Client.connect('briaai/BRIA-RMBG-1.4', {
      token: token as `hf_${string}`,
    });

    const result: any = await client.predict('/run', {
      image: imageBlob,
    });

    const transparentFile = result?.data?.[1] || result?.data?.[0];
    let finalBase64 = '';

    if (transparentFile?.url) {
      const imgRes = await fetch(transparentFile.url);
      const arrBuf = await imgRes.arrayBuffer();
      finalBase64 = Buffer.from(arrBuf).toString('base64');
    } else if (typeof transparentFile === 'string' && transparentFile.startsWith('data:image')) {
      finalBase64 = transparentFile.replace(/^data:image\/\w+;base64,/, '');
    } else {
      throw new Error('ट्रांसपेरेंट PNG प्राप्त नहीं हुई');
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${finalBase64}`,
    });
  } catch (error: any) {
    console.error('HF Space /run Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI बैकग्राउंड रिमूवल विफल रहा' },
      { status: 500 }
    );
  }
}
