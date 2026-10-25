import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'इमेज डेटा नहीं मिला' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'HF_TOKEN सेट नहीं है' }, { status: 500 });
    }

    // बेस64 को बाइनरी बफर में बदलना
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Hugging Face RMBG-1.4 मॉडल कॉल
    const response = await fetch(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
        method: 'POST',
        body: buffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('HF API Error:', errText);
      return NextResponse.json({ error: 'AI मॉडल से रिस्पांस नहीं मिला', details: errText }, { status: 502 });
    }

    const imageArrayBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(imageArrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error: any) {
    console.error('Server Route Error:', error);
    return NextResponse.json({ error: error.message || 'इंटरनल सर्वर एरर' }, { status: 500 });
  }
}
