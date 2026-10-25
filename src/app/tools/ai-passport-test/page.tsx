'use client';

import React, { useState } from 'react';

export default function AIPassportTest() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [statusText, setStatusText] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
      setProcessedImage(null);
      setStatusText('फोटो लोड हो गई। "AI कटिंग (फास्ट)" पर क्लिक करें।');
    }
  };

  // भारी फोटो को AI के लिए ऑप्टिमाइज करने वाला हेल्पर
  const optimizeImage = (srcUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxDim = 1024;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context error');

        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Blob conversion failed');
        }, 'image/jpeg', 0.95);
      };
      img.onerror = reject;
      img.src = srcUrl;
    });
  };

  // बालों के किनारों से सफेद जाला (Fringe) हटाने वाला फिल्टर
  const cleanEdges = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(URL.createObjectURL(blob));

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // सेमी-ट्रांसपेरेंट पिक्सल्स की सफाई
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 40) {
            data[i + 3] = 0;
          } else if (alpha < 220) {
            // किनारे के सफेद पिक्सल को खत्म करके डार्क करना
            data[i] = Math.min(data[i], data[i] * (alpha / 255));
            data[i + 1] = Math.min(data[i + 1], data[i + 1] * (alpha / 255));
            data[i + 2] = Math.min(data[i + 2], data[i + 2] * (alpha / 255));
            data[i + 3] = Math.min(255, alpha * 1.25);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const removeBackgroundAI = async () => {
    if (!originalImage) return;

    try {
      setLoading(true);
      setStatusText('फोटो ऑप्टिमाइज़ हो रही है और AI कटिंग चालू है...');

      const optimizedBlob = await optimizeImage(originalImage);

      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = await removeBackground(optimizedBlob, {
        model: 'medium', // तेज और सटीक कटिंग
        output: {
          format: 'image/png',
          quality: 0.95
        }
      });

      setStatusText('किनारों और बालों की फिनिशिंग हो रही है...');
      const cleanedUrl = await cleanEdges(resultBlob);

      setProcessedImage(cleanedUrl);
      setStatusText('कटिंग पूरी! अब अपनी पसंद का रंग चुनें।');
    } catch (error) {
      console.error(error);
      setStatusText('एरर आया। कृपया दोबारा प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '20px auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: '4px' }}>
        AI पासपोर्ट बैकग्राउंड कटिंग (v2 - फास्ट)
      </h3>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        ऑप्टिमाइज़्ड स्पीड + बालों की शार्प कटिंग
      </p>

      <div style={{ border: '2px dashed #93c5fd', borderRadius: '10px', padding: '18px', textAlign: 'center', background: '#eff6ff' }}>
        <input
          type="file"
          accept="image/*"
          id="photo-input"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="photo-input"
          style={{ display: 'inline-block', padding: '10px 18px', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          फोटो बदलें / चुनें
        </label>
      </div>

      {statusText && (
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: loading ? '#d97706' : '#16a34a' }}>
          {statusText}
        </p>
      )}

      {originalImage && !processedImage && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <img
            src={originalImage}
            alt="Original"
            style={{ maxWidth: '180px', maxHeight: '220px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={removeBackgroundAI}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'प्रोसेसिंग चालू है...' : 'AI कटिंग (फास्ट)'}
            </button>
          </div>
        </div>
      )}

      {processedImage && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>बैकग्राउंड का रंग:</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            {[
              { name: 'सफेद', color: '#ffffff' },
              { name: 'हल्का नीला', color: '#bfdbfe' },
              { name: 'गहरा नीला', color: '#1d4ed8' },
              { name: 'हल्का ग्रे', color: '#e5e7eb' },
              { name: 'लाल', color: '#ef4444' }
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => setBgColor(c.color)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: c.color,
                  border: bgColor === c.color ? '3px solid #000' : '1px solid #ccc',
                  cursor: 'pointer'
                }}
                title={c.name}
              />
            ))}
          </div>

          <div style={{ display: 'inline-block', padding: '6px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
            <div
              style={{
                width: '180px',
                height: '230px',
                backgroundColor: bgColor,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <img
                src={processedImage}
                alt="AI Passport Result"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
