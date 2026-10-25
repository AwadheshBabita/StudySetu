import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'इमेज डेटा नहीं मिला' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'HF_TOKEN सर्वर पर सेट नहीं है।' }, { status: 500 });
    }

    const hf = new HfInference(token);

    // बेस64 डेटा को बाइनरी ब्लॉब (Blob) में बदलना
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([buffer], { type: 'image/jpeg' });

    // Hugging Face AI मॉडल से इमेज-टू-इमेज कटिंग
    const resultBlob = await hf.imageToImage({
      model: 'briaai/RMBG-1.4',
      inputs: imageBlob,
    });

    const arrayBuffer = await resultBlob.arrayBuffer();
    const resultBase64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error: any) {
    console.error('HF Inference Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'AI प्रोसेसिंग के दौरान त्रुटि हुई।' },
      { status: 500 }
    );
  }
}
