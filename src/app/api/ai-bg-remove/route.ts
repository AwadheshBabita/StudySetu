import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'इमेज डेटा नहीं मिला' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      console.error('HF_TOKEN is missing in environment variables');
      return NextResponse.json({ error: 'HF_TOKEN सर्वर पर नहीं मिला। Vercel में Environment Variable चेक करें।' }, { status: 500 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Hugging Face RMBG-1.4 Inference Call
    let response = await fetch(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'x-wait-for-model': 'true', // मॉडल लोड होने तक इंतज़ार करने का फ़्लैग
        },
        method: 'POST',
        body: buffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('HF API Error Response:', response.status, errText);
      return NextResponse.json({ error: `AI मॉडल एरर (${response.status}): ${errText}` }, { status: 502 });
    }

    const imageArrayBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(imageArrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error: any) {
    console.error('Server Route Internal Error:', error);
    return NextResponse.json({ error: error.message || 'इंटरनल सर्वर एरर' }, { status: 500 });
  }
}
