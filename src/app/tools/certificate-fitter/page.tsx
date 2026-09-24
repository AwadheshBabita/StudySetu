'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface Point {
  x: number;
  y: number;
}

interface DocPage {
  id: string;
  originalRawSrc: string;
  croppedNaturalSrc: string;
  rotation: number;
  name: string;
}

export default function CertificateFitterPage() {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // क्रॉपिंग स्टेट
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState<string>('Document');
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);

  // A4 शीट सेटिंग्स
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [docPlacement, setDocPlacement] = useState<'fit-page' | 'original-card'>('fit-page');
  const [filterMode, setFilterMode] = useState<'bw' | 'magic' | 'original'>('bw');
  const [brightness, setBrightness] = useState<number>(115);
  const [contrast, setContrast] = useState<number>(140);
  const [targetKb, setTargetKb] = useState<number>(200);

  // आउटपुट व प्रोसेसिंग
  const [activePageOutputUrl, setActivePageOutputUrl] = useState<string | null>(null);
  const [activePageSizeKb, setActivePageSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);

  // रेफ़रेंसेस
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempImgObjRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 4 कोने
  const cornersRef = useRef<Point[]>([
    { x: 40, y: 40 },
    { x: 300, y: 40 },
    { x: 300, y: 400 },
    { x: 40, y: 400 }
  ]);
  const activeCornerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // फ़ाइल इनपुट
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setTempImageSrc(src);
        setTempFileName(file.name);
        setCropTargetIndex(null);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
          tempImgObjRef.current = img;
          setIsCropping(true);
        };
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const triggerRecrop = (index: number) => {
    const target = pages[index];
    if (!target) return;
    setTempImageSrc(target.originalRawSrc);
    setTempFileName(target.name);
    setCropTargetIndex(index);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = target.originalRawSrc;
    img.onload = () => {
      tempImgObjRef.current = img;
      setIsCropping(true);
    };
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const newRot = (p.rotation + 90) % 360;

        const img = new Image();
        img.src = p.croppedNaturalSrc;
        const c = document.createElement('canvas');
        if (newRot % 180 !== 0) {
          c.width = img.height || 1000;
          c.height = img.width || 1000;
        } else {
          c.width = img.width || 1000;
          c.height = img.height || 1000;
        }
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.translate(c.width / 2, c.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
        }
        return {
          ...p,
          rotation: newRot,
          croppedNaturalSrc: c.toDataURL('image/jpeg', 0.95)
        };
      })
    );
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pages.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
    setActivePageIndex(newIdx);
  };

  const removePage = (index: number) => {
    setPages((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      if (activePageIndex >= copy.length) {
        setActivePageIndex(Math.max(0, copy.length - 1));
      }
      return copy;
    });
  };

  const redrawCropCanvas = () => {
    const canvas = cropCanvasRef.current;
    const img = tempImgObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cW = canvas.width;
    const cH = canvas.height;

    ctx.clearRect(0, 0, cW, cH);
    ctx.drawImage(img, 0, 0, cW, cH);

    const pts = cornersRef.current;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.fill();

    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    pts.forEach((pt) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    if (activeCornerRef.current !== null && isDraggingRef.current) {
      const activePt = pts[activeCornerRef.current];
      const loupeRadius = 48;
      const zoom = 3.0;

      let loupeX = activePt.x;
      let loupeY = activePt.y - 75;
      if (loupeY < loupeRadius + 10) loupeY = activePt.y + 75;
      if (loupeX < loupeRadius + 10) loupeX = loupeRadius + 10;
      if (loupeX > cW - loupeRadius - 10) loupeX = cW - loupeRadius - 10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.clip();

      const scaleX = img.naturalWidth / cW;
      const scaleY = img.naturalHeight / cH;
      const realX = activePt.x * scaleX;
      const realY = activePt.y * scaleY;

      const sampleW = (loupeRadius * 2 * scaleX) / zoom;
      const sampleH = (loupeRadius * 2 * scaleY) / zoom;
      const sx = Math.max(0, Math.min(img.naturalWidth - sampleW, realX - sampleW / 2));
      const sy = Math.max(0, Math.min(img.naturalHeight - sampleH, realY - sampleH / 2));

      ctx.drawImage(
        img,
        sx,
        sy,
        sampleW,
        sampleH,
        loupeX - loupeRadius,
        loupeY - loupeRadius,
        loupeRadius * 2,
        loupeRadius * 2
      );

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(loupeX, loupeY - loupeRadius);
      ctx.lineTo(loupeX, loupeY + loupeRadius);
      ctx.moveTo(loupeX - loupeRadius, loupeY);
      ctx.lineTo(loupeX + loupeRadius, loupeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(loupeX, loupeY, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    if (isCropping && tempImgObjRef.current && cropCanvasRef.current) {
      const img = tempImgObjRef.current;
      const canvas = cropCanvasRef.current;

      const maxW = Math.min(window.innerWidth - 40, 520);
      const scale = maxW / img.naturalWidth;
      const maxH = Math.round(img.naturalHeight * scale);

      canvas.width = maxW;
      canvas.height = maxH;

      cornersRef.current = [
        { x: Math.round(maxW * 0.08), y: Math.round(maxH * 0.08) },
        { x: Math.round(maxW * 0.92), y: Math.round(maxH * 0.08) },
        { x: Math.round(maxW * 0.92), y: Math.round(maxH * 0.92) },
        { x: Math.round(maxW * 0.08), y: Math.round(maxH * 0.92) }
      ];

      redrawCropCanvas();
    }
  }, [isCropping, tempImageSrc]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    const pts = cornersRef.current;
    const threshold = 36;

    let closestIdx = -1;
    let minDist = Infinity;

    pts.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - pos.x, pt.y - pos.y);
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1) {
      activeCornerRef.current = closestIdx;
      isDraggingRef.current = true;
      redrawCropCanvas();
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || activeCornerRef.current === null || !cropCanvasRef.current) return;
    const pos = getPointerPos(e);
    const cW = cropCanvasRef.current.width;
    const cH = cropCanvasRef.current.height;

    cornersRef.current[activeCornerRef.current] = {
      x: Math.max(0, Math.min(cW, pos.x)),
      y: Math.max(0, Math.min(cH, pos.y))
    };

    redrawCropCanvas();
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      activeCornerRef.current = null;
      redrawCropCanvas();
    }
  };

  const warpTriangle = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    src: [Point, Point, Point],
    dst: [Point, Point, Point]
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dst[0].x, dst[0].y);
    ctx.lineTo(dst[1].x, dst[1].y);
    ctx.lineTo(dst[2].x, dst[2].y);
    ctx.closePath();
    ctx.clip();

    const [x0, y0] = [src[0].x, src[0].y];
    const [x1, y1] = [src[1].x, src[1].y];
    const [x2, y2] = [src[2].x, src[2].y];

    const [u0, v0] = [dst[0].x, dst[0].y];
    const [u1, v1] = [dst[1].x, dst[1].y];
    const [u2, v2] = [dst[2].x, dst[2].y];

    const delta = x0 * (y1 - y2) - x1 * (y0 - y2) + x2 * (y0 - y1);
    if (Math.abs(delta) < 0.0001) {
      ctx.restore();
      return;
    }

    const a = (u0 * (y1 - y2) - u1 * (y0 - y2) + u2 * (y0 - y1)) / delta;
    const b = (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) / delta;
    const c = (u0 * (x1 * y2 - x2 * y1) - u1 * (x0 * y2 - x2 * y0) + u2 * (x0 * y1 - x1 * y0)) / delta;

    const d = (v0 * (y1 - y2) - v1 * (y0 - y2) + v2 * (y0 - y1)) / delta;
    const e = (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) / delta;
    const f = (v0 * (x1 * y2 - x2 * y1) - v1 * (x0 * y2 - x2 * y0) + v2 * (x0 * y1 - x1 * y0)) / delta;

    ctx.transform(a, d, b, e, c, f);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const handleCropComplete = () => {
    const img = tempImgObjRef.current;
    const canvas = cropCanvasRef.current;
    if (!img || !canvas || !tempImageSrc) return;

    const pts = cornersRef.current;
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const srcPts: Point[] = pts.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }));

    const topW = Math.hypot(srcPts[1].x - srcPts[0].x, srcPts[1].y - srcPts[0].y);
    const botW = Math.hypot(srcPts[2].x - srcPts[3].x, srcPts[2].y - srcPts[3].y);
    const leftH = Math.hypot(srcPts[3].x - srcPts[0].x, srcPts[3].y - srcPts[0].y);
    const rightH = Math.hypot(srcPts[2].x - srcPts[1].x, srcPts[2].y - srcPts[1].y);

    const naturalWidth = Math.round(Math.max(topW, botW));
    const naturalHeight = Math.round(Math.max(leftH, rightH));

    const outCanvas = document.createElement('canvas');
    outCanvas.width = naturalWidth;
    outCanvas.height = naturalHeight;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, naturalWidth, naturalHeight);

    const dstPts: Point[] = [
      { x: 0, y: 0 },
      { x: naturalWidth, y: 0 },
      { x: naturalWidth, y: naturalHeight },
      { x: 0, y: naturalHeight }
    ];

    warpTriangle(ctx, img, [srcPts[0], srcPts[1], srcPts[2]], [dstPts[0], dstPts[1], dstPts[2]]);
    warpTriangle(ctx, img, [srcPts[0], srcPts[2], srcPts[3]], [dstPts[0], dstPts[2], dstPts[3]]);

    const naturalCroppedData = outCanvas.toDataURL('image/jpeg', 0.95);

    if (cropTargetIndex !== null) {
      setPages((prev) =>
        prev.map((p, i) => (i === cropTargetIndex ? { ...p, croppedNaturalSrc: naturalCroppedData } : p))
      );
    } else {
      const newPage: DocPage = {
        id: Math.random().toString(36).substring(2, 9),
        originalRawSrc: tempImageSrc,
        croppedNaturalSrc: naturalCroppedData,
        rotation: 0,
        name: tempFileName
      };
      setPages((prev) => [...prev, newPage]);
      setActivePageIndex(pages.length);
    }

    setIsCropping(false);
    setTempImageSrc(null);
  };

  const renderSingleA4Canvas = useCallback(
    (src: string): Promise<HTMLCanvasElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
          const baseW = orientation === 'portrait' ? 1240 : 1754;
          const baseH = orientation === 'portrait' ? 1754 : 1240;

          let scale = 1.0;
          if (targetKb <= 40) scale = 0.55;
          else if (targetKb <= 80) scale = 0.75;
          else if (targetKb <= 150) scale = 0.88;

          const outW = Math.round(baseW * scale);
          const outH = Math.round(baseH * scale);

          const canvas = document.createElement('canvas');
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(canvas);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outW, outH);

          const imgAspect = img.width / img.height;
          let drawW, drawH, drawX, drawY;

          if (docPlacement === 'original-card') {
            drawW = Math.min(outW * 0.65, img.width);
            drawH = drawW / imgAspect;
            drawX = (outW - drawW) / 2;
            drawY = outH * 0.08;
          } else {
            const pageAspect = outW / outH;
            if (imgAspect > pageAspect) {
              drawW = outW * 0.94;
              drawH = drawW / imgAspect;
              drawX = (outW - drawW) / 2;
              drawY = (outH - drawH) / 2;
            } else {
              drawH = outH * 0.94;
              drawW = drawH * imgAspect;
              drawX = (outW - drawW) / 2;
              drawY = (outH - drawH) / 2;
            }
          }

          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.filter = 'none';

          if (filterMode === 'bw') {
            const imgData = ctx.getImageData(0, 0, outW, outH);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (gray > 165) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              } else {
                d[i] = Math.max(0, d[i] - 55);
                d[i + 1] = Math.max(0, d[i] - 55);
                d[i + 2] = Math.max(0, d[i] - 55);
              }
            }
            ctx.putImageData(imgData, 0, 0);
          } else if (filterMode === 'magic') {
            const imgData = ctx.getImageData(0, 0, outW, outH);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
              const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (gray > 195) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }

          resolve(canvas);
        };
      });
    },
    [orientation, docPlacement, filterMode, brightness, contrast, targetKb]
  );

  const processActivePage = useCallback(async () => {
    if (pages.length === 0 || !pages[activePageIndex]) {
      setActivePageOutputUrl(null);
      setActivePageSizeKb(0);
      return;
    }

    setIsProcessing(true);
    const canvas = await renderSingleA4Canvas(pages[activePageIndex].croppedNaturalSrc);

    const targetBytes = targetKb * 1024;
    let minQ = 0.01;
    let maxQ = 0.98;
    let bestQ = 0.85;
    let bestData = canvas.toDataURL('image/jpeg', bestQ);

    for (let i = 0; i < 8; i++) {
      const midQ = (minQ + maxQ) / 2;
      const dUrl = canvas.toDataURL('image/jpeg', midQ);
      const head = 'data:image/jpeg;base64,';
      const currentBytes = Math.round(((dUrl.length - head.length) * 3) / 4);

      if (currentBytes > targetBytes) {
        maxQ = midQ;
      } else {
        bestQ = midQ;
        bestData = dUrl;
        minQ = midQ;
      }
    }

    const head = 'data:image/jpeg;base64,';
    const finalKb = Math.max(5, Math.round(((bestData.length - head.length) * 3) / 4 / 1024));

    setActivePageOutputUrl(bestData);
    setActivePageSizeKb(finalKb);
    setIsProcessing(false);
  }, [pages, activePageIndex, renderSingleA4Canvas, targetKb]);

  useEffect(() => {
    if (pages.length > 0) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        processActivePage();
      }, 120);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [pages, activePageIndex, orientation, docPlacement, filterMode, brightness, contrast, targetKb, processActivePage]);

  const downloadSingleJpg = () => {
    if (!activePageOutputUrl) return;
    const a = document.createElement('a');
    a.href = activePageOutputUrl;
    a.download = `Doc_Page_${activePageIndex + 1}_${activePageSizeKb}KB.jpg`;
    a.click();
  };

  const downloadDirectPdf = async () => {
    if (pages.length === 0) return;
    setPdfGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: orientation === 'portrait' ? 'p' : 'l',
        unit: 'mm',
        format: 'a4'
      });

      const pdfW = orientation === 'portrait' ? 210 : 297;
      const pdfH = orientation === 'portrait' ? 297 : 210;
      const perPageKb = Math.max(10, Math.round(targetKb / Math.max(1, pages.length)));

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', orientation === 'portrait' ? 'p' : 'l');
        }

        const canvas = await renderSingleA4Canvas(pages[i].croppedNaturalSrc);
        const targetBytes = perPageKb * 1024;
        let minQ = 0.01;
        let maxQ = 0.95;
        let bestData = canvas.toDataURL('image/jpeg', 0.8);

        for (let step = 0; step < 6; step++) {
          const midQ = (minQ + maxQ) / 2;
          const dUrl = canvas.toDataURL('image/jpeg', midQ);
          const head = 'data:image/jpeg;base64,';
          const bytes = Math.round(((dUrl.length - head.length) * 3) / 4);
          if (bytes > targetBytes) {
            maxQ = midQ;
          } else {
            bestData = dUrl;
            minQ = midQ;
          }
        }

        pdf.addImage(bestData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      }

      pdf.save(`ExamSewa_Certificates_${pages.length}Pages_${targetKb}KB.pdf`);
    } catch (err) {
      console.error(err);
      alert('PDF तैयार करने में समस्या आई, कृपया पुनः प्रयास करें।');
    } finally {
      setPdfGenerating(false);
    }
  };

  // ---------------- UI कंपोनेंट्स ---------------- //

  // १. पन्ना मैनेजर (थंबनेल्स ग्रिड / पन्ना जोड़ें)
  const PageManagerBlock = (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
        <span className="text-xs font-black text-slate-800">
          दस्तावेज़ पन्ने ({pages.length}/50)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
          >
            + पन्ना जोड़ें 📁
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="text-xs font-bold text-green-700 hover:underline cursor-pointer"
          >
            कैमरा 📷
          </button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="grid grid-cols-2 gap-2.5 py-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="p-3 rounded-lg border-2 border-dashed border-green-500/60 bg-green-50/40 hover:bg-green-50 text-center flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-2xl mb-0.5">📷</span>
            <span className="text-xs font-black text-green-800">फोटो खींचें</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-lg border-2 border-dashed border-blue-500/60 bg-blue-50/40 hover:bg-blue-50 text-center flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-2xl mb-0.5">📁</span>
            <span className="text-xs font-black text-blue-800">गैलरी / फाइल्स</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
          {pages.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => setActivePageIndex(idx)}
              className={`relative rounded-lg border-2 overflow-hidden cursor-pointer bg-slate-50 transition-all flex flex-col ${
                activePageIndex === idx
                  ? 'border-green-600 ring-2 ring-green-300 shadow-md'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="h-14 w-full bg-white flex items-center justify-center p-0.5">
                <img src={p.croppedNaturalSrc} alt="thumb" className="h-full w-full object-contain" />
              </div>
              <div className="bg-slate-800 text-[10px] text-white px-1 py-0.5 flex items-center justify-between">
                <span className="font-bold">P{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    title="90° घुमाएँ"
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(idx);
                    }}
                    className="text-[10px] hover:text-amber-300"
                  >
                    🔄
                  </button>
                  <button
                    title="री-क्रॉप करें"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerRecrop(idx);
                    }}
                    className="text-[10px] hover:text-green-300"
                  >
                    ✂️
                  </button>
                  <button
                    title="हटाएँ"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(idx);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-200 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 flex items-center justify-between px-1 py-0.5 border-t border-slate-200 text-[10px]">
                <button
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    movePage(idx, 'left');
                  }}
                  className="text-slate-600 disabled:opacity-30 font-black hover:text-blue-600"
                >
                  ◀
                </button>
                <span className="text-[9px] text-slate-400 font-bold">क्रम</span>
                <button
                  disabled={idx === pages.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    movePage(idx, 'right');
                  }}
                  className="text-slate-600 disabled:opacity-30 font-black hover:text-blue-600"
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // २. लाइव A4 प्रीव्यू ब्लॉक
  const PreviewBlock = (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs text-center">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase">
          A4 लाइव प्रीव्यू {pages.length > 0 && `(पेज ${activePageIndex + 1}/${pages.length})`}
        </span>
        <div className="flex items-center gap-1.5">
          {isProcessing && (
            <span className="text-[10px] sm:text-[11px] text-amber-600 animate-pulse font-bold">
              ⚡ फ़िट हो रहा है...
            </span>
          )}
          {activePageSizeKb > 0 && (
            <span className="text-[11px] sm:text-xs font-extrabold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              {activePageSizeKb} KB | A4 Ready
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-200 p-2 sm:p-4 rounded-xl border border-slate-300 flex items-center justify-center min-h-[260px] lg:min-h-[520px]">
        {activePageOutputUrl ? (
          <div
            style={{
              aspectRatio: orientation === 'portrait' ? '1 / 1.414' : '1.414 / 1',
              maxHeight: '440px'
            }}
            className="w-full bg-white shadow-xl border border-slate-300 flex items-center justify-center overflow-hidden rounded-sm"
          >
            <img
              src={activePageOutputUrl}
              alt="A4 Sheet Preview"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%)`
              }}
              className="w-full h-full object-contain block mx-auto transition-all"
            />
          </div>
        ) : (
          <div className="text-slate-400 text-xs sm:text-sm font-medium py-8">
            कोई पन्ना नहीं जुड़ा है। कृपया ऊपर से पहला पन्ना जोड़ें।
          </div>
        )}
      </div>
    </div>
  );

  // ३. सफ़ाई फ़िल्टर व ब्राइटनेस / कंट्रास्ट (प्रीव्यू के ठीक नीचे)
  const FilterAdjustBlock = pages.length > 0 && (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
      <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase">
        सफ़ाई फ़िल्टर व लाइव एडजस्टमेंट
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setFilterMode('bw');
            setBrightness(115);
            setContrast(145);
          }}
          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
            filterMode === 'bw'
              ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 text-xs'
          }`}
        >
          <div className="text-xs font-bold leading-tight">🖨️ B&W ज़ेरॉक्स</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterMode('magic');
            setBrightness(105);
            setContrast(120);
          }}
          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
            filterMode === 'magic'
              ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 text-xs'
          }`}
        >
          <div className="text-xs font-bold leading-tight">✨ मैजिक कलर</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterMode('original');
            setBrightness(100);
            setContrast(100);
          }}
          className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
            filterMode === 'original'
              ? 'bg-green-50 border-green-600 text-green-800 font-extrabold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 text-xs'
          }`}
        >
          <div className="text-xs font-bold leading-tight">🖼️ ओरिजिनल</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
            <span>सफेदी (Brightness)</span>
            <span className="text-green-700 font-bold">{brightness}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-green-600 cursor-pointer h-1.5"
          />
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
            <span>कंट्रास्ट (Dark Text)</span>
            <span className="text-green-700 font-bold">{contrast}%</span>
          </div>
          <input
            type="range"
            min="90"
            max="180"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full accent-green-600 cursor-pointer h-1.5"
          />
        </div>
      </div>
    </div>
  );

  // ४. A4 शीट सेटिंग्स व ओरिएंटेशन
  const SettingsBlock = pages.length > 0 && (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
      <div>
        <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase">
          दस्तावेज़ का प्रकार (A4 शीट फ़िटिंग)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDocPlacement('fit-page')}
            className={`py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
              docPlacement === 'fit-page'
                ? 'bg-green-600 text-white border-green-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            📑 मार्कशीट (फुल A4)
          </button>
          <button
            type="button"
            onClick={() => setDocPlacement('original-card')}
            className={`py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
              docPlacement === 'original-card'
                ? 'bg-green-600 text-white border-green-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            💳 कार्ड / छोटा साइज
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black text-slate-700 mb-1.5 uppercase">
          A4 शीट ओरिएंटेशन
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrientation('portrait')}
            className={`py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
              orientation === 'portrait'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            📄 सीधा A4 (Portrait)
          </button>
          <button
            type="button"
            onClick={() => setOrientation('landscape')}
            className={`py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
              orientation === 'landscape'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            📑 आड़ा A4 (Landscape)
          </button>
        </div>
      </div>
    </div>
  );

  // ५. टारगेट फाइल साइज (KB स्लाइडर)
  const SizeSliderBlock = pages.length > 0 && (
    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-black text-slate-700 uppercase block">
            टारगेट फाइल साइज
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            (10 KB से 600 KB स्लाइडर)
          </span>
        </div>
        <span className="text-xs font-black text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
          {targetKb} KB
        </span>
      </div>
      <input
        type="range"
        min="10"
        max="600"
        step="5"
        value={targetKb}
        onChange={(e) => setTargetKb(Number(e.target.value))}
        className="w-full accent-green-600 cursor-pointer h-2"
      />
      <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
        <span>10 KB</span>
        <span className="text-green-700 font-bold">100-300 KB (सरकारी फॉर्म)</span>
        <span>600 KB</span>
      </div>
    </div>
  );

  // ६. डाउनलोड बटन्स
  const DownloadButtonsBlock = pages.length > 0 && (
    <div className="grid grid-cols-2 gap-2.5 pt-1">
      <button
        onClick={downloadSingleJpg}
        disabled={!activePageOutputUrl || isProcessing}
        className="py-3.5 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
      >
        <span>🖼️ यह पेज JPG में लें</span>
      </button>

      <button
        onClick={downloadDirectPdf}
        disabled={pdfGenerating || isProcessing}
        className="py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
      >
        <span>
          {pdfGenerating
            ? '⏳ PDF बन रही है...'
            : `📄 ${pages.length > 1 ? `सभी ${pages.length} पेजों की PDF` : 'A4 PDF डाउनलोड'}`}
        </span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-4 px-3 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
          >
            ← मुख्य होमपेज
          </Link>
        </div>

        {/* हेडर */}
        <div className="bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-xs mb-4 text-center">
          <h1 className="text-lg sm:text-xl font-black text-slate-800">
            सर्टिफिकेट व डॉक्यूमेंट रिसाइज़र (Doc Fitter Pro)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
            50 पन्नों तक जोड़ें, 4-कॉर्नर लेंस से काटें और 1-क्लिक में डायरेक्ट A4 PDF व JPG डाउनलोड करें।
          </p>
        </div>

        {/* हिडन इनपुट्स */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* 1. क्रॉपिंग स्क्रीन */}
        {isCropping && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md mb-4 max-w-xl mx-auto text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 uppercase">
                {cropTargetIndex !== null ? `पेज ${cropTargetIndex + 1} री-क्रॉप करें` : `नया पेज क्रॉप करें`}
              </span>
              <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                🔍 3x HD लेंस एक्टिव
              </span>
            </div>

            <div className="bg-slate-900 rounded-lg p-2 flex items-center justify-center overflow-hidden touch-none border border-slate-300">
              <canvas
                ref={cropCanvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className="block rounded max-w-full cursor-crosshair shadow-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => {
                  setIsCropping(false);
                  setTempImageSrc(null);
                }}
                className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                ✕ रद्द करें
              </button>
              <button
                onClick={handleCropComplete}
                className="py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>✂️ क्रॉप करें और A4 में जोड़ें →</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. मुख्य इंटरफ़ेस */}
        {!isCropping && (
          <div>
            {/* --- मोबाइल लेआउट (Screen < 1024px) --- */}
            <div className="block lg:hidden space-y-3">
              {/* १. सबसे ऊपर: पन्ना जोड़ें / थंबनेल्स ग्रिड */}
              {PageManagerBlock}

              {/* २. ठीक नीचे: लाइव A4 प्रीव्यू */}
              {PreviewBlock}

              {/* ३. ठीक नीचे: सफ़ाई फ़िल्टर और कंट्रास्ट / ब्राइटनेस */}
              {FilterAdjustBlock}

              {/* ४. A4 शीट सेटिंग्स व ओरिएंटेशन (छूटा नहीं, सुरक्षित है) */}
              {SettingsBlock}

              {/* ५. KB स्लाइडर */}
              {SizeSliderBlock}

              {/* ६. डाउनलोड बटन्स (PDF व JPG) */}
              {DownloadButtonsBlock}
            </div>

            {/* --- कंप्यूटर / डेस्कटॉप लेआउट (Screen >= 1024px) --- */}
            <div className="hidden lg:grid grid-cols-12 gap-4 items-start">
              {/* बायाँ भाग (7 कॉलम): बड़ा A4 लाइव प्रीव्यू */}
              <div className="col-span-7 flex flex-col gap-3">
                {PreviewBlock}
              </div>

              {/* दायाँ भाग (5 कॉलम): सारे कंट्रोल्स क्रमवार */}
              <div className="col-span-5 flex flex-col gap-3">
                {PageManagerBlock}
                {SettingsBlock}
                {FilterAdjustBlock}
                {SizeSliderBlock}
                {DownloadButtonsBlock}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
