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

    const result = await client.predict('/predict', {
      image: imageBlob,
    });

    const outputData: any = (result as any).data?.[0];
    let finalBase64 = '';

    if (outputData?.url) {
      const imgRes = await fetch(outputData.url);
      const arrBuf = await imgRes.arrayBuffer();
      finalBase64 = Buffer.from(arrBuf).toString('base64');
    } else if (typeof outputData === 'string' && outputData.startsWith('data:image')) {
      finalBase64 = outputData.replace(/^data:image\/\w+;base64,/, '');
    } else {
      throw new Error('AI स्पेस से आउटपुट प्राप्त नहीं हुआ');
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${finalBase64}`,
    });
  } catch (error: any) {
    console.error('HF Space Execution Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI बैकग्राउंड रिमूवल विफल रहा' },
      { status: 500 }
    );
  }
}
