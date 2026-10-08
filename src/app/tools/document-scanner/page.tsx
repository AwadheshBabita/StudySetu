"use client";
import { exportSmartJpg } from "@/lib/image-engine";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

type FilterMode = "original" | "magic" | "bw" | "grayscale";
type PageOrientation = "portrait" | "landscape";

export default function DocumentScannerPage() {
  const [step, setStep] = useState<"capture" | "crop" | "filter">("capture");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("magic");
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(20);
  const [saturation, setSaturation] = useState<number>(0);
  const [targetKb, setTargetKb] = useState<number>(250);
  const [actualKb, setActualKb] = useState<number>(250);
  const [processing, setProcessing] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [jpgDownloadUrl, setJpgDownloadUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseProcessedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawCroppedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const cornersRef = useRef<Point[]>([]);
  const activePointIdxRef = useRef<number | null>(null);
  const kbDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ऑटो डॉक्यूमेंट एज डिटेक्शन इंजन (Edge Contrast & Brightness Gradient)
  const detectDocumentCorners = (img: HTMLImageElement): Point[] => {
    const sw = 320;
    const sh = Math.round((img.height / img.width) * sw);
    const cvs = document.createElement("canvas");
    cvs.width = sw;
    cvs.height = sh;
    const ctx = cvs.getContext("2d");
    if (!ctx) {
      const px = img.width * 0.08, py = img.height * 0.08;
      return [
        { x: px, y: py },
        { x: img.width - px, y: py },
        { x: img.width - px, y: img.height - py },
        { x: px, y: img.height - py }
      ];
    }

    ctx.drawImage(img, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    const getLum = (x: number, y: number) => {
      const idx = (y * sw + x) * 4;
      return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    };

    let topY = Math.round(sh * 0.08);
    let bottomY = Math.round(sh * 0.92);
    let leftX = Math.round(sw * 0.08);
    let rightX = Math.round(sw * 0.92);

    // ऊपर से स्कैन
    for (let y = 10; y < sh * 0.4; y += 4) {
      let diffSum = 0;
      for (let x = sw * 0.2; x < sw * 0.8; x += 10) {
        diffSum += Math.abs(getLum(Math.round(x), y + 4) - getLum(Math.round(x), y));
      }
      if (diffSum / ((sw * 0.6) / 10) > 22) {
        topY = y;
        break;
      }
    }

    // नीचे से स्कैन
    for (let y = sh - 10; y > sh * 0.6; y -= 4) {
      let diffSum = 0;
      for (let x = sw * 0.2; x < sw * 0.8; x += 10) {
        diffSum += Math.abs(getLum(Math.round(x), y - 4) - getLum(Math.round(x), y));
      }
      if (diffSum / ((sw * 0.6) / 10) > 22) {
        bottomY = y;
        break;
      }
    }

    // बाएँ से स्कैन
    for (let x = 10; x < sw * 0.4; x += 4) {
      let diffSum = 0;
      for (let y = sh * 0.2; y < sh * 0.8; y += 10) {
        diffSum += Math.abs(getLum(x + 4, Math.round(y)) - getLum(x, Math.round(y)));
      }
      if (diffSum / ((sh * 0.6) / 10) > 22) {
        leftX = x;
        break;
      }
    }

    // दाएँ से स्कैन
    for (let x = sw - 10; x > sw * 0.6; x -= 4) {
      let diffSum = 0;
      for (let y = sh * 0.2; y < sh * 0.8; y += 10) {
        diffSum += Math.abs(getLum(x - 4, Math.round(y)) - getLum(x, Math.round(y)));
      }
      if (diffSum / ((sh * 0.6) / 10) > 22) {
        rightX = x;
        break;
      }
    }

    const scaleX = img.width / sw;
    const scaleY = img.height / sh;

    return [
      { x: Math.round(leftX * scaleX), y: Math.round(topY * scaleY) },
      { x: Math.round(rightX * scaleX), y: Math.round(topY * scaleY) },
      { x: Math.round(rightX * scaleX), y: Math.round(bottomY * scaleY) },
      { x: Math.round(leftX * scaleX), y: Math.round(bottomY * scaleY) }
    ];
  };

  // 1. फ़ाइल इनपुट
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImageSrc(dataUrl);
        setStep("crop");

        setTimeout(() => {
          const cvs = canvasRef.current;
          if (cvs) {
            cvs.width = img.width;
            cvs.height = img.height;

            cornersRef.current = detectDocumentCorners(img);

            drawCropCanvas(null);
          }
        }, 80);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 90° रोटेट
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
      setImageSrc(rotatedData);

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

  // 2. क्रॉपर रेंडरर (4 स्वतंत्र कोने + 2.2x मैग्नीफ़ायर)
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

    // डार्क ओवरले
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, cvs.width, cvs.height);
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.closePath();
    ctx.fill("evenodd");

    // बाउंड्री लाइन
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(cvs.width / 320));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.stroke();

    // 4 गोल हैंडल
    const baseRadius = Math.max(18, Math.round(cvs.width / 42));
    pts.forEach((p, i) => {
      const isDragging = activeIdx === i;
      const r = isDragging ? baseRadius * 1.3 : baseRadius;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDragging ? "#16a34a" : "#2563eb";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // 2.2x मैग्नीफ़ायर लेंस
    if (activeIdx !== null && pts[activeIdx]) {
      const cur = pts[activeIdx];
      const lensRadius = Math.max(70, Math.round(cvs.width / 11));
      const zoom = 2.2;

      let lensX = cur.x;
      let lensY = cur.y - lensRadius - 60;
      if (lensY - lensRadius < 20) lensY = cur.y + lensRadius + 60;
      if (lensX - lensRadius < 20) lensX = lensRadius + 20;
      if (lensX + lensRadius > cvs.width - 20) lensX = cvs.width - lensRadius - 20;

      ctx.save();
      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        (cur.x / cvs.width) * img.width - (lensRadius / zoom) * (img.width / cvs.width),
        (cur.y / cvs.height) * img.height - (lensRadius / zoom) * (img.height / cvs.height),
        ((lensRadius * 2) / zoom) * (img.width / cvs.width),
        ((lensRadius * 2) / zoom) * (img.height / cvs.height),
        lensX - lensRadius,
        lensY - lensRadius,
        lensRadius * 2,
        lensRadius * 2
      );

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lensX - 22, lensY);
      ctx.lineTo(lensX + 22, lensY);
      ctx.moveTo(lensX, lensY - 22);
      ctx.lineTo(lensX + 22, lensY);
      ctx.stroke();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2563eb";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  };

  // 3. टच व कॉर्नर कोऑर्डिनेट मैपिंग
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height)
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;

    let foundIdx: number | null = null;
    let minDist = Math.max(65, cvs.width / 12);

    cornersRef.current.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        foundIdx = idx;
      }
    });

    if (foundIdx !== null) {
      activePointIdxRef.current = foundIdx;
      drawCropCanvas(foundIdx);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (activePointIdxRef.current === null) return;
    const cvs = canvasRef.current;
    if (!cvs) return;

    const { x, y } = getCanvasCoords(clientX, clientY);
    const boundedX = Math.max(0, Math.min(cvs.width, x));
    const boundedY = Math.max(0, Math.min(cvs.height, y));

    cornersRef.current[activePointIdxRef.current] = { x: boundedX, y: boundedY };
    requestAnimationFrame(() => drawCropCanvas(activePointIdxRef.current));
  };

  const handlePointerUp = () => {
    if (activePointIdxRef.current !== null) {
      activePointIdxRef.current = null;
      drawCropCanvas(null);
    }
  };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || step !== "crop") return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      handlePointerDown(t.clientX, t.clientY);
      if (activePointIdxRef.current !== null && e.cancelable) e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (activePointIdxRef.current === null) return;
      if (e.cancelable) e.preventDefault();
      const t = e.touches[0];
      handlePointerMove(t.clientX, t.clientY);
    };

    const onTouchEnd = () => handlePointerUp();

    cvs.addEventListener("touchstart", onTouchStart, { passive: false });
    cvs.addEventListener("touchmove", onTouchMove, { passive: false });
    cvs.addEventListener("touchend", onTouchEnd);
    cvs.addEventListener("touchcancel", onTouchEnd);

    return () => {
      cvs.removeEventListener("touchstart", onTouchStart);
      cvs.removeEventListener("touchmove", onTouchMove);
      cvs.removeEventListener("touchend", onTouchEnd);
      cvs.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [step]);

  // 4. क्रॉप और सीधा A4 ऑटो-फिट इंजन
  const runCropToA4 = () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);

    setTimeout(() => {
      try {
        const pts = cornersRef.current;

        const topW = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const botW = Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y);
        const leftH = Math.hypot(pts[3].x - pts[0].x, pts[3].y - pts[0].y);
        const rightH = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);

        const targetW = Math.max(200, Math.round(Math.max(topW, botW)));
        const targetH = Math.max(200, Math.round(Math.max(leftH, rightH)));

        const straightCanvas = document.createElement("canvas");
        straightCanvas.width = targetW;
        straightCanvas.height = targetH;
        const sCtx = straightCanvas.getContext("2d");
        if (!sCtx) return;

        sCtx.fillStyle = "#ffffff";
        sCtx.fillRect(0, 0, targetW, targetH);

        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.width;
        srcCanvas.height = img.height;
        const srcCtx = srcCanvas.getContext("2d");
        if (!srcCtx) return;
        srcCtx.drawImage(img, 0, 0);

        // 80 स्लाइस की जगह माइक्रो-स्लाइसिंग (1 से 1.5 पिक्सल की बारीक पट्टियां ताकि सीढ़ी जैसा कट न बने)
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = "high";

        const slices = Math.min(Math.round(targetH), 450);
        for (let i = 0; i < slices; i++) {
          const t1 = i / slices;
          const t2 = (i + 1) / slices;

          const leftX1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
          const leftY1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
          const rightX1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
          const rightY1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

          const destY1 = t1 * targetH;
          const destY2 = t2 * targetH;
          const destH = destY2 - destY1;

          sCtx.save();
          sCtx.beginPath();
          sCtx.rect(0, destY1, targetW, destH + 0.75);
          sCtx.clip();

          const sliceAngle = Math.atan2(rightY1 - leftY1, rightX1 - leftX1);
          const sliceWidth = Math.hypot(rightX1 - leftX1, rightY1 - leftY1);

          sCtx.translate(0, destY1);
          sCtx.scale(targetW / sliceWidth, 1);
          sCtx.rotate(-sliceAngle);
          sCtx.drawImage(srcCanvas, -leftX1, -leftY1);
          sCtx.restore();
        }

        const isLand = orientation === "landscape";
        const a4Width = isLand ? 1600 : 1200;
        const a4Height = Math.round(isLand ? a4Width / 1.414 : a4Width * 1.414);

        const outCanvas = document.createElement("canvas");
        outCanvas.width = a4Width;
        outCanvas.height = a4Height;
        const ctx = outCanvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, a4Width, a4Height);

        const scale = Math.min(
          (a4Width - 40) / targetW,
          (a4Height - 40) / targetH
        );

        const fitW = Math.round(targetW * scale);
        const fitH = Math.round(targetH * scale);
        const posX = Math.round((a4Width - fitW) / 2);
        const posY = Math.round((a4Height - fitH) / 2);

        ctx.drawImage(straightCanvas, posX, posY, fitW, fitH);

        rawCroppedCanvasRef.current = straightCanvas;
        baseProcessedCanvasRef.current = straightCanvas;
        processFilterAndCompression(outCanvas, filter, brightness, contrast, targetKb);
        setStep("filter");
      } catch (err) {
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }, 40);
  };

  const handleBackToCrop = () => {
    setStep("crop");
    setTimeout(() => {
      const cvs = canvasRef.current;
      const img = imgRef.current;
      if (cvs && img) {
        cvs.width = img.width;
        cvs.height = img.height;
        drawCropCanvas(null);
      }
    }, 60);
  };

  // 4-वे ट्रांसफॉर्म इंजन (Rotate & Flip on A4 workspace)
  const handleTransform = (type: "rotate-left" | "rotate-right" | "flip-h" | "flip-v") => {
    const baseCvs = baseProcessedCanvasRef.current;
    if (!baseCvs) return;

    const isRotate = type === "rotate-left" || type === "rotate-right";
    const outCvs = document.createElement("canvas");
    outCvs.width = isRotate ? baseCvs.height : baseCvs.width;
    outCvs.height = isRotate ? baseCvs.width : baseCvs.height;

    const ctx = outCvs.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outCvs.width, outCvs.height);

    ctx.save();
    ctx.translate(outCvs.width / 2, outCvs.height / 2);

    if (type === "rotate-left") {
      ctx.rotate((-90 * Math.PI) / 180);
    } else if (type === "rotate-right") {
      ctx.rotate((90 * Math.PI) / 180);
    } else if (type === "flip-h") {
      ctx.scale(-1, 1);
    } else if (type === "flip-v") {
      ctx.scale(1, -1);
    }

    ctx.drawImage(baseCvs, -baseCvs.width / 2, -baseCvs.height / 2);
    ctx.restore();

    baseProcessedCanvasRef.current = outCvs;
    // शीट का ओरिएंटेशन छेड़े बिना रेंडर करें
    processFilterAndCompression(outCvs, filter, brightness, contrast, targetKb, orientation, saturation);
  };

  const handleOrientationChange = (newMode: PageOrientation) => {
    if (newMode === orientation) return;
    setOrientation(newMode);

    const baseCvs = baseProcessedCanvasRef.current;
    if (!baseCvs) return;

    processFilterAndCompression(baseCvs, filter, brightness, contrast, targetKb, newMode);
  };

  // 5. सटीक पिक्सेल-लेवल फ़िल्टर व कंप्रेशन
  
  // शार्पनेस इंजन: अक्षरों को क्रिस्प और गहरा बनाए रखने के लिए Unsharp Mask कर्नल
  const applySharpnessFilter = (ctx: CanvasRenderingContext2D, w: number, h: number, amount: number = 0.35) => {
    try {
      const srcData = ctx.getImageData(0, 0, w, h);
      const src = srcData.data;
      const outData = ctx.createImageData(w, h);
      const dst = outData.data;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = src[idx + c];
            const up = src[((y - 1) * w + x) * 4 + c];
            const down = src[((y + 1) * w + x) * 4 + c];
            const left = src[(y * w + (x - 1)) * 4 + c];
            const right = src[(y * w + (x + 1)) * 4 + c];
            const edgeVal = (center * 4) - up - down - left - right;
            dst[idx + c] = Math.min(255, Math.max(0, center + edgeVal * amount));
          }
          dst[idx + 3] = src[idx + 3];
        }
      }
      ctx.putImageData(outData, 0, 0);
    } catch {
      // Fallback if cross-origin context prevents pixel read
    }
  };

  const processFilterAndCompression = async (
    baseCanvas: HTMLCanvasElement,
    mode: FilterMode,
    bVal: number,
    cVal: number,
    desiredKb: number,
    targetOrientation: PageOrientation = orientation,
    satVal: number = saturation
  ) => {
    // 1. A4 शीट का आयाम (Portrait vs Landscape)
    let a4W = targetOrientation === "portrait" ? 1240 : 1754;
    let a4H = targetOrientation === "portrait" ? 1754 : 1240;

    // अगर Max HD चुना है (desiredKb === 0) तो ओरिजिनल 300 DPI स्केल (1.75x) लें
    let scale = 1.0;
    if (desiredKb === 0) {
      scale = 1.75; // Max 300 DPI studio resolution
    } else if (desiredKb <= 25) {
      scale = 0.45;
    } else if (desiredKb <= 60) {
      scale = 0.60;
    } else if (desiredKb <= 120) {
      scale = 0.75;
    } else if (desiredKb <= 250) {
      scale = 0.90;
    }

    a4W = Math.round(a4W * scale);
    a4H = Math.round(a4H * scale);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = a4W;
    finalCanvas.height = a4H;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return baseCanvas.toDataURL("image/jpeg", 0.9);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // सफ़ेद A4 बैकग्राउंड
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // स्मार्ट ऑटो-फ़िट: जब ओरिएंटेशन मैच करे तो 100% फुल-पेज फिट, वरना आनुपातिक सेंटर फिट
    const isDocPortrait = baseCanvas.height >= baseCanvas.width;
    const isSheetPortrait = a4H >= a4W;

    // अगर दोनों का ओरिएंटेशन मेल खा गया (दोनों पोर्ट्रेट या दोनों लैंडस्केप)
    const isMatching = isDocPortrait === isSheetPortrait;

    // मैच होने पर न्यूनतम प्रिंट बॉर्डर (0.8%), मिसमैच होने पर संतुलित बॉर्डर
    const marginRatio = isMatching ? 0.008 : 0.02;
    const mX = Math.round(a4W * marginRatio);
    const mY = Math.round(a4H * marginRatio);
    const maxW = a4W - (mX * 2);
    const maxH = a4H - (mY * 2);

    const docRatio = baseCanvas.width / baseCanvas.height;
    const a4Ratio = maxW / maxH;

    let drawW = maxW;
    let drawH = maxH;

    if (isMatching) {
      // जब मैच हो तो बिना किसी अतिरिक्त खाली जगह के A4 के अधिकतम अनुपात में फुल फिट करें
      if (Math.abs(docRatio - a4Ratio) < 0.15) {
        // लगभग A4 अनुपात होने पर पूरा किनारा-से-किनारा भरेगा
        drawW = maxW;
        drawH = maxH;
      } else if (docRatio > a4Ratio) {
        drawW = maxW;
        drawH = Math.round(maxW / docRatio);
      } else {
        drawH = maxH;
        drawW = Math.round(maxH * docRatio);
      }
    } else {
      // जब मिसमैच हो (जैसे पोर्ट्रेट शीट में लैंडस्केप डॉक्युमेंट) तो बिना कटे सुरक्षित सेंटर
      if (docRatio > a4Ratio) {
        drawW = maxW;
        drawH = Math.round(maxW / docRatio);
      } else {
        drawH = maxH;
        drawW = Math.round(maxH * docRatio);
      }
    }

    const drawX = Math.round((a4W - drawW) / 2);
    const drawY = Math.round((a4H - drawH) / 2);

    ctx.drawImage(baseCanvas, drawX, drawY, drawW, drawH);

    // ब्राइटनेस / कंट्रास्ट और मोड फ़िल्टर
    const imgData = ctx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
    const d = imgData.data;
    const factor = (259 * (cVal * 1.5 + 255)) / (255 * (259 - cVal * 1.5));
    const brightShift = bVal * 2.2;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (mode === "grayscale") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray; g = gray; b = gray;
      } else if (mode === "bw") {
        // Photo-Crop स्टाइल स्मूथ नेचुरल ज़ेरॉक्स (बिना पिक्सल फटे या पैच बने)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // नेचुरल फोटोकॉपी टोनल कंट्रास्ट (गाढ़े काले अक्षर + साफ बैकग्राउंड)
        const norm = gray / 255;
        let enhanced;
        if (norm > 0.60) {
          // बैकग्राउंड को बिना पिक्सल तोड़े क्लीन वाइट की तरफ ले जाना
          enhanced = 0.60 + Math.pow((norm - 0.60) / 0.40, 0.9) * 0.40;
          enhanced = Math.min(1, enhanced * 1.15);
        } else {
          // टेक्स्ट को गहरा और क्रिस्प ब्लैक बनाना (फॉन्ट सुरक्षित)
          enhanced = Math.pow(norm / 0.60, 1.35) * 0.60;
        }
        
        const xerox = Math.min(255, Math.max(0, enhanced * 255));
        r = xerox; g = xerox; b = xerox;
      } else if (mode === "magic") {
        // संतुलित CamScanner टोनल कर्व (बिना ओवर-एक्सपोजर और बिना स्याही फैले)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // स्मूथ नॉर्मलाइज़्ड ल्युमिनेंस कर्व (0 से 1)
        const norm = lum / 255;

        // नेचुरल कर्व: हल्के शेड्स क्लीन वाइट होंगे, टेक्स्ट बिना फैले गहरा रहेगा
        // बैकग्राउंड लिफ्ट (1.18x) + मिड-टोन रिटेंशन ताकि बारीक अक्षर न मिटें
        let enhanced;
        if (norm > 0.55) {
          // बैकग्राउंड को बिना ब्लीच किए जेंटल वाइट बनाना
          enhanced = 0.55 + Math.pow((norm - 0.55) / 0.45, 0.85) * 0.45;
          enhanced = Math.min(1, enhanced * 1.08);
        } else {
          // टेक्स्ट को सिर्फ 15% गहरा करना ताकि फॉन्ट की डिटेलिंग और गोलाई बरकरार रहे
          enhanced = Math.pow(norm / 0.55, 1.22) * 0.55;
        }

        const targetLum = enhanced * 255;
        const ratio = targetLum / (lum || 1);

        // कलर कंट्रास्ट को बैलेंस रखना
        r = Math.min(255, Math.max(0, r * ratio));
        g = Math.min(255, Math.max(0, g * ratio));
        b = Math.min(255, Math.max(0, b * ratio));

        // हल्का सा कलर वाइब्रेंसी टच (1.1x) ताकि नीली स्याही और स्टांप नेचुरल दिखें
        const postLum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, postLum + (r - postLum) * 1.12));
        g = Math.min(255, Math.max(0, postLum + (g - postLum) * 1.12));
        b = Math.min(255, Math.max(0, postLum + (b - postLum) * 1.12));
      }

      if (satVal !== 0 && mode !== "bw" && mode !== "grayscale") {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const satMult = Math.max(0, 1 + (satVal / 100) * 1.8);
        r = lum + (r - lum) * satMult;
        g = lum + (g - lum) * satMult;
        b = lum + (b - lum) * satMult;
      }

      // कलर सैचुरेशन इंजन (गाढ़ा / हल्का)
      if (satVal !== 0 && mode !== "bw" && mode !== "grayscale") {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const satMult = Math.max(0, 1 + (satVal / 100) * 1.8);
        r = lum + (r - lum) * satMult;
        g = lum + (g - lum) * satMult;
        b = lum + (b - lum) * satMult;
      }

      if (mode !== "bw") {
        r = factor * (r - 128) + 128 + brightShift;
        g = factor * (g - 128) + 128 + brightShift;
        b = factor * (b - 128) + 128 + brightShift;
      }

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(imgData, 0, 0);

    // अक्षरों को शार्प करने वाला कर्नल लागू करें
    applySharpnessFilter(ctx, finalCanvas.width, finalCanvas.height, desiredKb <= 50 ? 0.45 : 0.3);

    // बाइनरी सर्च आधारित सटीक KB कंप्रेशन लूप
    if (desiredKb === 0) {
      // Max HD ओरिजिनल मोड (नो कम्प्रेशन)
      const hdUrl = finalCanvas.toDataURL("image/jpeg", 0.98);
      const kb = Math.round((hdUrl.length * 3) / 4 / 1024);
      setActualKb(kb);
      setJpgDownloadUrl(hdUrl);
      return hdUrl;
    }

        // अगर मैक्स एचडी है तो कंप्रेशन सर्च बायपास करें और फुल क्वालिटी दें
    if (desiredKb === 0) {
      const fullHdUrl = finalCanvas.toDataURL("image/jpeg", 0.98);
      const head = "data:image/jpeg;base64,";
      const sizeBytes = Math.round((fullHdUrl.length - head.length) * 3 / 4);
      const finalKb = Math.round(sizeBytes / 1024);
      setActualKb(finalKb);
      setJpgDownloadUrl(fullHdUrl);
      return fullHdUrl;
    }

    let minQ = 0.05;
    let maxQ = 0.98;
    let bestUrl = "";
    let bestKb = 0;

    for (let iter = 0; iter < 7; iter++) {
      const midQ = (minQ + maxQ) / 2;
      const url = finalCanvas.toDataURL("image/jpeg", midQ);
      const sizeKb = Math.round((url.length * 3) / 4 / 1024);

      bestUrl = url;
      bestKb = sizeKb;

      if (Math.abs(sizeKb - desiredKb) <= 2) {
        break;
      }

      if (sizeKb > desiredKb) {
        maxQ = midQ;
      } else {
        minQ = midQ;
      }
    }

    setActualKb(bestKb);
    setJpgDownloadUrl(bestUrl);
    return bestUrl;
  };

  const handleSliderChange = (
    newFilter: FilterMode,
    newB: number,
    newC: number,
    newKb: number,
    newSat: number = saturation
  ) => {
    setFilter(newFilter);
    setBrightness(newB);
    setContrast(newC);
    setTargetKb(newKb);
    setSaturation(newSat);

    if (kbDebounceRef.current) clearTimeout(kbDebounceRef.current);
    kbDebounceRef.current = setTimeout(() => {
      const canvas = baseProcessedCanvasRef.current;
      if (canvas) {
        processFilterAndCompression(canvas, newFilter, newB, newC, newKb, orientation, newSat);
      }
    }, 60);
  };

  // 6. PDF डाउनलोड
  const generateA4Pdf = async () => {
    if (!jpgDownloadUrl) return;
    setPdfGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const isLand = orientation === "landscape";
      const pdf = new jsPDF(isLand ? "l" : "p", "mm", "a4");
      const pdfW = isLand ? 297 : 210;
      const pdfH = isLand ? 210 : 297;

      const img = new Image();
      img.src = jpgDownloadUrl;
      img.onload = () => {
        const ratio = img.width / img.height;
        let printW = pdfW - 16;
        let printH = printW / ratio;

        if (printH > pdfH - 16) {
          printH = pdfH - 16;
          printW = printH * ratio;
        }

        const posX = (pdfW - printW) / 2;
        const posY = (pdfH - printH) / 2;

        pdf.addImage(jpgDownloadUrl, "JPEG", posX, posY, printW, printH);
        pdf.save(`examsewa-scanned-${orientation}-a4.pdf`);
        setPdfGenerating(false);
      };
    } catch {
      alert("PDF बनाने में त्रुटि हुई।");
      setPdfGenerating(false);
    }
  };

  // 7. 📤 नेटिव शेयर सिस्टम (WhatsApp, Bluetooth, Gmail आदि)
  const handleShareDocument = async () => {
    if (!jpgDownloadUrl) return;
    setSharing(true);

    try {
      // DataURL को फ़ाइल Blob में बदलना
      const res = await fetch(jpgDownloadUrl);
      const blob = await res.blob();
      const fileName = `scanned-document-${actualKb}kb.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      // चेक करें कि क्या मोबाइल का Web Share API फाइल्स सपोर्ट करता है
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "स्कैन किया गया दस्तावेज़",
          text: "Smart Document Scanner द्वारा स्कैन किया गया दस्तावेज़",
        });
      } else if (navigator.share) {
        // अगर सिर्फ टेक्स्ट/लिंक शेयर सपोर्टेड है
        await navigator.share({
          title: "स्कैन किया गया दस्तावेज़",
          text: "Smart Document Scanner द्वारा स्कैन किया गया दस्तावेज़",
        });
      } else {
        alert("आपके ब्राउज़र में डायरेक्ट शेयरिंग सपोर्ट नहीं है। कृपया डाउनलोड बटन का उपयोग करें।");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("शेयरिंग में त्रुटि:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-2 sm:py-6 px-2 sm:px-4 text-slate-800 select-none">
      <div className="max-w-6xl mx-auto bg-white p-2.5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        
        {/* हेडर */}
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <Link href="/" className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline">
            ← होमपेज
          </Link>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 text-center">
            स्मार्ट डॉक्यूमेंट स्कैनर (Smart Document Scanner)
          </h1>
          <div className="w-12"></div>
        </div>

        {/* STEP 1: CAPTURE OR UPLOAD */}
        {step === "capture" && (
          <div className="py-12 max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="cursor-pointer p-8 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 transition flex flex-col items-center justify-center space-y-3 shadow-sm active:scale-95 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
              <span className="text-5xl">📸</span>
              <span className="font-bold text-base text-blue-700">कैमरा खोलें</span>
              <span className="text-xs text-slate-500">सीधे कैमरे से काग़ज़ की फ़ोटो लें</span>
            </label>

            <label className="cursor-pointer p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition flex flex-col items-center justify-center space-y-3 shadow-sm active:scale-95 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <span className="text-5xl">📁</span>
              <span className="font-bold text-base text-slate-700">गैलरी से चुनें</span>
              <span className="text-xs text-slate-500">गैलरी से फ़ोटो अपलोड करें</span>
            </label>
          </div>
        )}

        {/* STEP 2: क्रॉपर स्क्रीन */}
        {imageSrc && step === "crop" && (
          <div className="space-y-2.5 max-w-4xl mx-auto select-none">
            
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <span className="font-medium text-[11px] sm:text-xs">👉 चारों कोनों को अलग-अलग खींचकर काग़ज़ पर सेट करें</span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (imgRef.current) {
                      cornersRef.current = detectDocumentCorners(imgRef.current);
                      drawCropCanvas(null);
                    }
                  }}
                  className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg border border-emerald-700 font-bold hover:bg-emerald-700 flex items-center space-x-1 shrink-0 text-xs shadow-sm transition active:scale-95"
                >
                  <span>⚡</span>
                  <span>ऑटो-डिटेक्ट</span>
                </button>
                <button
                  type="button"
                  onClick={rotateSourceImage}
                  className="bg-white px-2 py-0.5 rounded-lg border border-blue-300 font-bold hover:bg-blue-100 flex items-center space-x-1 shrink-0 text-xs shadow-sm transition active:scale-95"
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
                className="max-h-[60vh] sm:max-h-[520px] w-auto max-w-full mx-auto cursor-crosshair block select-none shadow-lg"
              />
            </div>

            <div className="flex items-center space-x-2.5 pt-1 pb-4">
              <button
                type="button"
                onClick={() => { setStep("capture"); setImageSrc(null); setJpgDownloadUrl(null); }}
                className="w-1/3 py-3 px-2 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95 text-center"
              >
                🔄 नई तस्वीर
              </button>
              <button
                onClick={runCropToA4}
                disabled={processing}
                className="w-2/3 bg-blue-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-xs sm:text-sm active:scale-95 text-center"
              >
                {processing ? "सीधा हो रहा है..." : "📐 काग़ज़ क्रॉप करें (Crop)"}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: PREVIEW BOX & TOOLS SHELF */}
        {step === "filter" && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 items-start">
            
            {/* BOX 1: ऊपर का स्टिकी प्रिव्यू बॉक्स */}
            <div className="w-full lg:col-span-7 sticky top-0 lg:top-3 z-30 bg-white shadow-sm pb-2">
              <div className="border-2 border-slate-900 rounded-2xl p-2.5 bg-white shadow-md">
                <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>📄</span> मुख्य दस्तावेज़ प्रीव्यू
                  </span>
                  <span className="bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                    लगभग {actualKb} KB | {orientation === "portrait" ? "खड़ा A4" : "आड़ा A4"}
                  </span>
                </div>
                
                <div className="h-[32vh] sm:h-[460px] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-200">
                  {jpgDownloadUrl ? (
                    <img
                      src={jpgDownloadUrl}
                      alt="Scanned Document"
                      className="max-h-full max-w-full object-contain rounded shadow-sm"
                    />
                  ) : (
                    <div className="text-sm text-slate-400">दस्तावेज़ तैयार हो रहा है...</div>
                  )}
                </div>
              </div>
            </div>

            {/* BOX 2: नीचे का टूलबार शेल्फ़ बॉक्स */}
            <div className="w-full lg:col-span-5 border-2 border-slate-900 rounded-2xl p-3 sm:p-4 bg-white shadow-md space-y-3.5 pb-28 lg:pb-4">
              
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  काग़ज़ साफ़ करें (Filters)
                </span>
                <button
                  type="button"
                  onClick={handleBackToCrop}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  ↩ फिर से कोने बदलें
                </button>
              </div>

              {/* 4-वे ट्रांसफॉर्म बटन (घुमाएँ व पलटें) */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  दस्तावेज़ सीधा करें (Rotate & Flip):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTransform("rotate-left")}
                    className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                    title="90° बाएँ घुमाएँ"
                  >
                    <span className="text-base">⤹</span>
                    <span className="text-[10px]">90° बाएँ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransform("rotate-right")}
                    className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                    title="90° दाएँ घुमाएँ"
                  >
                    <span className="text-base">⤸</span>
                    <span className="text-[10px]">90° दाएँ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransform("flip-h")}
                    className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                    title="क्षैतिज पलटें (Mirror Flip)"
                  >
                    <span className="text-base">⇄</span>
                    <span className="text-[10px]">मिरर पलटें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTransform("flip-v")}
                    className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                    title="लंबवत पलटें (Vertical Flip)"
                  >
                    <span className="text-base">⇅</span>
                    <span className="text-[10px]">उल्टा-सीधा</span>
                  </button>
                </div>
              </div>

              {/* ओरिएंटेशन स्विच */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  काग़ज़ ओरिएंटेशन:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOrientationChange("portrait")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition flex items-center justify-center space-x-1.5 ${
                      orientation === "portrait"
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>📄</span>
                    <span>पोर्ट्रेट (खड़ा A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrientationChange("landscape")}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition flex items-center justify-center space-x-1.5 ${
                      orientation === "landscape"
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>📑</span>
                    <span>लैंडस्केप (आड़ा A4)</span>
                  </button>
                </div>
              </div>

              {/* फ़िल्टर बटन्स */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "magic", label: "✨ Magic Color" },
                  { id: "bw", label: "📄 B&W Xerox" },
                  { id: "grayscale", label: "🔘 Grayscale" },
                  { id: "original", label: "🌄 Original" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSliderChange(f.id as FilterMode, brightness, contrast, targetKb)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      filter === f.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* ब्राइटनेस व कॉन्ट्रास्ट स्लाइडर्स */}
              <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-0.5">
                    <span>सफेदी / उजाला (Light)</span>
                    <span className="font-bold text-blue-600">{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={brightness}
                    onChange={(e) => handleSliderChange(filter, Number(e.target.value), contrast, targetKb)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-0.5">
                    <span>कंट्रास्ट / गहराई (Sharp)</span>
                    <span className="font-bold text-blue-600">{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="70"
                    value={contrast}
                    onChange={(e) => handleSliderChange(filter, brightness, Number(e.target.value), targetKb)}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>कलर सैचुरेशन (रंग का गाढ़ापन):</span>
                    <span className="font-mono text-blue-700 font-bold">{saturation > 0 ? `+${saturation}%` : `${saturation}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={saturation}
                    onChange={(e) => handleSliderChange(filter, brightness, contrast, targetKb, Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>हल्का / फीका (-100%)</span>
                    <span>डिफ़ॉल्ट (0%)</span>
                    <span>गाढ़ा चटक (+100%)</span>
                  </div>
                </div>
              </div>

              {/* KB साइज़ कंट्रोलर */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-blue-950">
                  <span>फ़ाइल क्वालिटी व साइज़:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono shadow-xs ${
                    targetKb === 0 
                      ? "bg-emerald-600 text-white font-bold" 
                      : "bg-blue-700 text-white"
                  }`}>
                    {targetKb === 0 ? "मैक्स एचडी (ओरिजिनल)" : `लगभग ${actualKb} KB`}
                  </span>
                </div>

                {/* मोड चयन: प्रीसेट KB बटन्स और मैक्स एचडी */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {[
                      { label: "10 KB", kb: 10 },
                      { label: "20 KB", kb: 20 },
                      { label: "50 KB", kb: 50 },
                      { label: "100 KB", kb: 100 },
                      { label: "200 KB", kb: 200 },
                      { label: "300 KB", kb: 300 },
                    ].map((p) => (
                      <button
                        key={p.kb}
                        type="button"
                        onClick={() => handleSliderChange(filter, brightness, contrast, p.kb)}
                        className={`py-1.5 px-1 text-[11px] font-bold rounded-lg border transition text-center ${
                          targetKb === p.kb
                            ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                            : "bg-white text-blue-900 border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* अलग मैक्स एचडी बटन */}
                  <button
                    type="button"
                    onClick={() => handleSliderChange(filter, brightness, contrast, 0)}
                    className={`w-full py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 shadow-xs ${
                      targetKb === 0
                        ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300"
                        : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <span>⭐</span>
                    <span>मैक्स एचडी</span>
                  </button>
                </div>

                {/* कस्टम KB स्लाइडर (मैक्स एचडी ऑन होने पर डिसेबल) */}
                <div className={`transition-opacity ${targetKb === 0 ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>कस्टम साइज़ चुनें:</span>
                    <span>{targetKb > 0 ? `${targetKb} KB` : "बंद"}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="600"
                    step="5"
                    disabled={targetKb === 0}
                    value={targetKb === 0 ? 300 : targetKb}
                    onChange={(e) => handleSliderChange(filter, brightness, contrast, Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-medium">
                    <span>10 KB</span>
                    <span>300 KB</span>
                    <span>600 KB</span>
                  </div>
                </div>
              </div>

              {/* डाउनलोड व शेयर बटन्स */}
              {jpgDownloadUrl && (
                <div className="space-y-2.5 pt-1 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider text-center">
                    डाउनलोड या शेयर करें ({orientation === "portrait" ? "खड़ा" : "आड़ा"} A4):
                  </p>

                  {/* 📤 शेयर बटन (WhatsApp, Bluetooth, Gmail आदि) */}
                  <button
                    onClick={handleShareDocument}
                    disabled={sharing}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-indigo-700 transition text-xs shadow-md disabled:opacity-60 active:scale-95"
                  >
                    <span className="text-sm">📤</span>
                    <span>{sharing ? "शेयर मेनू खुल रहा है..." : "सीधे शेयर करें (WhatsApp / Bluetooth / Gmail)"}</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={jpgDownloadUrl}
                      download={`scanned-${orientation}-${actualKb}kb.jpg`}
                      className="flex items-center justify-center space-x-2 bg-emerald-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-emerald-700 transition text-xs shadow-sm text-center active:scale-95"
                    >
                      <span>🖼️</span>
                      <span>JPG डाउनलोड ({actualKb} KB)</span>
                    </a>
                    <button
                      onClick={generateA4Pdf}
                      disabled={pdfGenerating}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-blue-700 transition text-xs shadow-sm disabled:opacity-60 active:scale-95"
                    >
                      <span>📄</span>
                      <span>{pdfGenerating ? "बन रही है..." : "A4 PDF डाउनलोड"}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </main>
  );
}