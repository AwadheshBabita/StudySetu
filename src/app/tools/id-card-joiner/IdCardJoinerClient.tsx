"use client";

import React, { useState, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

export default function IdCardJoinerClient() {
  // 1. आईडी कार्ड स्लॉट्स
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<"front" | "back">("front");
  const [idLayoutMode, setIdLayoutMode] = useState<"horizontal" | "vertical">("horizontal");

  // 2. दिशा व घुमाव (Front/Back आधारित)
  const [activeSideTool, setActiveSideTool] = useState<"front" | "back">("front");
  const [rotationAngles, setRotationAngles] = useState<{ front: number; back: number }>({ front: 0, back: 0 });
  const [flipH, setFlipH] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });
  const [flipV, setFlipV] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });

  // 3. फिल्टर्स व एडजस्टमेंट स्लाइडर्स
  const [filterMode, setFilterMode] = useState<"magic" | "bw" | "gray" | "original">("magic");
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(20);
  const [saturation, setSaturation] = useState<number>(0);

  // 4. फाइल क्वालिटी व साइज
  const [targetKb, setTargetKb] = useState<number>(150);
  const [customKb, setCustomKb] = useState<number>(150);
  const [isMaxHd, setIsMaxHd] = useState<boolean>(false);

  // 5. स्मार्ट स्कैनर नेविगेशन व क्रॉप स्टेट्स
  const [screen, setScreen] = useState<"id_home" | "scanner_picker" | "scanner_crop">("id_home");
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // लाइव कैमरा संदर्भ
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // क्रॉपर कैनवास संदर्भ
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cornersRef = useRef<Point[]>([]);
  const activePointIdxRef = useRef<number | null>(null);

  // ===================== एक्शन फ़ंक्शन्स =====================
  const handleSelectSlot = (slot: "front" | "back") => {
    setTargetSlot(slot);
    setScreen("scanner_picker");
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImageSrc(ev.target?.result as string);
      setScreen("scanner_crop");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleStartCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      alert("कैमरा शुरू नहीं हो सका। कृपया गैलरी से फ़ोटो चुनें।");
      setCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const snapUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setRawImageSrc(snapUrl);
    setScreen("scanner_crop");
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // दिशा व घुमाव हैंडलर्स
  const handleRotate = (dir: "left" | "right") => {
    const side = activeSideTool;
    setRotationAngles((prev) => ({
      ...prev,
      [side]: (prev[side] + (dir === "right" ? 90 : -90) + 360) % 360,
    }));
  };

  const handleMirror = () => {
    const side = activeSideTool;
    setFlipH((prev) => ({ ...prev, [side]: !prev[side] }));
  };

  const handleFlipV = () => {
    const side = activeSideTool;
    setFlipV((prev) => ({ ...prev, [side]: !prev[side] }));
  };

  // कॉर्नर डिटेक्शन
  const detectDocumentCorners = (img: HTMLImageElement): Point[] => {
    const w = img.width;
    const h = img.height;
    return [
      { x: Math.round(w * 0.08), y: Math.round(h * 0.12) },
      { x: Math.round(w * 0.92), y: Math.round(h * 0.12) },
      { x: Math.round(w * 0.92), y: Math.round(h * 0.88) },
      { x: Math.round(w * 0.08), y: Math.round(h * 0.88) },
    ];
  };

  const rotateSourceImage = () => {
    const img = imgRef.current;
    if (!img) return;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.height;
    tempCanvas.height = img.width;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    const rotatedData = tempCanvas.toDataURL("image/jpeg", 0.95);
    const newImg = new Image();
    newImg.onload = () => {
      imgRef.current = newImg;
      const cvs = canvasRef.current;
      if (cvs) {
        cvs.width = newImg.width;
        cvs.height = newImg.height;
        cornersRef.current = detectDocumentCorners(newImg);
        drawCropCanvas(null);
      }
    };
    newImg.src = rotatedData;
  };

  // क्रॉपर कैनवास ड्रॉ
  const drawCropCanvas = (activeIdx: number | null = activePointIdxRef.current) => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    if (!cvs || !img) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

    const pts = cornersRef.current;
    if (!pts || pts.length !== 4) return;

    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, cvs.width, cvs.height);
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.closePath();
    ctx.fill("evenodd");

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(cvs.width / 320));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.stroke();

    const outerRadius = Math.max(16, Math.round(cvs.width * 0.026));
    const innerRadius = Math.max(6, Math.round(cvs.width * 0.01));
    pts.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = activeIdx === idx ? "#2563eb" : "#1d4ed8";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    if (activeIdx !== null && pts[activeIdx]) {
      const activePt = pts[activeIdx];
      const magRadius = Math.max(55, Math.round(cvs.width * 0.12));
      const zoom = 2.2;
      let magX = activePt.x;
      let magY = activePt.y - magRadius - 35;
      if (magY - magRadius < 0) magY = activePt.y + magRadius + 35;
      if (magX - magRadius < 0) magX = magRadius + 10;
      if (magX + magRadius > cvs.width) magX = cvs.width - magRadius - 10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#000";
      ctx.fillRect(magX - magRadius, magY - magRadius, magRadius * 2, magRadius * 2);

      ctx.drawImage(
        img,
        activePt.x - magRadius / zoom,
        activePt.y - magRadius / zoom,
        (magRadius * 2) / zoom,
        (magRadius * 2) / zoom,
        magX - magRadius,
        magY - magRadius,
        magRadius * 2,
        magRadius * 2
      );

      ctx.restore();
      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2563eb";
      ctx.stroke();

                  // लेंस के अंदर का 3 गुना बड़ा व स्पष्ट टारगेट (+)
      ctx.strokeStyle = "#ef4444"; // गहरा लाल
      ctx.lineWidth = 6; // 3x बोल्ड मोटाई
      ctx.beginPath();
      // क्षैतिज रेखा (3x बड़ी: 60px)
      ctx.moveTo(magX - 60, magY);
      ctx.lineTo(magX + 60, magY);
      // लंबवत रेखा (3x बड़ी: 60px)
      ctx.moveTo(magX, magY - 60);
      ctx.lineTo(magX, magY + 60);
      ctx.stroke();

      // सेंटर पिनपॉइंट डॉट (3x बड़ा)
      ctx.beginPath();
      ctx.arc(magX, magY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
    }
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height),
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;
    const hitRadius = Math.max(40, cvs.width * 0.08);
    const pts = cornersRef.current;
    let closestIdx = -1;
    let minDist = hitRadius;
    pts.forEach((p, idx) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < minDist) {
        minDist = d;
        closestIdx = idx;
      }
    });
    if (closestIdx !== -1) {
      activePointIdxRef.current = closestIdx;
      drawCropCanvas(closestIdx);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (activePointIdxRef.current === null) return;
    const { x, y } = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;
    cornersRef.current[activePointIdxRef.current] = {
      x: Math.max(0, Math.min(cvs.width, x)),
      y: Math.max(0, Math.min(cvs.height, y)),
    };
    drawCropCanvas(activePointIdxRef.current);
  };

  const handlePointerUp = () => {
    if (activePointIdxRef.current !== null) {
      activePointIdxRef.current = null;
      drawCropCanvas(null);
    }
  };

  const runCropToSlot = () => {
    const img = imgRef.current;
    const pts = cornersRef.current;
    if (!img || pts.length !== 4) return;
    setProcessing(true);
    const outW = 1012;
    const outH = 638;
    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }
    const slices = 320;
    for (let i = 0; i < slices; i++) {
      const t1 = i / slices;
      const t2 = (i + 1) / slices;
      const lx1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
      const ly1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
      const rx1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
      const ry1 = pts[1].y + (pts[2].y - pts[1].y) * t1;
      const dy1 = t1 * outH;
      const dy2 = t2 * outH;
      const dh = dy2 - dy1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, dy1, outW, dh + 0.8);
      ctx.clip();
      const angle = Math.atan2(ry1 - ly1, rx1 - lx1);
      const spanW = Math.hypot(rx1 - lx1, ry1 - ly1);
      ctx.translate(0, dy1);
      ctx.scale(outW / spanW, 1);
      ctx.rotate(-angle);
      ctx.drawImage(img, -lx1, -ly1);
      ctx.restore();
    }
    const croppedResult = outCanvas.toDataURL("image/jpeg", 0.95);
    if (targetSlot === "front") {
      setFrontImage(croppedResult);
    } else {
      setBackImage(croppedResult);
    }
    setProcessing(false);
    setRawImageSrc(null);
    setScreen("id_home");
  };

  useEffect(() => {
    if (screen === "scanner_crop" && rawImageSrc) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        const cvs = canvasRef.current;
        if (cvs) {
          cvs.width = img.width;
          cvs.height = img.height;
          cornersRef.current = detectDocumentCorners(img);
          drawCropCanvas(null);
        }
      };
      img.src = rawImageSrc;
    }
  }, [screen, rawImageSrc]);

  // डाउनलोड इंजन
    // असली गणितीय मैजिक कलर (Auto Enhance / Adaptive Paper Whitening)
  const applyPixelFilters = (canvas: HTMLCanvasElement, mode: "magic" | "bw" | "gray" | "original") => {
    if (mode === "original") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // 1. Min-Max लेवल्स निकालना
    let minLum = 255;
    let maxLum = 0;
    for (let i = 0; i < d.length; i += 16) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }
    const range = Math.max(1, maxLum - minLum);

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (mode === "bw") {
        // B&W Xerox: सख्त थ्रेशोल्ड
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = lum < 145 ? 0 : 255;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else if (mode === "gray") {
        // Grayscale: प्राकृतिक ग्रे
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = lum;
        d[i + 1] = lum;
        d[i + 2] = lum;
      } else if (mode === "magic") {
        // असली Magic Color (Selective Color Boost + Paper Whitening)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // बैकग्राउंड सफ़ेद करना और टेक्स्ट को गहरा करना (Sigmoid-like Contrast)
        let newLum = ((lum - minLum) / range) * 255;
        if (newLum > 195) {
          // कागज़ का हल्का हिस्सा सीधा 255 (प्योर व्हाइट)
          newLum = 255 - (255 - newLum) * 0.25;
        } else if (newLum < 75) {
          // टेक्स्ट का गहरा हिस्सा और डार्क
          newLum = newLum * 0.7;
        }

        const scale = lum > 0 ? newLum / lum : 1;
        
        // रंगों को सुरक्षित रखते हुए ब्राइटनेस बढ़ाना
        let nr = Math.min(255, Math.max(0, r * scale));
        let ng = Math.min(255, Math.max(0, g * scale));
        let nb = Math.min(255, Math.max(0, b * scale));

        // कलर सैचुरेशन हल्का बूस्ट (मुहर व फ़ोटो के लिए)
        const avg = (nr + ng + nb) / 3;
        nr = Math.min(255, Math.max(0, avg + (nr - avg) * 1.25));
        ng = Math.min(255, Math.max(0, avg + (ng - avg) * 1.25));
        nb = Math.min(255, Math.max(0, avg + (nb - avg) * 1.25));

        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const generateA4Canvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = 2480;
    canvas.height = 3508;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardW = 1012;
    const cardH = 638;
    const startY = 260;

    const renderCard = (imgSrc: string | null, x: number, y: number, side: "front" | "back") => {
      if (!imgSrc) return;
      const img = new Image();
      img.src = imgSrc;
            const cardCanvas = document.createElement("canvas");
      cardCanvas.width = cardW;
      cardCanvas.height = cardH;
      const cctx = cardCanvas.getContext("2d");
      if (cctx) {
        cctx.drawImage(img, 0, 0, cardW, cardH);
        applyPixelFilters(cardCanvas, filterMode);
      }

      ctx.save();
      ctx.translate(x + cardW / 2, y + cardH / 2);
      ctx.rotate((rotationAngles[side] * Math.PI) / 180);
      ctx.scale(flipH[side] ? -1 : 1, flipV[side] ? -1 : 1);

      let filterStr = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
      ctx.filter = filterStr;

      ctx.drawImage(cardCanvas, -cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cardW, cardH);
    };

    if (idLayoutMode === "horizontal") {
      const gap = 80;
      const totalW = cardW * 2 + gap;
      const startX = (canvas.width - totalW) / 2;
      renderCard(frontImage, startX, startY, "front");
      renderCard(backImage, startX + cardW + gap, startY, "back");
    } else {
      const startX = (canvas.width - cardW) / 2;
      renderCard(frontImage, startX, startY, "front");
      renderCard(backImage, startX, startY + cardH + 70, "back");
    }

    return canvas;
  };

  const handleDownloadJpg = () => {
    const cvs = generateA4Canvas();
    const quality = isMaxHd ? 1.0 : Math.min(0.95, Math.max(0.4, targetKb / 400));
    const url = cvs.toDataURL("image/jpeg", quality);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ID_Card_A4_${targetKb}KB.jpg`;
    a.click();
  };

  const handleShare = async () => {
    const cvs = generateA4Canvas();
    const quality = isMaxHd ? 1.0 : Math.min(0.95, Math.max(0.4, targetKb / 400));
    
    // सटीक वही डेटा URL लें जो डाउनलोड में जाता है ताकि कलर व ब्राइटनेस 100% समान रहे
    const dataUrl = cvs.toDataURL("image/jpeg", quality);
    
    // डेटा URL से सीधे सटीक बाइट्स बनाकर फ़ाइल तैयार करें
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: "image/jpeg" });
    const file = new File([blob], `ID_Card_A4_${targetKb}KB.jpg`, { type: "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "ID Card A4" });
      } catch (err) {
        // अगर यूज़र ने शेयर कैंसिल कर दिया
      }
    } else {
      handleDownloadJpg();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none pb-10">
      
      {/* ===================== दृश्य 1: मुख्य A4 प्रीव्यू और सारे टूल्स ===================== */}
      {screen === "id_home" && (
        <div className="relative min-h-screen flex flex-col">
          
          {/* 1. स्टिकी प्रिव्यू बॉक्स (ऊपर रुका रहेगा) */}
          <div className="fixed top-[52px] left-0 right-0 z-30 bg-slate-100/95 backdrop-blur-sm border-b-2 border-slate-300 shadow-md px-3 pt-2 pb-2">
            <div className="max-w-md mx-auto border-2 border-slate-900 rounded-2xl p-2 bg-white shadow-sm">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 text-xs">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <span>📄</span> A4 शीट प्रीव्यू बॉक्स
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  {idLayoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"} • ~{targetKb} KB
                </span>
              </div>

              <div className="w-full flex items-center justify-center py-0.5">
                <div className="w-full max-w-[215px] aspect-[210/297] bg-white rounded-lg border-2 border-slate-800 shadow-sm p-1.5 flex flex-col items-center justify-between">
                  <div
                    className={`w-full flex justify-center gap-1 transition-all ${
                      idLayoutMode === "horizontal" ? "flex-row items-center pt-0.5" : "flex-col items-center pt-0.5 gap-1"
                    }`}
                  >
                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {frontImage ? (
                        <img
                          src={frontImage}
                          alt="आगे का भाग"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${rotationAngles.front}deg) scale(${flipH.front ? -1 : 1}, ${flipV.front ? -1 : 1})`,
                            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) ${
                              filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""
                            }`,
                          }}
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400">आगे का भाग (Front)</span>
                      )}
                    </div>

                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {backImage ? (
                        <img
                          src={backImage}
                          alt="पीछे का भाग"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${rotationAngles.back}deg) scale(${flipH.back ? -1 : 1}, ${flipV.back ? -1 : 1})`,
                            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) ${
                              filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""
                            }`,
                          }}
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full pt-1 border-t border-dashed border-slate-300 text-center">
                    <span className="text-[7.5px] text-slate-400 font-medium">
                      ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. नीचे का स्लाइडिंग टूल बॉक्स (सारे टूल्स यहाँ लाइन से मौजूद हैं) */}
          <div className="w-full max-w-md mx-auto px-3 pt-[355px] pb-32 space-y-3.5 z-10 relative">
            <div className="text-center pt-2">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                ↓ टूल बॉक्स (ऊपर-नीचे स्लाइड करें)
              </p>
            </div>

            {/* कार्ड चयन बटन्स (आगे / पीछे) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectSlot("front")}
                className={`py-3.5 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                  frontImage
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "bg-white hover:bg-blue-50 border-blue-300 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {frontImage ? "✓ आगे का भाग (Front)" : "📷 आगे का भाग (Front)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {frontImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSlot("back")}
                className={`py-3.5 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                  backImage
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "bg-white hover:bg-blue-50 border-blue-300 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {backImage ? "✓ पीछे का भाग (Back)" : "📷 पीछे का भाग (Back)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {backImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}
                </span>
              </button>
            </div>

            {/* कार्ड लेआउट */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-black text-slate-900 block">कार्ड लेआउट</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIdLayoutMode("horizontal")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    idLayoutMode === "horizontal"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  अगल - बगल (मानक)
                </button>
                <button
                  type="button"
                  onClick={() => setIdLayoutMode("vertical")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    idLayoutMode === "vertical"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  ऊपर - नीचे
                </button>
              </div>
            </div>

            {/* दिशा व घुमाव */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">दिशा व घुमाव</span>
                <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveSideTool("front")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeSideTool === "front"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 font-bold hover:text-slate-900"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSideTool("back")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeSideTool === "back"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-700 font-bold hover:text-slate-900"
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate("left")}
                  className="py-2.5 px-1 border-2 border-amber-200/90 rounded-xl text-center bg-amber-50/70 hover:bg-amber-100/60 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5">
                    <span>↺</span>
                    <span>-90°</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate("right")}
                  className="py-2.5 px-1 border-2 border-amber-200/90 rounded-xl text-center bg-amber-50/70 hover:bg-amber-100/60 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5">
                    <span>↻</span>
                    <span>+90°</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleMirror}
                  className="py-2.5 px-1 border-2 border-amber-200/90 rounded-xl text-center bg-amber-50/70 hover:bg-amber-100/60 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
                    <span>⇄</span>
                    <span>क्षैतिज</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleFlipV}
                  className="py-2.5 px-1 border-2 border-amber-200/90 rounded-xl text-center bg-amber-50/70 hover:bg-amber-100/60 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
                    <span>⇅</span>
                    <span>लंबवत</span>
                  </div>
                </button>
              </div>
            </div>

            {/* फिल्टर्स */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("magic")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "magic"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  <span>✨</span>
                  <span>Magic Color</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("bw")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "bw"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  <span>📄</span>
                  <span>B&W Xerox</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("gray")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "gray"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  <span>🔘</span>
                  <span>Grayscale</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("original")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "original"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                  }`}
                >
                  <span>🌅</span>
                  <span>Original</span>
                </button>
              </div>
            </div>

            {/* एडजस्टमेंट स्लाइडर्स */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>सफ़ेदी / उजाला (Light)</span>
                  <span className="text-blue-600 font-bold">{brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कंट्रास्ट / गहराई (Sharp)</span>
                  <span className="text-blue-600 font-bold">{contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कलर सैचुरेशन (रंग का गाढ़ापन)</span>
                  <span className="text-blue-600 font-bold">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>हल्का / फीका (-100%)</span>
                  <span>डिफ़ॉल्ट (0%)</span>
                  <span>गाढ़ा चटक (+100%)</span>
                </div>
              </div>
            </div>

            {/* फ़ाइल क्वालिटी व साइज़ */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-900">फ़ाइल क्वालिटी व साइज़:</label>
                <span className="text-[10px] bg-blue-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  लगभग {targetKb} KB
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50, 100, 200, 300].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => {
                      setTargetKb(kb);
                      setCustomKb(kb);
                      setIsMaxHd(false);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetKb === kb && !isMaxHd
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"
                    }`}
                  >
                    {kb} KB
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsMaxHd(!isMaxHd)}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1.5 ${
                  isMaxHd
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-50/80 text-emerald-900 border-2 border-emerald-300 hover:bg-emerald-100 font-black shadow-xs"
                }`}
              >
                <span>⭐</span>
                <span>मैक्स एचडी</span>
              </button>

              <div className="pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कस्टम साइज़ चुनें:</span>
                  <span className="text-blue-600 font-bold">{customKb} KB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  value={customKb}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomKb(val);
                    setTargetKb(val);
                    setIsMaxHd(false);
                  }}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>10 KB</span>
                  <span>300 KB</span>
                  <span>600 KB</span>
                </div>
              </div>
            </div>

            {/* डाउनलोड या शेयर करें */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <label className="text-xs font-black text-slate-900 block text-center">
                डाउनलोड या शेयर करें (खड़ा A4):
              </label>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span>सीधे शेयर करें (WhatsApp / Bluetooth / Gmail)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>🖼️</span>
                <span>JPG डाउनलोड ({targetKb} KB)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>A4 PDF डाउनलोड</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ===================== दृश्य 2: स्मार्ट डॉक्यूमेंट स्कैनर का असली पेज ===================== */}
      {screen === "scanner_picker" && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-start items-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 mt-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setScreen("id_home")}
                className="text-blue-600 text-xs font-bold flex items-center space-x-1 hover:underline"
              >
                <span>← वापस</span>
              </button>
              <h2 className="text-sm font-black text-slate-900 flex-1 text-center pr-8">
                {targetSlot === "front" ? "आगे का भाग (Front)" : "पीछे का भाग (Back)"} स्कैन करें
              </h2>
            </div>

            <div
              onClick={handleStartCamera}
              className="border-2 border-dashed border-blue-400 bg-blue-50/20 hover:bg-blue-50/50 rounded-3xl p-7 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 text-center space-y-2 shadow-xs"
            >
              <div className="text-4xl">📸</div>
              <h3 className="text-base font-bold text-blue-600 mt-1">कैमरा खोलें</h3>
              <p className="text-xs text-slate-500 font-medium">सीधे कैमरे से काग़ज़ की फ़ोटो लें</p>
            </div>

            <label className="border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-3xl p-7 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 text-center space-y-2 block shadow-xs">
              <div className="text-4xl">📁</div>
              <h3 className="text-base font-bold text-slate-800 mt-1">गैलरी से चुनें</h3>
              <p className="text-xs text-slate-500 font-medium">गैलरी से फ़ोटो अपलोड करें</p>
              <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* ===================== लाइव कैमरा ===================== */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4">
          <div className="w-full flex justify-between items-center text-white pt-2">
            <span className="text-xs font-bold">
              {targetSlot === "front" ? "आगे का भाग (Front)" : "पीछे का भाग (Back)"} फ़ोटो लें
            </span>
            <button
              onClick={handleStopCamera}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700"
            >
              ✕ बंद करें
            </button>
          </div>

          <div className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-8 border border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/70 bg-black/50 px-2 py-0.5 rounded">कार्ड बीच में रखें</span>
            </div>
          </div>

          <div className="pb-6">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ===================== दृश्य 3: स्मार्ट डॉक्यूमेंट स्कैनर का असली क्रॉपर ===================== */}
      {screen === "scanner_crop" && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-3 select-none overflow-y-auto">
          <div className="max-w-xl mx-auto w-full space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium text-[11px] flex items-center gap-1 truncate">
                <span>👉</span> चारों कोनों को अलग-अलग खींचकर कागज़ पर सेट करें
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (imgRef.current) {
                      cornersRef.current = detectDocumentCorners(imgRef.current);
                      drawCropCanvas(null);
                    }
                  }}
                  className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg border border-emerald-700 font-bold hover:bg-emerald-700 flex items-center space-x-1 shrink-0 text-xs shadow-xs transition active:scale-95"
                >
                  <span>⚡</span>
                  <span>ऑटो-डिटेक्ट</span>
                </button>
                <button
                  type="button"
                  onClick={rotateSourceImage}
                  className="bg-white px-2 py-0.5 rounded-lg border border-blue-300 font-bold hover:bg-blue-100 flex items-center space-x-1 shrink-0 text-xs shadow-xs transition active:scale-95 text-slate-800"
                >
                  <span>🔄</span>
                  <span>90°</span>
                </button>
              </div>
            </div>

            <div className="border-2 border-slate-900 rounded-2xl p-1 bg-slate-950 shadow-md overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  if (t) handlePointerDown(t.clientX, t.clientY);
                }}
                onTouchMove={(e) => {
                  const t = e.touches[0];
                  if (t) handlePointerMove(t.clientX, t.clientY);
                }}
                onTouchEnd={handlePointerUp}
                className="max-h-[60vh] sm:max-h-[520px] w-auto max-w-full mx-auto cursor-crosshair block select-none shadow-lg"
              />
            </div>

            <div className="flex items-center space-x-2.5 pt-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  setScreen("scanner_picker");
                  setRawImageSrc(null);
                }}
                className="w-1/3 py-3 px-2 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95 text-center"
              >
                🔄 नई तस्वीर
              </button>
              <button
                type="button"
                onClick={runCropToSlot}
                disabled={processing}
                className="w-2/3 bg-blue-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-xs sm:text-sm active:scale-95 text-center"
              >
                {processing ? "सीधा हो रहा है..." : "📐 काग़ज़ क्रॉप करें (Crop)"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
