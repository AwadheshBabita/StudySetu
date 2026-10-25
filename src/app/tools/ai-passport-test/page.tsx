'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function AIPassportWorkflow() {
  const [step, setStep] = useState<number>(1); // 1: अपलोड, 2: क्रॉप, 3: AI बैकग्राउंड व फ़िनिश
  const [upImg, setUpImg] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // क्रॉप स्टेट (पासपोर्ट अनुपात 3.5 : 4.5 = ~0.77)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 70,
    height: 90,
    x: 15,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [brightness, setBrightness] = useState<number>(100);

  // AI और आउटपुट स्टेट
  const [croppedBase64, setCroppedBase64] = useState<string | null>(null);
  const [bgRemovedPng, setBgRemovedPng] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  // नाम व तारीख विकल्प
  const [addNameDate, setAddNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>('');

  // 1. फ़ोटो अपलोड हैंडलर
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setUpImg(reader.result?.toString() || '');
        setStep(2);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // 2. क्रॉप कैनवस तैयार करना
  const getCroppedImgCanvas = (): HTMLCanvasElement | null => {
    if (!completedCrop || !imgRef.current) return null;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // पासपोर्ट 300 DPI स्टैंडर्ड (413 x 531 पिक्सल)
    canvas.width = 413;
    canvas.height = 531;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.filter = `brightness(${brightness}%)`;
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      413,
      531
    );

    return canvas;
  };

  // 3. क्रॉप सहेजना और AI कटिंग चालू करना
  const processCropAndAI = async () => {
    const canvas = getCroppedImgCanvas();
    if (!canvas) return;

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCroppedBase64(croppedDataUrl);
    setStep(3);

    try {
      setLoading(true);
      setStatusText('क्रॉप की गई फ़ोटो से AI बैकग्राउंड रिमूव हो रहा है...');

      // Blob बनाकर AI मॉडल में भेजना
      const blob = await (await fetch(croppedDataUrl)).blob();
      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = await removeBackground(blob, {
        output: { format: 'image/png', quality: 0.95 }
      });

      // बालों के किनारों से सफेद जाला हटाने का ऑटो-फ़िल्टर
      const cleanUrl = await cleanFringe(resultBlob);
      setBgRemovedPng(cleanUrl);
      setStatusText('बैकग्राउंड सफलतापूर्वक हट गया! रंग या नाम सेट करें।');
    } catch (err) {
      console.error(err);
      setStatusText('एरर आया। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  // बालों के किनारों की सफ़ाई
  const cleanFringe = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(URL.createObjectURL(blob));

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 110) {
            data[i + 3] = 0;
          } else if (a < 210) {
            const factor = (a - 110) / 100;
            data[i] = Math.round(data[i] * factor);
            data[i + 1] = Math.round(data[i + 1] * factor);
            data[i + 2] = Math.round(data[i + 2] * factor);
            data[i + 3] = Math.min(255, Math.round(a * 1.3));
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  // 4. फ़ाइनल पासपोर्ट फ़ोटो डाउनलोड (बैकग्राउंड + नाम व तारीख पट्टी)
  const downloadFinalPassport = () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 413;
    finalCanvas.height = 531;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    // बैकग्राउंड कलर
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 413, 531);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 413, 531);

      // नाम और तारीख पट्टी
      if (addNameDate && (candidateName || photoDate)) {
        const stripHeight = 70;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 531 - stripHeight, 413, stripHeight);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 531 - stripHeight, 413, stripHeight);

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        if (candidateName && photoDate) {
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(candidateName.toUpperCase(), 413 / 2, 531 - 40);
          ctx.font = '16px sans-serif';
          ctx.fillText(`DOPO: ${photoDate}`, 413 / 2, 531 - 15);
        } else if (candidateName) {
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(candidateName.toUpperCase(), 413 / 2, 531 - 25);
        } else if (photoDate) {
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(`DATE: ${photoDate}`, 413 / 2, 531 - 25);
        }
      }

      const link = document.createElement('a');
      link.download = `passport-photo-${Date.now()}.jpg`;
      link.href = finalCanvas.toDataURL('image/jpeg', 0.95);
      link.click();
    };
    img.src = bgRemovedPng || croppedBase64 || '';
  };

  return (
    <div style={{ maxWidth: '480px', margin: '15px auto', padding: '16px', fontFamily: 'sans-serif', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      
      {/* टॉप टैब हेडर */}
      <div style={{ display: 'flex', justifyContent: 'space-around', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
        <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#2563eb' : '#64748b' }}>1. अपलोड</span>
        <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#2563eb' : '#64748b' }}>2. क्रॉप</span>
        <span style={{ fontWeight: step === 3 ? 'bold' : 'normal', color: step === 3 ? '#2563eb' : '#64748b' }}>3. बैकग्राउंड व नाम</span>
      </div>

      {/* स्टेप 1: अपलोड */}
      {step === 1 && (
        <div style={{ textAlign: 'center', padding: '30px 10px', border: '2px dashed #93c5fd', borderRadius: '12px', background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>पासपोर्ट साइज फोटो बनाएँ</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>कैमरे या गैलरी से फोटो अपलोड करें</p>
          <input type="file" accept="image/*" id="file-uploader" onChange={onSelectFile} style={{ display: 'none' }} />
          <label htmlFor="file-uploader" style={{ display: 'inline-block', padding: '12px 28px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Select Image
          </label>
        </div>
      )}

      {/* स्टेप 2: क्रॉप (Crop Face) */}
      {step === 2 && upImg && (
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Crop Face (3.5 x 4.5 Ratio)</h4>
          <div style={{ maxHeight: '380px', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '8px' }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={3.5 / 4.5}
            >
              <img
                ref={imgRef}
                src={upImg}
                alt="Crop preview"
                style={{ maxHeight: '340px', maxWidth: '100%', filter: `brightness(${brightness}%)` }}
              />
            </ReactCrop>
          </div>

          {/* ब्राइटनेस स्लाइडर */}
          <div style={{ margin: '14px 0', textAlign: 'left', padding: '0 10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Brightness: {brightness}%</label>
            <input
              type="range"
              min="70"
              max="140"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold' }}>
              Back
            </button>
            <button onClick={processCropAndAI} style={{ flex: 2, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Save & Next ➔
            </button>
          </div>
        </div>
      )}

      {/* स्टेप 3: बैकग्राउंड स्टाइल और नाम/तारीख */}
      {step === 3 && (
        <div>
          <h4 style={{ textAlign: 'center', margin: '0 0 12px 0', color: '#1e293b' }}>Select Background Style</h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d97706', marginBottom: '8px' }}>⚡ AI प्रोसेसिंग जारी है...</div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{statusText}</p>
            </div>
          ) : (
            <>
              {/* ओरिजिनल क्रॉप बनाम AI रिमूव्ड प्रीव्यू */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '135px', height: '175px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={croppedBase64 || ''} alt="Original Crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>Original</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '135px', height: '175px', border: '2px solid #2563eb', borderRadius: '6px', overflow: 'hidden', backgroundColor: bgColor }}>
                    <img src={bgRemovedPng || croppedBase64 || ''} alt="AI Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>✓ Background</span>
                </div>
              </div>

              {/* कलर पैलेट */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                {[
                  { name: 'सफेद', code: '#ffffff' },
                  { name: 'हल्का नीला', code: '#dbeafe' },
                  { name: 'रॉयल नीला', code: '#1d4ed8' },
                  { name: 'हल्का ग्रे', code: '#e2e8f0' },
                  { name: 'लाल', code: '#dc2626' }
                ].map((col) => (
                  <button
                    key={col.code}
                    onClick={() => setBgColor(col.code)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: col.code,
                      border: bgColor === col.code ? '3px solid #000' : '1px solid #94a3b8',
                      cursor: 'pointer'
                    }}
                    title={col.name}
                  />
                ))}
              </div>

              {/* नाम व तारीख चेकबॉक्स व इनपुट */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addNameDate}
                    onChange={(e) => setAddNameDate(e.target.checked)}
                  />
                  Write Name & Date on Image
                </label>

                {addNameDate && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <input
                      type="text"
                      placeholder="Date (e.g. 25/10/2026)"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                )}
              </div>

              {/* ऐक्शन बटन */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 'bold' }}>
                  Back
                </button>
                <button onClick={downloadFinalPassport} style={{ flex: 2, padding: '10px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                  📥 Download
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
