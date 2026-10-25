'use client';

import React, { useState, useRef } from 'react';

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
      setStatusText('फोटो अपलोड हो गई। अब "AI से बैकग्राउंड हटाएँ" पर क्लिक करें।');
    }
  };

  const removeBackgroundAI = async () => {
    if (!originalImage) return;

    try {
      setLoading(true);
      setStatusText('AI मॉडल लोड हो रहा है और बैकग्राउंड हटाया जा रहा है... (पहली बार में कुछ सेकंड लगेंगे)');

      // डायनामिक इम्पोर्ट ताकि बंडल साइज़ हल्का रहे
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(originalImage);
      const url = URL.createObjectURL(blob);

      setProcessedImage(url);
      setStatusText('बैकग्राउंड सफलतापूर्वक हट गया! अब मनपसंद रंग चुनें।');
    } catch (error) {
      console.error(error);
      setStatusText('बैकग्राउंड हटाने में समस्या आई। कृपया दोबारा प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: '8px' }}>
        AI पासपोर्ट फोटो टेस्ट लैब
      </h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        (100% प्राइवेट: फोटो सीधे आपके मोबाइल में प्रोसेस होगी)
      </p>

      {/* फोटो अपलोड */}
      <div style={{ border: '2px dashed #93c5fd', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#eff6ff' }}>
        <input
          type="file"
          accept="image/*"
          id="photo-input"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="photo-input"
          style={{ display: 'inline-block', padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          फोटो चुनें (कैमरा / गैलरी)
        </label>
      </div>

      {statusText && (
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: loading ? '#d97706' : '#16a34a' }}>
          {statusText}
        </p>
      )}

      {/* मूल फोटो एवं AI बटन */}
      {originalImage && !processedImage && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <img
            src={originalImage}
            alt="Original"
            style={{ maxWidth: '200px', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={removeBackgroundAI}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'प्रोसेसिंग चालू है...' : 'AI से बैकग्राउंड हटाएँ'}
            </button>
          </div>
        </div>
      )}

      {/* प्रोसेस की गई फोटो और बैकग्राउंड कलर विकल्प */}
      {processedImage && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <h4 style={{ marginBottom: '12px' }}>बैकग्राउंड का रंग चुनें:</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: c.color,
                  border: bgColor === c.color ? '3px solid #000' : '1px solid #ccc',
                  cursor: 'pointer'
                }}
                title={c.name}
              />
            ))}
          </div>

          {/* पासपोर्ट फोटो प्रीव्यू (3.5cm x 4.5cm रेशियो) */}
          <div style={{ display: 'inline-block', padding: '6px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff' }}>
            <div
              style={{
                width: '175px',
                height: '225px',
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
