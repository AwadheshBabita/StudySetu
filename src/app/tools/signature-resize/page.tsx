'use client';
import { exportSmartJpg } from "@/lib/image-engine";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

// 1. बाइनरी स्तर पर सटीक DPI (300, 600 आदि) और सटीक KB पैडिंग इंजेक्ट करने वाला मास्टर फ़ंक्शन
function buildAccurateJpeg(rawBase64: string, dpi: number, targetBytes: number): string {
  const pureBase64 = rawBase64.replace(/^data:image\/jpeg;base64,/, '');
  const rawBinary = atob(pureBase64);
  const rawLen = rawBinary.length;
  const rawBytes = new Uint8Array(rawLen);
  for (let i = 0; i < rawLen; i++) {
    rawBytes[i] = rawBinary.charCodeAt(i);
  }

  // मानक 18-बाइट JFIF हेडर (DPI को 100% विंडोज़ में मान्यता दिलाने के लिए)
  const jfifHeader = new Uint8Array([
    0xff, 0xe0, // APP0 Marker
    0x00, 0x10, // Length = 16 bytes
    0x4a, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x01,       // 1 = Dots Per Inch (DPI)
    (dpi >> 8) & 0xff, dpi & 0xff, // X DPI
    (dpi >> 8) & 0xff, dpi & 0xff, // Y DPI
    0x00, 0x00  // Thumbnail size = 0
  ]);

  // मौजूदा इमेज से पुराना APP0 या हेडर हटाकर बॉडी निकालना
  let bodyStart = 2; // FF D8 के बाद
  if (rawBytes[2] === 0xff && (rawBytes[3] === 0xe0 || rawBytes[3] === 0xe1)) {
    const blockLen = (rawBytes[4] << 8) + rawBytes[5];
    bodyStart = 4 + blockLen;
  }

  const bodyBytes = rawBytes.slice(bodyStart);

  // यदि फाइल टारगेट KB से हल्की है, तो सुरक्षित JPEG Comment (0xFF 0xFE) चंक जोड़कर KB पूरी करना
  let paddingChunk = new Uint8Array(0);
  const currentTotal = 2 + jfifHeader.length + bodyBytes.length;
  if (currentTotal < targetBytes) {
    const needed = targetBytes - currentTotal;
    if (needed > 4) {
      const padLen = Math.min(65533, needed - 2);
      paddingChunk = new Uint8Array(padLen + 2);
      paddingChunk[0] = 0xff;
      paddingChunk[1] = 0xfe; // COM Marker
      paddingChunk[2] = (padLen >> 8) & 0xff;
      paddingChunk[3] = padLen & 0xff;
      for (let p = 4; p < padLen + 2; p++) {
        paddingChunk[p] = 0x20; // Safe Space Filler
      }
    }
  }

  // अंतिम बाइनरी फाइल जोड़ना: SOI + JFIF Header + Padding + Image Body
  const finalLen = 2 + jfifHeader.length + paddingChunk.length + bodyBytes.length;
  const finalBytes = new Uint8Array(finalLen);
  finalBytes[0] = 0xff;
  finalBytes[1] = 0xd8; // SOI
  finalBytes.set(jfifHeader, 2);
  finalBytes.set(paddingChunk, 2 + jfifHeader.length);
  finalBytes.set(bodyBytes, 2 + jfifHeader.length + paddingChunk.length);

  let binaryStr = '';
  const chunk = 8192;
  for (let i = 0; i < finalLen; i += chunk) {
    binaryStr += String.fromCharCode.apply(null, Array.from(finalBytes.subarray(i, i + chunk)));
  }

  return 'data:image/jpeg;base64,' + btoa(binaryStr);
}

export default function SignatureResizePage() {
  const [sizeMode, setSizeMode] = useState<'default' | 'custom'>('default');
  
  const [customUnit, setCustomUnit] = useState<'px' | 'cm' | 'mm' | 'inch'>('px');
  const [pxWidthStr, setPxWidthStr] = useState<string>('444');
  const [pxHeightStr, setPxHeightStr] = useState<string>('205');
  const [cmWidthStr, setCmWidthStr] = useState<string>('4.0');
  const [cmHeightStr, setCmHeightStr] = useState<string>('2.0');
  const [mmWidthStr, setMmWidthStr] = useState<string>('40');
  const [mmHeightStr, setMmHeightStr] = useState<string>('20');
  const [inchWidthStr, setInchWidthStr] = useState<string>('2.0');
  const [inchHeightStr, setInchHeightStr] = useState<string>('1.0');
  const [dpiStr, setDpiStr] = useState<string>('300');

  // फ्री क्रॉपिंग स्टेट्स
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  const [dragMode, setDragMode] = useState<'none' | 'drawing' | 'moving' | 'nw' | 'ne' | 'se' | 'sw'>('none');
  const dragAnchor = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // मुख्य एडिटर स्टेट्स
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // स्मूद इंक फ़िल्टर व क्लीनर
  const [inkFilter, setInkFilter] = useState<'deep_black' | 'blue' | 'original'>('deep_black');
  const [brightness, setBrightness] = useState<number>(105);
  const [contrast, setContrast] = useState<number>(130);
  const [cleanBgStrength, setCleanBgStrength] = useState<number>(65);

  // KB नियंत्रण (10 से 200 KB)
  const [targetKb, setTargetKb] = useState<number>(30);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputKb, setOutputKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cachedImgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUri = ev.target?.result as string;
        setRawImageSrc(dataUri);
        setCropBox(null);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!isCropModalOpen || !rawImageSrc || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

      // कंप्यूटर: 1000px चौड़ा खुला दृश्य
      // मोबाइल: स्क्रीन चौड़ाई में 100% फिट (कोई हिस्सा नहीं कटेगा)
      const displayW = isDesktop
        ? Math.min(img.width, 1000)
        : Math.min(img.width, window.innerWidth * 0.94);
      const aspect = img.height / img.width;
      const displayH = Math.round(displayW * aspect);

      // मोबाइल पर 2x रेटिना डेंसिटी (ताकि स्याही शीशे जैसी साफ दिखे), कंप्यूटर पर 1x (1000px)
      const renderScale = isDesktop ? 1 : Math.min(dpr, 2.5);
      canvas.width = Math.round(displayW * renderScale);
      canvas.height = Math.round(displayH * renderScale);
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (cropBox) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const normX = Math.max(0, cropBox.w >= 0 ? cropBox.x : cropBox.x + cropBox.w);
        const normY = Math.max(0, cropBox.h >= 0 ? cropBox.y : cropBox.y + cropBox.h);
        const normW = Math.min(canvas.width - normX, Math.abs(cropBox.w));
        const normH = Math.min(canvas.height - normY, Math.abs(cropBox.h));

        if (normW > 2 && normH > 2) {
          ctx.clearRect(normX, normY, normW, normH);
          ctx.drawImage(
            img,
            (normX / canvas.width) * img.width,
            (normY / canvas.height) * img.height,
            (normW / canvas.width) * img.width,
            (normH / canvas.height) * img.height,
            normX,
            normY,
            normW,
            normH
          );

          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(normX, normY, normW, normH);

          const hs = 8;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;

          const pts = [
            { x: normX, y: normY },
            { x: normX + normW, y: normY },
            { x: normX + normW, y: normY + normH },
            { x: normX, y: normY + normH }
          ];

          pts.forEach((p) => {
            ctx.fillRect(p.x - hs / 2, p.y - hs / 2, hs, hs);
            ctx.strokeRect(p.x - hs / 2, p.y - hs / 2, hs, hs);
          });
        }
      }
    };
  }, [isCropModalOpen, rawImageSrc, cropBox]);

  const getCanvasCoord = (clientX: number, clientY: number) => {
    if (!cropCanvasRef.current) return { x: 0, y: 0 };
    const rect = cropCanvasRef.current.getBoundingClientRect();
    const scaleX = cropCanvasRef.current.width / rect.width;
    const scaleY = cropCanvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCropDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoord(clientX, clientY);
    dragAnchor.current = { x, y };

    if (cropBox) {
      const normX = cropBox.w >= 0 ? cropBox.x : cropBox.x + cropBox.w;
      const normY = cropBox.h >= 0 ? cropBox.y : cropBox.y + cropBox.h;
      const normW = Math.abs(cropBox.w);
      const normH = Math.abs(cropBox.h);
      const hs = 16;

      if (Math.abs(x - normX) < hs && Math.abs(y - normY) < hs) {
        setDragMode('nw');
        initialBoxRef.current = { x: normX, y: normY, w: normW, h: normH };
        return;
      } else if (Math.abs(x - (normX + normW)) < hs && Math.abs(y - normY) < hs) {
        setDragMode('ne');
        initialBoxRef.current = { x: normX, y: normY, w: normW, h: normH };
        return;
      } else if (Math.abs(x - (normX + normW)) < hs && Math.abs(y - (normY + normH)) < hs) {
        setDragMode('se');
        initialBoxRef.current = { x: normX, y: normY, w: normW, h: normH };
        return;
      } else if (Math.abs(x - normX) < hs && Math.abs(y - (normY + normH)) < hs) {
        setDragMode('sw');
        initialBoxRef.current = { x: normX, y: normY, w: normW, h: normH };
        return;
      } else if (x > normX + 10 && x < normX + normW - 10 && y > normY + 10 && y < normY + normH - 10) {
        setDragMode('moving');
        initialBoxRef.current = { x: normX, y: normY, w: normW, h: normH };
        return;
      }
    }

    setDragMode('drawing');
    setCropBox({ x, y, w: 0, h: 0 });
  };

  const handleCropMove = (clientX: number, clientY: number) => {
    if (dragMode === 'none' || !cropCanvasRef.current) return;
    const { x, y } = getCanvasCoord(clientX, clientY);
    const canvas = cropCanvasRef.current;

    if (dragMode === 'drawing') {
      const curX = Math.max(0, Math.min(canvas.width, x));
      const curY = Math.max(0, Math.min(canvas.height, y));
      const w = curX - dragAnchor.current.x;
      const h = curY - dragAnchor.current.y;
      setCropBox({ x: dragAnchor.current.x, y: dragAnchor.current.y, w, h });
    } else if (dragMode === 'moving' && initialBoxRef.current) {
      const dx = x - dragAnchor.current.x;
      const dy = y - dragAnchor.current.y;
      const init = initialBoxRef.current;
      const newX = Math.max(0, Math.min(canvas.width - init.w, init.x + dx));
      const newY = Math.max(0, Math.min(canvas.height - init.h, init.y + dy));
      setCropBox({ x: newX, y: newY, w: init.w, h: init.h });
    } else if (initialBoxRef.current) {
      const init = initialBoxRef.current;
      const dx = x - dragAnchor.current.x;
      const dy = y - dragAnchor.current.y;
      if (dragMode === 'se') {
        setCropBox({ x: init.x, y: init.y, w: Math.max(20, init.w + dx), h: Math.max(15, init.h + dy) });
      } else if (dragMode === 'sw') {
        const newX = Math.min(init.x + init.w - 20, init.x + dx);
        setCropBox({ x: newX, y: init.y, w: init.w + (init.x - newX), h: Math.max(15, init.h + dy) });
      } else if (dragMode === 'ne') {
        const newY = Math.min(init.y + init.h - 15, init.y + dy);
        setCropBox({ x: init.x, y: newY, w: Math.max(20, init.w + dx), h: init.h + (init.y - newY) });
      } else if (dragMode === 'nw') {
        const newX = Math.min(init.x + init.w - 20, init.x + dx);
        const newY = Math.min(init.y + init.h - 15, init.y + dy);
        setCropBox({ x: newX, y: newY, w: init.w + (init.x - newX), h: init.h + (init.y - newY) });
      }
    }
  };

  const handleCropUp = () => {
    if (cropBox) {
      const normX = Math.max(0, cropBox.w >= 0 ? cropBox.x : cropBox.x + cropBox.w);
      const normY = Math.max(0, cropBox.h >= 0 ? cropBox.y : cropBox.y + cropBox.h);
      const normW = Math.abs(cropBox.w);
      const normH = Math.abs(cropBox.h);
      if (normW < 10 || normH < 10) {
        setCropBox(null);
      } else {
        setCropBox({ x: normX, y: normY, w: normW, h: normH });
      }
    }
    setDragMode('none');
  };

  const rotateCropImage = () => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.height;
      c.height = img.width;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      setCropBox(null);
      setRawImageSrc(c.toDataURL("image/jpeg", 0.98));
    };
  };

  const confirmCrop = () => {
    if (!rawImageSrc || !cropBox || !cropCanvasRef.current) return;
    const canvas = cropCanvasRef.current;
    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      const scaleX = img.width / canvas.width;
      const scaleY = img.height / canvas.height;

      const normX = cropBox.w >= 0 ? cropBox.x : cropBox.x + cropBox.w;
      const normY = cropBox.h >= 0 ? cropBox.y : cropBox.y + cropBox.h;
      const normW = Math.abs(cropBox.w);
      const normH = Math.abs(cropBox.h);

      const realX = Math.max(0, Math.round(normX * scaleX));
      const realY = Math.max(0, Math.round(normY * scaleY));
      const realW = Math.min(img.width - realX, Math.round(normW * scaleX));
      const realH = Math.min(img.height - realY, Math.round(normH * scaleY));

      if (realW < 10 || realH < 10) return;

      const outCanvas = document.createElement('canvas');
      outCanvas.width = realW;
      outCanvas.height = realH;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) return;

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';
      outCtx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
      const croppedData = outCanvas.toDataURL('image/jpeg', 0.98);

      const croppedImg = new Image();
      croppedImg.src = croppedData;
      croppedImg.onload = () => {
        cachedImgRef.current = croppedImg;
        setImageSrc(croppedData);
        setRotation(0);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        setIsCropModalOpen(false);
      };
    };
  };

  const useFullImage = () => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      cachedImgRef.current = img;
      setImageSrc(rawImageSrc);
      setRotation(0);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setIsCropModalOpen(false);
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!imageSrc) return;
    return; // DRAG_DISABLED
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - panOffset.x,
      y: clientY - panOffset.y
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPanOffset({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getCalculatedDimensions = useCallback((): { width: number; height: number; label: string; currentDpi: number } => {
    if (sizeMode === 'default') {
      const wPx = Math.round((4.0 / 2.54) * 300); // 472 px
      const hPx = Math.round((2.0 / 2.54) * 300); // 236 px
      return { width: wPx, height: hPx, label: 'मानक (4.0×2.0 cm @ 300 DPI)', currentDpi: 300 };
    }

    const currentDpi = Math.max(72, Math.min(600, parseInt(dpiStr, 10) || 300));

    if (customUnit === 'cm') {
      const parsedW = parseFloat(cmWidthStr) || 4.0;
      const parsedH = parseFloat(cmHeightStr) || 2.0;
      const wPx = Math.max(30, Math.round((parsedW / 2.54) * currentDpi));
      const hPx = Math.max(20, Math.round((parsedH / 2.54) * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} cm (${currentDpi} DPI)`, currentDpi };
    } else if (customUnit === 'mm') {
      const parsedW = parseFloat(mmWidthStr) || 40;
      const parsedH = parseFloat(mmHeightStr) || 20;
      const wPx = Math.max(30, Math.round((parsedW / 25.4) * currentDpi));
      const hPx = Math.max(20, Math.round((parsedH / 25.4) * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} mm (${currentDpi} DPI)`, currentDpi };
    } else if (customUnit === 'inch') {
      const parsedW = parseFloat(inchWidthStr) || 2.0;
      const parsedH = parseFloat(inchHeightStr) || 1.0;
      const wPx = Math.max(30, Math.round(parsedW * currentDpi));
      const hPx = Math.max(20, Math.round(parsedH * currentDpi));
      return { width: wPx, height: hPx, label: `${parsedW}×${parsedH} inch (${currentDpi} DPI)`, currentDpi };
    } else {
      const parsedW = Math.max(20, parseInt(pxWidthStr, 10) || 444);
      const parsedH = Math.max(20, parseInt(pxHeightStr, 10) || 205);
      return { width: parsedW, height: parsedH, label: `${parsedW}×${parsedH} px (${currentDpi} DPI)`, currentDpi };
    }
  }, [sizeMode, customUnit, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, pxWidthStr, pxHeightStr, dpiStr]);

  // सटीक पिक्सल कैनवास
  const renderSignatureCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = cachedImgRef.current;
    if (!img) return null;

    const { width: outW, height: outH } = getCalculatedDimensions();

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);

    ctx.save();
    ctx.translate(outW / 2 + panOffset.x, outH / 2 + panOffset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoomLevel, zoomLevel);

    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const boundW = img.width * cos + img.height * sin;
    const boundH = img.width * sin + img.height * cos;

    const fitScale = Math.min((outW * 0.96) / boundW, (outH * 0.96) / boundH);
    const drawW = img.width * fitScale;
    const drawH = img.height * fitScale;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.filter = 'none';
    ctx.restore();

    const imgData = ctx.getImageData(0, 0, outW, outH);
    const data = imgData.data;

        if (inkFilter !== "original") {
      const bgOffset = (cleanBgStrength / 100) * 40;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // बैकग्राउंड को बिना किनारे काटे साफ़ रखना
        const adjustedGray = Math.min(255, gray + (gray > 160 ? bgOffset * ((gray - 160) / 95) : 0));
        const inkDensity = (255 - adjustedGray) / 255;

        if (inkFilter === "deep_black") {
          const val = Math.round(255 - inkDensity * 245);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        } else if (inkFilter === "blue") {
          data[i] = Math.round(255 - inkDensity * 245);
          data[i + 1] = Math.round(255 - inkDensity * 200);
          data[i + 2] = Math.round(255 - inkDensity * 80);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    return canvas;
  }, [getCalculatedDimensions, panOffset, rotation, zoomLevel, brightness, contrast, cleanBgStrength, inkFilter]);

  // स्मार्ट कोर इंजन (सिग्नेचर की स्याही, स्ट्रोक्स व बारीक किनारे 100% सुरक्षित)
  const processSignature = useCallback(async () => {
    if (!cachedImgRef.current) return;
    setIsProcessing(true);

    const canvas = renderSignatureCanvas();
    if (!canvas) {
      setIsProcessing(false);
      return;
    }

    try {
      const { currentDpi } = getCalculatedDimensions();
      const res = await exportSmartJpg(canvas, {
        targetKb: targetKb,
        dpi: currentDpi || 300,
        isDocument: true, // सिग्नेचर के लिए शार्पनेस लॉक
        minQuality: 0.15,
        maxQuality: 0.98,
      });

      setOutputUrl(res.dataUrl);
      setOutputKb(res.actualKb);
    } catch (err) {
      console.error("Signature Smart Export Error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [targetKb, renderSignatureCanvas]);

  useEffect(() => {
    if (imageSrc) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        processSignature();
      }, 150);
    }
  }, [imageSrc, sizeMode, customUnit, pxWidthStr, pxHeightStr, cmWidthStr, cmHeightStr, mmWidthStr, mmHeightStr, inchWidthStr, inchHeightStr, dpiStr, rotation, zoomLevel, panOffset, brightness, contrast, inkFilter, cleanBgStrength, targetKb, processSignature]);

  const downloadJpg = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `Signature_${sizeMode === 'default' ? 'Standard' : customUnit}_${outputKb}KB.jpg`;
    a.click();
  };

  const downloadPdf = async () => {
    if (!outputUrl) return;
    try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(outputUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const signWidth = 70;
      const signHeight = (imgProps.height * signWidth) / imgProps.width;
      const x = (pdfWidth - signWidth) / 2;
      const y = 40;

      pdf.addImage(outputUrl, 'JPEG', x, y, signWidth, signHeight);
      pdf.save(`Signature_${sizeMode === 'default' ? 'Standard' : customUnit}_${outputKb}KB.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF तैयार करने में समस्या आई।');
    }
  };

  const currentDimensions = getCalculatedDimensions();

  // 1. मुख्य कैनवास / लाइव प्रीव्यू ब्लॉक
  const CanvasSection = (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs text-center h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 px-1">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide whitespace-nowrap">
            मुख्य कैनवास प्रीव्यू
          </span>
          {imageSrc && (
            <span className="text-[10px] sm:text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
              ✋ पकड़कर खिसकाएँ
            </span>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {isProcessing && (
            <span className="text-[11px] text-amber-600 animate-pulse font-bold whitespace-nowrap">
              ⚡ प्रोसेसिंग...
            </span>
          )}
          {outputKb > 0 && (
            <span className="text-[11px] sm:text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {outputKb} KB | {currentDimensions.label}
            </span>
          )}
        </div>
      </div>

      <div
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handlePointerUp}
        className={`bg-slate-200 p-2 sm:p-6 rounded-xl border border-slate-300 flex items-center justify-center flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-[580px] overflow-hidden select-none ${
          imageSrc ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
      >
        {outputUrl ? (
          <div className="bg-white p-3 sm:p-5 rounded-xl shadow-2xl border border-slate-300 flex items-center justify-center w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[580px] pointer-events-none">
            <img
              src={outputUrl}
              alt="Signature Preview"
              className="w-full max-h-[190px] sm:max-h-[260px] lg:max-h-[420px] object-contain block mx-auto border border-dashed border-slate-300 rounded"
            />
          </div>
        ) : (
          <div className="text-slate-400 text-xs sm:text-sm font-medium py-16">
            कृपया दाईं तरफ से हस्ताक्षर की फोटो खींचें या A4 स्कैन अपलोड करें
          </div>
        )}
      </div>
    </div>
  );

  // 2. साइडबार कंट्रोल्स (1/3 भाग)
  const ControlsSidebar = (
    <div className="flex flex-col gap-3">
      {/* 1. अपलोड / कैमरा */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {!imageSrc ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 rounded-xl border-2 border-dashed border-blue-500/60 bg-blue-50/50 hover:bg-blue-100/60 text-center flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <span className="text-2xl mb-0.5">📷</span>
              <span className="text-xs font-black text-blue-900">फोटो खींचें</span>
              <span className="text-[9px] text-blue-700">कैमरा खोलें</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-center flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <span className="text-2xl mb-0.5">📁</span>
              <span className="text-xs font-black text-slate-800">A4 स्कैन / फाइल</span>
              <span className="text-[9px] text-slate-500">गैलरी या फाइल</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-green-600 font-bold">✔</span>
              <span className="font-bold text-slate-700">हस्ताक्षर लोड है</span>
              {rawImageSrc && (
                <button
                  onClick={() => {
                    setCropBox(null);
                    setIsCropModalOpen(true);
                  }}
                  className="ml-1 text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 font-black px-2 py-0.5 rounded cursor-pointer border border-blue-200"
                >
                  ✂️ पुनः क्रॉप करें
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="text-blue-700 font-bold hover:underline cursor-pointer"
              >
                📷 कैमरा
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-700 font-bold hover:underline cursor-pointer"
              >
                📁 नई फाइल
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. रोटेशन व ज़ूम */}
      {imageSrc && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-slate-700 uppercase">
                🔄 रोटेशन: {rotation > 0 ? `+${rotation}° दाएँ` : rotation < 0 ? `${rotation}° बाएँ` : `0° (सीधा)`}
              </span>
              {rotation !== 0 && (
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="text-[9px] text-red-600 font-bold hover:underline cursor-pointer"
                >
                  रीसेट (0°)
                </button>
              )}
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-0.5">
              <span onClick={() => setRotation(-90)} className="cursor-pointer hover:text-blue-600">-90°</span>
              <span onClick={() => setRotation(0)} className="cursor-pointer text-blue-700 font-black">0°</span>
              <span onClick={() => setRotation(90)} className="cursor-pointer hover:text-blue-600">+90°</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-700 uppercase">
                🔍 ज़ूम: {zoomLevel.toFixed(1)}x
              </span>
              {(panOffset.x !== 0 || panOffset.y !== 0 || zoomLevel !== 1) && (
                <button
                  type="button"
                  onClick={() => {
                    setPanOffset({ x: 0, y: 0 });
                    setZoomLevel(1);
                  }}
                  className="text-[9px] text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  🎯 सेंटर रीसेट
                </button>
              )}
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.2"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5"
            />
          </div>
        </div>
      )}

      {/* 3. इंक कलर, सफेदी व बैकग्राउंड क्लीनर */}
      {imageSrc && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <label className="block text-[10px] font-black text-slate-700 uppercase">
            स्याही का रंग व कागज़ की सफेदी (HD Quality)
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setInkFilter('deep_black')}
              className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                inkFilter === 'deep_black'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              ⚫ गहरा काला
            </button>
            <button
              type="button"
              onClick={() => setInkFilter('blue')}
              className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                inkFilter === 'blue'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              🔵 नीला पेन
            </button>
            <button
              type="button"
              onClick={() => setInkFilter('original')}
              className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                inkFilter === 'original'
                  ? 'bg-green-600 text-white border-green-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              🖼️ ओरिजिनल
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-0.5">
                <span>सफेदी क्लीनर</span>
                <span className="text-blue-700 font-bold">{cleanBgStrength}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={cleanBgStrength}
                onChange={(e) => setCleanBgStrength(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-bold text-slate-600 mb-0.5">
                <span>कंट्रास्ट (Darkness)</span>
                <span className="text-blue-700 font-bold">{contrast}%</span>
              </div>
              <input
                type="range"
                min="90"
                max="180"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. डिफ़ॉल्ट बनाम कस्टम साइज़ पैनल */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-700 uppercase">
            हस्ताक्षर साइज़ (Size Settings)
          </span>
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSizeMode('default')}
              className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                sizeMode === 'default' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              डिफ़ॉल्ट मानक
            </button>
            <button
              type="button"
              onClick={() => setSizeMode('custom')}
              className={`px-2.5 py-1 text-[10px] font-black rounded cursor-pointer transition-all ${
                sizeMode === 'custom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚙️ कस्टम साइज़
            </button>
          </div>
        </div>

        {sizeMode === 'default' ? (
          <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 text-center">
            <span className="text-xs font-black text-blue-900 block">
              मानक हस्ताक्षर: 4.0 × 2.0 सेमी @ 300 DPI
            </span>
            <span className="text-[10px] text-blue-700 block mt-0.5">
              (SSC, UP Police, रेलवे, IBPS आदि 95% फॉर्म्स के लिए बिल्कुल सही)
            </span>
          </div>
        ) : (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase">इकाई चुनें:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCustomUnit('px')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'px' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  पिक्सेल (Px)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('cm')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'cm' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  सेंटीमीटर (CM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('mm')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'mm' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  मिलीमीटर (MM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomUnit('inch')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                    customUnit === 'inch' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  इंच (Inch)
                </button>
              </div>
            </div>

            {/* पिक्सेल (Px) */}
            {customUnit === 'px' && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (Width Px)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pxWidthStr}
                      onChange={(e) => setPxWidthStr(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="444"
                      className="w-full px-2.5 py-1.5 text-xs border border-blue-400 bg-blue-50/20 rounded font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (Height Px)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pxHeightStr}
                      onChange={(e) => setPxHeightStr(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="205"
                      className="w-full px-2.5 py-1.5 text-xs border border-blue-400 bg-blue-50/20 rounded font-bold"
                    />
                  </div>
                </div>
                <span className="text-[9px] text-blue-600 font-medium mt-1 block">
                  💡 पैन कार्ड: 444 × 205 px (या जो भी संख्या चाहें भरें)
                </span>
              </div>
            )}

            {/* सेंटीमीटर (CM) */}
            {customUnit === 'cm' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (CM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cmWidthStr}
                    onChange={(e) => setCmWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="4.0"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (CM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cmHeightStr}
                    onChange={(e) => setCmHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="2.0"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* मिलीमीटर (MM) */}
            {customUnit === 'mm' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (MM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={mmWidthStr}
                    onChange={(e) => setMmWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="40"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (MM)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={mmHeightStr}
                    onChange={(e) => setMmHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="20"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* इंच (Inch) */}
            {customUnit === 'inch' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">चौड़ाई (Inch)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inchWidthStr}
                    onChange={(e) => setInchWidthStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="2.0"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-0.5">ऊँचाई (Inch)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inchHeightStr}
                    onChange={(e) => setInchHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="1.0"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-bold"
                  />
                </div>
              </div>
            )}

            {/* प्रिंट रेज़ोल्यूशन (DPI) इनपुट */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-600">प्रिंट रेज़ोल्यूशन (DPI):</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={dpiStr}
                  onChange={(e) => setDpiStr(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="300"
                  className="w-16 px-2 py-1 text-xs text-center border border-blue-400 bg-blue-50/20 rounded font-bold"
                />
                <span className="text-[9px] text-slate-400">मानक: 200 / 300 / 600</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. KB स्लाइडर (10 से 200 KB) */}
      {imageSrc && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-700 uppercase">
              टारगेट फ़ाइल साइज (KB)
            </span>
            <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {targetKb} KB
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="1"
            value={targetKb}
            onChange={(e) => setTargetKb(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-1.5"
          />
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
            <span>10 KB</span>
            <span className="text-blue-700 font-bold">10 KB से 200 KB</span>
            <span>200 KB</span>
          </div>
        </div>
      )}

      {/* 6. डाउनलोड बटन्स */}
      {imageSrc && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={downloadJpg}
            disabled={!outputUrl || isProcessing}
            className="py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <span>🖼️ JPG ({outputKb} KB)</span>
          </button>
          <button
            onClick={downloadPdf}
            disabled={!outputUrl || isProcessing}
            className="py-3 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <span>📄 A4 PDF</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-3 px-3 sm:px-6 select-none">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            ← मुख्य होमपेज
          </Link>
        </div>

        <div className="bg-white py-2 px-4 rounded-xl border border-slate-200 shadow-xs mb-3 text-center">
          <h1 className="text-base sm:text-xl font-black text-slate-800">
            सिग्नेचर रिसाइज़र व बैकग्राउंड रिमूवर (Sign Pro)
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
            A4 स्कैन से हस्ताक्षर क्रॉप करें, मानक या कस्टम CM / MM / Px / DPI में सटीक साइज़ व KB बनाएँ।
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFile}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* --- मुख्य लेआउट (मोबाइल: ऊपर स्थिर प्रीव्यू + नीचे स्क्रॉलेबल टूलबॉक्स) --- */}
        <div className="block lg:hidden space-y-3">
          <div className="sticky top-2 z-30 shadow-md rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 p-1">
            {CanvasSection}
          </div>
          <div className="pt-1">
            {ControlsSidebar}
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
          <div className="col-span-8 sticky top-3">
            {CanvasSection}
          </div>
          <div className="col-span-4">
            {ControlsSidebar}
          </div>
        </div>

        {/* --- 100% फ्री क्रॉप विंडो --- */}
        {isCropModalOpen && rawImageSrc && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl w-full md:w-[96vw] md:max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                    <span>✂️ हस्ताक्षर पर बॉक्स खींचें (Free Hand Crop)</span>
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    पन्ने पर जहाँ भी हस्ताक्षर है, सीधे वहाँ माउस या उंगली से खींचकर बॉक्स बनाएँ।
                  </p>
                </div>
                <button
                  onClick={() => setIsCropModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-black px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 flex justify-center items-center md:items-start bg-slate-950 select-none">
                <canvas
                  ref={cropCanvasRef}
                  onMouseDown={(e) => handleCropDown(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleCropMove(e.clientX, e.clientY)}
                  onMouseUp={handleCropUp}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handleCropDown(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) handleCropMove(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchEnd={handleCropUp}
                  className="shadow-2xl border border-slate-700 rounded bg-white cursor-crosshair touch-none block mx-auto max-w-full md:max-w-none h-auto md:h-auto"
                />
              </div>

              <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={useFullImage}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  >
                    पूरा पन्ना रखें (Skip)
                  </button>
                  {cropBox && (
                    <button
                      type="button"
                      onClick={() => setCropBox(null)}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      बॉक्स हटाएँ (Clear)
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={rotateCropImage}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    title="इमेज को 90 डिग्री घुमाएँ"
                  >
                    <span>🔄</span>
                    <span>90° घुमाएँ</span>
                  </button>
                  <button
                    type="button"
                    onClick={confirmCrop}
                    disabled={!cropBox}
                    className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg shadow-md cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1"
                  >
                    <span>✔ यह हस्ताक्षर क्रॉप करें (Done)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SEO & KNOWLEDGE SECTION START ================= */}
      <article className="col-span-full w-full max-w-6xl mx-auto mt-14 mb-20 px-4 sm:px-6 lg:px-8 text-slate-800 space-y-12 border-t border-slate-200 pt-10">
        
        {/* 1. संपादकीय मुख्य हेडिंग और कीवर्ड रिच परिचय */}
        <header className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            ऑनलाइन सिग्नेचर रीसाइज़र और क्रॉपर (Signature Resizer Pro Online in Exact KB)
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            सरकारी परीक्षाओं (SSC, UPSC, UP Police, Railway, IBPS, NTA) और ऑनलाइन फॉर्म में हस्ताक्षर (Signature) अपलोड करते समय सबसे आम समस्या फाइल साइज (10 KB से 20 KB या 50 KB) और आयाम (CM / Pixel / DPI) की होती है। <strong>ExamSewa Signature Resizer Pro</strong> एक क्लाइंट-साइड स्मार्ट टूल है जो बिना धुंधला किए आपके हस्ताक्षर को सटीक KB, 200/300 DPI और सेंटीमीटर/मिलीमीटर में तैयार करता है।
          </p>
        </header>

        {/* 2. प्रमुख सरकारी परीक्षाओं के हस्ताक्षर मानक (खुला और उत्तरदायी टेबल) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              प्रमुख सरकारी परीक्षाओं के लिए हस्ताक्षर नियम व मानक (Exam Signature Dimensions)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            विभिन्न भर्ती आयोगों द्वारा निर्धारित किए गए आधिकारिक माप और फाइल साइज की सूची:
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800">
                  <th className="py-3.5 px-4 font-bold">परीक्षा / बोर्ड का नाम</th>
                  <th className="py-3.5 px-4 font-bold">माप (Dimensions)</th>
                  <th className="py-3.5 px-4 font-bold">फाइल साइज़ (Exact KB)</th>
                  <th className="py-3.5 px-4 font-bold">स्याही का प्रकार</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">SSC (CGL, CHSL, MTS, GD)</td>
                  <td className="py-3 px-4">4.0 cm × 2.0 cm</td>
                  <td className="py-3 px-4 font-bold text-blue-600">10 KB – 20 KB</td>
                  <td className="py-3 px-4">काली स्याही (Black Ball Pen)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">UP Police / UPSSSC</td>
                  <td className="py-3 px-4">3.5 cm × 1.5 cm</td>
                  <td className="py-3 px-4 font-bold text-blue-600">5 KB – 20 KB</td>
                  <td className="py-3 px-4">काली या नीली स्याही</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">IBPS / SBI Bank PO & Clerk</td>
                  <td className="py-3 px-4">140 × 60 Pixels</td>
                  <td className="py-3 px-4 font-bold text-blue-600">10 KB – 20 KB</td>
                  <td className="py-3 px-4">केवल काली स्याही (Black Ink)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">UPSC (Civil Services, NDA, CDS)</td>
                  <td className="py-3 px-4">350 × 350 Pixels (Min)</td>
                  <td className="py-3 px-4 font-bold text-blue-600">20 KB – 50 KB</td>
                  <td className="py-3 px-4">काली स्याही (सफेद बैकग्राउंड)</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">NTA (NEET, JEE Main, CUET)</td>
                  <td className="py-3 px-4">3.5 cm × 1.5 cm</td>
                  <td className="py-3 px-4 font-bold text-blue-600">4 KB – 30 KB</td>
                  <td className="py-3 px-4">सफेद कागज पर स्पष्ट हस्ताक्षर</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-800">Railway (RRB ALP, NTPC, Group D)</td>
                  <td className="py-3 px-4">50 × 20 mm</td>
                  <td className="py-3 px-4 font-bold text-blue-600">10 KB – 50 KB</td>
                  <td className="py-3 px-4">काली/नीली स्याही</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. चरण-दर-चरण मार्गदर्शिका (How-to Guide) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              हस्ताक्षर को सही माप और 20 KB में कैसे रीसाइज़ करें? (Step-by-Step Guide)
            </h3>
          </div>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            <li>
              <strong>हस्ताक्षर अपलोड करें:</strong> सादे सफेद कागज पर किए गए हस्ताक्षर की फोटो मोबाइल कैमरे या गैलरी से अपलोड करें।
            </li>
            <li>
              <strong>फ्री-हैंड बॉक्स क्रॉप (Smart Cropping):</strong> पन्ने के फालतू हिस्से को छोड़ते हुए केवल अपने मुख्य हस्ताक्षर पर उंगली से बॉक्स खींचकर क्रॉप करें।
            </li>
            <li>
              <strong>कागज का पीलापन व बैकग्राउंड साफ करें:</strong> यदि कमरे की रोशनी के कारण कागज पीला या मटमैला दिख रहा है, तो <strong>काली (Black Ink)</strong> या <strong>नीली (Blue Ink)</strong> टोन का चयन करें।
            </li>
            <li>
              <strong>माप (Dimensions) और DPI सेट करें:</strong> अपनी परीक्षा की आवश्यकतानुसार सेंटीमीटर (cm), मिलीमीटर (mm), इंच (inch) या पिक्सल (px) चुनें और 300 DPI सुनिश्चित करें।
            </li>
            <li>
              <strong>सटीक फाइल साइज (Target KB) चुनें:</strong> 20 KB या 50 KB बटन पर क्लिक करें। टूल बिना किसी गुणवत्ता गिरावट के आपकी फाइल को सटीक साइज में डाउनलोड कर देगा।
            </li>
          </ol>
        </section>

        {/* 4. मुख्य लाभ व तकनीकी विशेषताएँ */}
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>✨</span> ExamSewa सिग्नेचर रीसाइज़र के प्रमुख लाभ
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>10-Step Binary Search Compression:</strong> 20 KB या 10 KB पर भी स्ट्रोक धुंधले (Blur) नहीं होते।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>300 DPI प्रिंट क्वालिटी:</strong> उच्च रिज़ॉल्यूशन मानक जिससे प्रवेश पत्र और सत्यापन में हस्ताक्षर साफ दिखे।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>100% प्राइवेसी व सुरक्षा:</strong> आपकी फाइल किसी बाहरी सर्वर पर अपलोड नहीं होती; सब कुछ आपके ब्राउज़र में होता है।</span>
            </li>
            <li className="flex items-start gap-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <span className="text-emerald-600 font-bold">✔</span>
              <span><strong>विज्ञापन-मुक्त (Zero Ads):</strong> साइबर कैफे संचालकों और छात्रों के लिए तेज़ व निर्बाध अनुभव।</span>
            </li>
          </ul>
        </section>

        {/* 5. अक्सर पूछे जाने वाले सवाल (FAQ Section) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">❓</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              अक्सर पूछे जाने वाले सवाल (Frequently Asked Questions - FAQs)
            </h3>
          </div>
          <div className="divide-y divide-slate-200 text-sm">
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q1. 20 KB या 10 KB में रीसाइज़ करने के बाद क्या हस्ताक्षर धुंधला दिखेगा?</h4>
              <p className="text-slate-600 leading-relaxed">
                नहीं। हमारा स्मार्ट इंजन केवल बैकग्राउंड और खाली पिक्सल को कंप्रेस करता है, जिससे हस्ताक्षर के मुख्य अक्षरों की शार्पनेस (किनारों का तीखापन) पूरी तरह सुरक्षित रहती है।
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q2. क्या नीले पेन से किए गए हस्ताक्षर को काला (Black) किया जा सकता है?</h4>
              <p className="text-slate-600 leading-relaxed">
                हाँ। SSC और बैंक जैसी परीक्षाओं में काली स्याही अनिवार्य होती है। हमारे टूल में 'काली स्याही (Black Ink)' विकल्प चुनते ही नीले पेन का स्ट्रोक डिजिटल ब्लैक में परिवर्तित हो जाता है।
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-base">Q3. एसएससी और यूपी पुलिस के लिए हस्ताक्षर का सही सेंटीमीटर माप क्या है?</h4>
              <p className="text-slate-600 leading-relaxed">
                एसएससी (SSC) के लिए मानक माप 4.0 सेमी × 2.0 सेमी (10 से 20 KB) है, जबकि यूपी पुलिस और यूपीएसएसएससी (UP Police/UPSSSC) के लिए 3.5 सेमी × 1.5 सेमी (5 से 20 KB) मान्य है।
              </p>
            </div>
          </div>
        </section>

      </article>
      {/* ================= SEO & KNOWLEDGE SECTION END ================= */}
    </div>
  );
}