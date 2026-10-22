"use client";
import { exportSmartJpg } from "@/lib/image-engine";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Link from "next/link";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectPreset = "free" | "1:1" | "passport" | "4:6" | "5:7" | "8:10" | "signature" | "card" | "a4";
type EditorMode = "photo" | "document";

export default function PhotoDocEditorPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<"upload" | "crop" | "editor">("upload");
  const [editorMode, setEditorMode] = useState<EditorMode>("photo");

  const [imgUrl, setImgUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("photo");
  const [croppedUrl, setCroppedUrl] = useState<string>("");
  const [freeCropRatio, setFreeCropRatio] = useState<number | null>(null);
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);

  // Crop Box & Preset States
  const [preset, setPreset] = useState<AspectPreset>("free");
  const [photoOrientation, setPhotoOrientation] = useState<"portrait" | "landscape">("portrait");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, w: 80, h: 80 });

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);
  const [tuneMode, setTuneMode] = useState<"manual" | "auto">("manual");
  const [fitMode, setFitMode] = useState<"fit" | "fill">("fit");
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isBw, setIsBw] = useState<boolean>(false);

  // Photo Mode Specifics
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [enableStamp, setEnableStamp] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>("");
  const [dopDate, setDopDate] = useState<string>("");
  const [stampFontSize, setStampFontSize] = useState<number>(16);

  // AI Bg State
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);

  // Quality & KB States
  const [kbMode, setKbMode] = useState<"hd" | "custom">("hd");
  const [customKb, setCustomKb] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceImgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    type: string | null;
    startX: number;
    startY: number;
    cropStart: CropRect;
  }>({ type: null, startX: 0, startY: 0, cropStart: { x: 0, y: 0, w: 0, h: 0 } });

  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    setDopDate(today);
  }, []);

  const activeDisplayImg = bgRemovedUrl || croppedUrl;

  const getPresetRatio = (p: AspectPreset): string => {
    const isPort = photoOrientation === "portrait";
    if (p === "free" && freeCropRatio) {
      return isPort 
        ? `${Math.min(freeCropRatio, 1 / freeCropRatio)} / 1` 
        : `${Math.max(freeCropRatio, 1 / freeCropRatio)} / 1`;
    }
    if (p === "passport") return isPort ? "3.5 / 4.5" : "4.5 / 3.5";
    if (p === "4:6") return isPort ? "4 / 6" : "6 / 4";
    if (p === "5:7") return isPort ? "5 / 7" : "7 / 5";
    if (p === "8:10") return isPort ? "8 / 10" : "10 / 8";
    if (p === "a4") return isPort ? "210 / 297" : "297 / 210";
    if (p === "signature") return isPort ? "1.5 / 3.5" : "3.5 / 1.5";
    if (p === "card") return isPort ? "5.5 / 8.5" : "8.5 / 5.5";
    if (p === "1:1") return "1 / 1";
    return "auto";
  };

  const getTargetDimensions = (p: AspectPreset, orient: "portrait" | "landscape") => {
    let w = 1200;
    let h = 1800;

    if (p === "passport") { w = 413; h = 531; } // 3.5 x 4.5 cm @ 300 DPI
    else if (p === "4:6") { w = 1200; h = 1800; } // 4 x 6 inch @ 300 DPI
    else if (p === "5:7") { w = 1500; h = 2100; } // 5 x 7 inch @ 300 DPI
    else if (p === "8:10") { w = 2400; h = 3000; } // 8 x 10 inch @ 300 DPI
    else if (p === "a4") { w = 2480; h = 3508; } // A4 Sheet @ 300 DPI
    else if (p === "1:1") { w = 1200; h = 1200; }
    else if (p === "card") { w = 1004; h = 650; } // ID / PAN Card
    else if (p === "signature") { w = 413; h = 177; } // Sign 3.5 x 1.5 cm

    if (orient === "landscape" && p !== "1:1") {
      return { width: Math.max(w, h), height: Math.min(w, h) };
    }
    return { width: Math.min(w, h), height: Math.max(w, h) };
  };

  const setJpgDpi300 = (dataUrl: string): string => {
    try {
      const parts = dataUrl.split(",");
      const raw = atob(parts[1]);
      const rawLen = raw.length;
      const bytes = new Uint8Array(rawLen);
      for (let i = 0; i < rawLen; i++) {
        bytes[i] = raw.charCodeAt(i);
      }

      let jfifFound = false;
      for (let i = 0; i < Math.min(bytes.length - 18, 100); i++) {
        if (
          bytes[i] === 0xff &&
          bytes[i + 1] === 0xe0 &&
          bytes[i + 4] === 0x4a &&
          bytes[i + 5] === 0x46 &&
          bytes[i + 6] === 0x49 &&
          bytes[i + 7] === 0x46
        ) {
          bytes[i + 13] = 1;     // DPI unit
          bytes[i + 14] = 0x01;  // 300 DPI
          bytes[i + 15] = 0x2c;
          bytes[i + 16] = 0x01;
          bytes[i + 17] = 0x2c;
          jfifFound = true;
          break;
        }
      }

      let finalBytes = bytes;
      if (!jfifFound && bytes[0] === 0xff && bytes[1] === 0xd8) {
        const jfifHeader = new Uint8Array([
          0xff, 0xe0, 0x00, 0x10,
          0x4a, 0x46, 0x49, 0x46, 0x00,
          0x01, 0x01,
          0x01,
          0x01, 0x2c,
          0x01, 0x2c,
          0x00, 0x00
        ]);

        finalBytes = new Uint8Array(bytes.length + jfifHeader.length);
        finalBytes.set(bytes.subarray(0, 2), 0);
        finalBytes.set(jfifHeader, 2);
        finalBytes.set(bytes.subarray(2), 2 + jfifHeader.length);
      }

      let binary = "";
      const len = finalBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(finalBytes[i]);
      }
      return "data:image/jpeg;base64," + btoa(binary);
    } catch {
      return dataUrl;
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImgUrl(ev.target.result as string);
        setStep("crop");
        setBgRemovedUrl(null);
        setZoomLevel(1);
        applyPreset(preset);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (p: AspectPreset) => {
    setPreset(p);
    if (p === "free") return;

    setPhotoOrientation("portrait");

    // शुद्ध पोर्ट्रेट अनुपात (Width / Height)
    let ratio = 1;
    if (p === "passport") ratio = 3.5 / 4.5;       // मानक पासपोर्ट (0.777)
    else if (p === "4:6") ratio = 4 / 6;           // 4x6 इंच (0.666)
    else if (p === "5:7") ratio = 5 / 7;           // 5x7 इंच (0.714)
    else if (p === "8:10") ratio = 8 / 10;         // 8x10 इंच (0.800)
    else if (p === "a4") ratio = 210 / 297;        // A4 शीट (0.707)
    else if (p === "signature") ratio = 3.5 / 1.5; // हस्ताक्षर (2.333 - लैंडस्केप)
    else if (p === "card") ratio = 8.5 / 5.5;      // आईडी कार्ड (1.545 - लैंडस्केप)
    else if (p === "1:1") ratio = 1;

    const cWidth = containerRef.current?.clientWidth || 600;
    const cHeight = containerRef.current?.clientHeight || 500;

    // स्क्रीन पर वास्तविक पिक्सल ऊँचाई व चौड़ाई
    let pixelH = Math.min(cHeight * 0.65, 420);
    let pixelW = pixelH * ratio;

    if (pixelW > cWidth * 0.85) {
      pixelW = cWidth * 0.85;
      pixelH = pixelW / ratio;
    }

    // कंटेनर के सापेक्ष शुद्ध % चौड़ाई और % ऊँचाई
    const pctW = Math.max(8, Math.min(92, (pixelW / cWidth) * 100));
    const pctH = Math.max(8, Math.min(92, (pixelH / cHeight) * 100));

    setCrop({
      x: Math.max(2, (100 - pctW) / 2),
      y: Math.max(2, (100 - pctH) / 2),
      w: pctW,
      h: pctH,
    });
  };

    const toggleAutoEnhance = () => {
    if (tuneMode !== "auto") {
      setTuneMode("auto");
      setIsAutoEnhanced(true);
      setBrightness(112);
      setContrast(120);
      setSaturation(118);
    } else {
      setTuneMode("manual");
      setIsAutoEnhanced(false);
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }
  };

  const handleManualSliderChange = (setter: (val: number) => void, val: number) => {
    if (tuneMode === "auto") {
      setTuneMode("manual");
      setIsAutoEnhanced(false);
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
    }
    setter(val);
  };

  const currentPresetRef = useRef<AspectPreset>(preset);
  useEffect(() => {
    currentPresetRef.current = preset;
  }, [preset]);

  const onDragStart = (e: React.MouseEvent | React.TouchEvent, type: string) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      type,
      startX: clientX,
      startY: clientY,
      cropStart: { ...crop },
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.type || !containerRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((clientY - dragRef.current.startY) / rect.height) * 100;

      const { cropStart, type } = dragRef.current;
      const activePreset = currentPresetRef.current;
      let newCrop = { ...cropStart };

      if (type === "move") {
        newCrop.x = Math.max(0, Math.min(100 - newCrop.w, cropStart.x + dx));
        newCrop.y = Math.max(0, Math.min(100 - newCrop.h, cropStart.y + dy));
      } else if (activePreset === "free") {
        // === 100% फ्री मोड: चारों कोने पूरी तरह स्वतंत्र (कोई रेश्यो लॉक नहीं) ===
        if (type === "se") {
          newCrop.w = Math.max(5, Math.min(100 - cropStart.x, cropStart.w + dx));
          newCrop.h = Math.max(5, Math.min(100 - cropStart.y, cropStart.h + dy));
        } else if (type === "sw") {
          const maxLeft = cropStart.x + cropStart.w - 5;
          const targetX = Math.max(0, Math.min(maxLeft, cropStart.x + dx));
          newCrop.x = targetX;
          newCrop.w = (cropStart.x + cropStart.w) - targetX;
          newCrop.h = Math.max(5, Math.min(100 - cropStart.y, cropStart.h + dy));
        } else if (type === "ne") {
          newCrop.w = Math.max(5, Math.min(100 - cropStart.x, cropStart.w + dx));
          const maxTop = cropStart.y + cropStart.h - 5;
          const targetY = Math.max(0, Math.min(maxTop, cropStart.y + dy));
          newCrop.y = targetY;
          newCrop.h = (cropStart.y + cropStart.h) - targetY;
        } else if (type === "nw") {
          const maxLeft = cropStart.x + cropStart.w - 5;
          const targetX = Math.max(0, Math.min(maxLeft, cropStart.x + dx));
          newCrop.x = targetX;
          newCrop.w = (cropStart.x + cropStart.w) - targetX;

          const maxTop = cropStart.y + cropStart.h - 5;
          const targetY = Math.max(0, Math.min(maxTop, cropStart.y + dy));
          newCrop.y = targetY;
          newCrop.h = (cropStart.y + cropStart.h) - targetY;
        }
      } else {
        // === फिक्स्ड प्रीसेट मोड: केवल यहाँ अनुपात लॉक रहेगा ===
        let ratio = 1;
        if (activePreset === "passport") ratio = 3.5 / 4.5;
        else if (activePreset === "4:6") ratio = 4 / 6;
        else if (activePreset === "5:7") ratio = 5 / 7;
        else if (activePreset === "8:10") ratio = 8 / 10;
        else if (activePreset === "a4") ratio = 210 / 297;
        else if (activePreset === "signature") ratio = 3.5 / 1.5;
        else if (activePreset === "card") ratio = 8.5 / 5.5;

        const containerAspect = rect.width / rect.height;

        if (type === "se") {
          let nw = Math.max(8, Math.min(100 - cropStart.x, cropStart.w + dx));
          let nh = nw / (ratio * containerAspect);
          if (cropStart.y + nh > 100) {
            nh = 100 - cropStart.y;
            nw = nh * ratio * containerAspect;
          }
          newCrop.w = nw;
          newCrop.h = nh;
        } else if (type === "sw") {
          let nw = Math.max(8, Math.min(cropStart.x + cropStart.w, cropStart.w - dx));
          let nh = nw / (ratio * containerAspect);
          if (cropStart.y + nh > 100) {
            nh = 100 - cropStart.y;
            nw = nh * ratio * containerAspect;
          }
          newCrop.x = cropStart.x + (cropStart.w - nw);
          newCrop.w = nw;
          newCrop.h = nh;
        } else if (type === "ne") {
          let nw = Math.max(8, Math.min(100 - cropStart.x, cropStart.w + dx));
          let nh = nw / (ratio * containerAspect);
          if (nh > cropStart.y + cropStart.h) {
            nh = cropStart.y + cropStart.h;
            nw = nh * ratio * containerAspect;
          }
          newCrop.y = (cropStart.y + cropStart.h) - nh;
          newCrop.w = nw;
          newCrop.h = nh;
        } else if (type === "nw") {
          let nw = Math.max(8, Math.min(cropStart.x + cropStart.w, cropStart.w - dx));
          let nh = nw / (ratio * containerAspect);
          if (nh > cropStart.y + cropStart.h) {
            nh = cropStart.y + cropStart.h;
            nw = nh * ratio * containerAspect;
          }
          newCrop.x = cropStart.x + (cropStart.w - nw);
          newCrop.y = (cropStart.y + cropStart.h) - nh;
          newCrop.w = nw;
          newCrop.h = nh;
        }
      }

      setCrop(newCrop);
    };

    const onEnd = () => {
      dragRef.current.type = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

    const handleResetToCropped = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setIsBw(false);
    setIsAutoEnhanced(false);
    setTuneMode("manual");
    setBgColor("transparent");
    setHasBorder(false);
    setEnableStamp(false);
    setCandidateName("");
    setDopDate("");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setFitMode("fit");
    if (preset === "free" && freeCropRatio) {
      if (freeCropRatio > 1.05) setPhotoOrientation("landscape");
      else setPhotoOrientation("portrait");
    }
  };

  const confirmCrop = () => {
    const img = sourceImgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // 1. रोटेटेड इमेज के लिए एक टेम्परेरी पूर्ण-रेजोल्यूशन कैनवास तैयार करें
    const rot = (rotation % 360 + 360) % 360;
    const isSwapped = rot === 90 || rot === 270;

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = isSwapped ? img.naturalHeight : img.naturalWidth;
    baseCanvas.height = isSwapped ? img.naturalWidth : img.naturalHeight;
    const bCtx = baseCanvas.getContext("2d");
    if (!bCtx) return;

    bCtx.save();
    bCtx.translate(baseCanvas.width / 2, baseCanvas.height / 2);
    bCtx.rotate((rot * Math.PI) / 180);
    bCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    bCtx.restore();

    // 2. कंटेनर और स्क्रीन पर दिख रही इमेज का वास्तविक बाउंडिंग रेक्ट
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    const cropPixelX = (crop.x / 100) * containerRect.width;
    const cropPixelY = (crop.y / 100) * containerRect.height;
    const cropPixelW = (crop.w / 100) * containerRect.width;
    const cropPixelH = (crop.h / 100) * containerRect.height;

    const intersectX = Math.max(imgLeft, cropPixelX);
    const intersectY = Math.max(imgTop, cropPixelY);
    const intersectRight = Math.min(imgLeft + imgWidth, cropPixelX + cropPixelW);
    const intersectBottom = Math.min(imgTop + imgHeight, cropPixelY + cropPixelH);

    const validW = Math.max(10, intersectRight - intersectX);
    const validH = Math.max(10, intersectBottom - intersectY);

    // बेस कैनवास के स्केल पर मैपिंग
    const scaleX = baseCanvas.width / imgWidth;
    const scaleY = baseCanvas.height / imgHeight;

    const sourceX = Math.round((intersectX - imgLeft) * scaleX);
    const sourceY = Math.round((intersectY - imgTop) * scaleY);
    const sourceW = Math.round(validW * scaleX);
    const sourceH = Math.round(validH * scaleY);

    if (sourceW <= 0 || sourceH <= 0) return;

    // 3. अंतिम कटी हुई इमेज तैयार करना
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = sourceW;
    cropCanvas.height = sourceH;
    const cCtx = cropCanvas.getContext("2d");
    if (!cCtx) return;

    cCtx.drawImage(baseCanvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

    const aspect = sourceW / sourceH;
    setFreeCropRatio(aspect);

    // यदि कटी हुई इमेज चौड़ी (Landscape) है, तो एडिटर को भी लैंडस्केप सेट करें
    if (aspect > 1.05) {
      setPhotoOrientation("landscape");
    } else {
      setPhotoOrientation("portrait");
    }

    // एडिटर के लिए रोटेशन स्टेट को 0 पर रीसेट करें ताकि दोबारा न घूमे
    setRotation(0);
    setCroppedUrl(cropCanvas.toDataURL("image/png"));
    setBgRemovedUrl(null);
    setStep("editor");
  };

  const handleRemoveBackground = async () => {
    if (!croppedUrl) return;
    setIsRemovingBg(true);

    try {
      const formData = new FormData();
      const resBlob = await fetch(croppedUrl).then((r) => r.blob());
      formData.append("image_file", resBlob, "photo.png");

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("BG Removal failed");
      const blob = await response.blob();
      setBgRemovedUrl(URL.createObjectURL(blob));
      setBgColor("#ffffff");
    } catch {
      alert("बैकग्राउंड हटाने में समस्या आई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const makeFinalCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!activeDisplayImg) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
          if (!ctx) return;
        if (!ctx) {
          resolve(null);
          return;
        }

        const dims = getTargetDimensions(preset, photoOrientation);
        let cw = dims.width;
        let ch = dims.height;

        // जब Full HD चुना हो, तो छोटे पिक्सेल (413px) में न सिकोड़ें - ओरिजिनल हाई-रेजोल्यूशन रखें
        if (kbMode === "hd") {
          const targetAspect = cw / ch;
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;
          
          if (origW > 0 && origH > 0) {
            // ओरिजिनल रेजोल्यूशन का पूरा उपयोग करते हुए अनुपात लॉक करें
            if (origW / origH > targetAspect) {
              ch = Math.max(origH, dims.height * 2);
              cw = Math.round(ch * targetAspect);
            } else {
              cw = Math.max(origW, dims.width * 2);
              ch = Math.round(cw / targetAspect);
            }
          }
        }

        canvas.width = cw;
        canvas.height = ch;

        ctx.fillStyle = bgColor !== "transparent" ? bgColor : "#ffffff";
        ctx.fillRect(0, 0, cw, ch);

        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        const filterParts = [
          `brightness(${brightness}%)`,
          `contrast(${contrast}%)`,
          `saturate(${isBw ? 0 : saturation}%)`,
        ];
        if (isBw) filterParts.push("grayscale(100%)");
        ctx.filter = filterParts.join(" ");

        const isRot = rotation % 180 !== 0;
        const srcW = isRot ? img.height : img.width;
        const srcH = isRot ? img.width : img.height;
        const scale = fitMode === "fill" 
          ? Math.max(cw / srcW, ch / srcH) 
          : Math.min(cw / srcW, ch / srcH);
        const renderW = img.width * scale;
        const renderH = img.height * scale;

        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();

        if (false && enableStamp) {
          const stampH = Math.max(60, Math.round(ch * 0.16));
          const stampY = ch - stampH;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, stampY, cw, stampH);

          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = Math.max(2, Math.round(cw * 0.004));
          ctx.strokeRect(0, stampY, cw, stampH);

          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // स्लाइडर के आधार पर कैनवास का अनुपातित फ़ॉन्ट साइज़
          const scaleFactor = cw / 413; // 413px पासपोर्ट बेस
          const fontSize = Math.round(stampFontSize * scaleFactor);
          ctx.font = `bold ${fontSize}px sans-serif`;

          const formattedDate = dopDate ? dopDate.split("-").reverse().join("-") : "";

          if (candidateName.trim()) {
            ctx.fillText(candidateName.toUpperCase(), cw / 2, stampY + stampH * 0.34);
            ctx.font = `bold ${Math.round(fontSize * 0.88)}px sans-serif`;
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH * 0.72);
          } else {
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH / 2);
          }
        }

        if (hasBorder) {
          ctx.lineWidth = Math.max(1, Math.round(cw * 0.0025)); // स्टूडियो 1-2px बारीक बॉर्डर
          ctx.strokeStyle = "#1e293b";
          ctx.strokeRect(0, 0, cw, ch);
        }

        resolve(canvas);
      };
      img.src = activeDisplayImg;
    });
  };

  const getCompressedJpgData = async (originalCanvas: HTMLCanvasElement) => {
    if (!originalCanvas) return null;

    const target = kbMode === "hd" ? 1500 : customKb;
    const res = await exportSmartJpg(originalCanvas, {
      targetKb: target,
      dpi: 300
    });

    return res;
  };

  const handleDownloadJpg = async () => {
    const originalCanvas = await makeFinalCanvas();
    if (!originalCanvas) return;

    const res = await getCompressedJpgData(originalCanvas);
    if (!res) return;

    const a = document.createElement("a");
    const tag = kbMode === "hd" ? "FullHD" : `${customKb}kb`;
    a.download = `ExamSewa_${fileName || "doc"}_${preset || "crop"}_${tag}.jpg`;
    a.href = res.dataUrl;
    a.click();
  };

  const handleDownloadPdf = async () => {
    const originalCanvas = await makeFinalCanvas();
    if (!originalCanvas) return;

    const res = await getCompressedJpgData(originalCanvas);
    if (!res) return;

    const imgBytes = new Uint8Array(await res.blob.arrayBuffer());
    const imgLen = imgBytes.length;

    const ptWidth = Math.round((res.width * 72) / 300);
    const ptHeight = Math.round((res.height * 72) / 300);

    const header = "%PDF-1.4\n";
    const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
    const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${res.width} /Height ${res.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`;
    const obj4Footer = "\nendstream\nendobj\n";
    const contentStream = `q ${ptWidth} 0 0 ${ptHeight} 0 0 cm /Im1 Do Q`;
    const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

    const enc = new TextEncoder();
    const pHeader = enc.encode(header);
    const pObj1 = enc.encode(obj1);
    const pObj2 = enc.encode(obj2);
    const pObj3 = enc.encode(obj3);
    const pObj4H = enc.encode(obj4Header);
    const pObj4F = enc.encode(obj4Footer);
    const pObj5 = enc.encode(obj5);

    let offset = pHeader.length;
    const offset1 = offset; offset += pObj1.length;
    const offset2 = offset; offset += pObj2.length;
    const offset3 = offset; offset += pObj3.length;
    const offset4 = offset; offset += (pObj4H.length + imgLen + pObj4F.length);
    const offset5 = offset; offset += pObj5.length;

    const pad = (n: number) => String(n).padStart(10, "0");
    const xref = `xref\n0 6\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
    const pXref = enc.encode(xref);

    const pdfBlob = new Blob([
      pHeader,
      pObj1,
      pObj2,
      pObj3,
      pObj4H,
      imgBytes,
      pObj4F,
      pObj5,
      pXref
    ], { type: "application/pdf" });

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    const tag = kbMode === "hd" ? "FullHD" : `${customKb}kb`;
    a.href = url;
    a.download = `ExamSewa_${fileName || "doc"}_${preset || "crop"}_${tag}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

    const handleShare = async () => {
    const canvas = await makeFinalCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `ExamSewa_${fileName}.jpg`, { type: "image/jpeg" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "ExamSewa File",
            text: "Edited via ExamSewa",
          });
        } catch {
          // ignore
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("लिंक कॉपी कर दिया गया है!");
      }
    }, "image/jpeg", 0.95);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center font-bold text-slate-600">लोड हो रहा है...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-1 sm:py-2 px-2 sm:px-4 text-slate-800 select-none">
      <div className="w-full max-w-[98%] mx-auto space-y-2">
        {/* इनलाइन हेडर */}
        <div className="flex items-center justify-between py-1 border-b border-slate-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300 transition-all shadow-2xs" href="/">
              ← होम
            </Link>
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
              <span>ExamSewa</span>
              <span className="text-blue-600">फोटो क्रॉपर</span>
            </h1>
          </div>

          {step !== "upload" && (
            <button
              onClick={() => {
                setStep("upload");
                setImgUrl("");
                setCroppedUrl("");
                setBgRemovedUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs font-black text-red-600 bg-white hover:bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200 transition-all cursor-pointer shadow-2xs"
            >
              ✕ नई फ़ाइल
            </button>
          )}
        </div>

        {/* 1. अपलोड स्क्रीन */}
        {step === "upload" && (
          <div className="bg-white border-2 border-dashed border-blue-400 hover:border-blue-600 rounded-2xl p-4 sm:p-6 text-center shadow-xs transition-all flex flex-col items-center max-w-2xl mx-auto my-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-2">
              ✂️
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-1">
              फोटो, साइन व डॉक्यूमेंट क्रॉप और एडिट करें
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-3 max-w-md">
              पासपोर्ट फोटो (3.5×4.5 cm), 4×6, 5×7, 8×10, A4, सिग्नेचर व पैन कार्ड को सही आकार में क्रॉप करें और तुरंत 300 DPI में एडिट करें।
            </p>

            <label className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center justify-center gap-2">
              <span>📁 फोटो या डॉक्यूमेंट चुनें</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-[11px] font-bold text-slate-600 w-full">
              <div className="p-2 bg-slate-50 rounded-xl">📷 पासपोर्ट फोटो (3.5×4.5)</div>
              <div className="p-2 bg-slate-50 rounded-xl">✍️ सिग्नेचर (हस्ताक्षर)</div>
              <div className="p-2 bg-slate-50 rounded-xl">💳 पैन / आधार कार्ड</div>
              <div className="p-2 bg-slate-50 rounded-xl">📄 A4 मार्कशीट / डॉक्यूमेंट</div>
            </div>
          </div>
        )}

        {/* 2. क्रॉप स्क्रीन */}
        {step === "crop" && (
          <div className="flex flex-col items-center justify-center w-full max-w-full lg:max-w-[94%] xl:max-w-[90%] mx-auto pb-2">
            <div className="w-full  bg-slate-200/95 rounded-2xl border-2 border-slate-300 shadow-inner p-2 flex flex-col sticky top-11 z-30 h-[75vh] sm:h-[78vh] lg:h-[88vh] lg:min-h-[720px] xl:min-h-[780px] shrink-0">
              <div className="w-full flex items-center justify-center gap-2 mb-1.5 text-xs font-black text-slate-700 px-1">


                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-xl border border-slate-300 shadow-2xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.2).toFixed(1))))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-black w-8 text-center text-slate-600">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    title="रीसेट ज़ूम"
                    className="ml-1 text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-bold cursor-pointer"
                  >
                    ↺
                  </button>

                  {/* By degree कस्टमाइज़ पॉइंटर */}
                </div>

                <span className="text-blue-600 font-bold uppercase text-[11px] sm:text-xs">{preset}</span>
              </div>

              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl bg-white shadow-md border-2 border-slate-400 select-none w-full flex-1 flex items-center justify-center p-2"
              >
                <img
                  ref={sourceImgRef}
                  src={imgUrl}
                  alt="Source"
                  style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)`, transition: "transform 0.15s ease-out" }}
                  className="w-auto h-auto max-w-full max-h-full object-contain block pointer-events-none origin-center"
                />

                <div
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.w}%`,
                    height: `${crop.h}%`,
                  }}
                  onMouseDown={(e) => onDragStart(e, "move")}
                  onTouchStart={(e) => onDragStart(e, "move")}
                  className="absolute border-2 border-blue-600 bg-blue-500/15 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.50)] touch-none select-none"
                >
                  <div
                    onMouseDown={(e) => onDragStart(e, "nw")}
                    onTouchStart={(e) => onDragStart(e, "nw")}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "ne")}
                    onTouchStart={(e) => onDragStart(e, "ne")}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "sw")}
                    onTouchStart={(e) => onDragStart(e, "sw")}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nesw-resize shadow-md touch-none"
                  />
                  <div
                    onMouseDown={(e) => onDragStart(e, "se")}
                    onTouchStart={(e) => onDragStart(e, "se")}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-600 rounded-full cursor-nwse-resize shadow-md touch-none"
                  />
                </div>
              </div>
              {/* नीचे: रोटेट (↶ ↷), डिग्री (▼ 0 ▲) और क्रॉप बटन */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-300">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-700">Rotate:</span>
                  
                  {/* बायाँ 90° तीर */}
                  <button
                    type="button"
                    onClick={() => {
                      setRotation((r) => (r - 90 + 360) % 360);
                      setCrop((prev) => ({
                        ...prev,
                        x: Math.max(5, Math.round((100 - prev.w) / 2)),
                        y: Math.max(5, Math.round((100 - prev.h) / 2)),
                      }));
                    }}
                    title="Rotate Left (-90°)"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl text-base sm:text-lg font-black text-slate-800 shadow-2xs cursor-pointer transition-all"
                  >
                    ↶
                  </button>

                  {/* दायाँ 90° तीर */}
                  <button
                    type="button"
                    onClick={() => {
                      setRotation((r) => (r + 90) % 360);
                      setCrop((prev) => ({
                        ...prev,
                        x: Math.max(5, Math.round((100 - prev.w) / 2)),
                        y: Math.max(5, Math.round((100 - prev.h) / 2)),
                      }));
                    }}
                    title="Rotate Right (+90°)"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-xl text-base sm:text-lg font-black text-slate-800 shadow-2xs cursor-pointer transition-all"
                  >
                    ↷
                  </button>

                  {/* बारीक डिग्री पॉइंटर */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs overflow-hidden ml-1">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 1 + 360) % 360)}
                      className="w-7 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-slate-700 font-black text-xs cursor-pointer border-r border-slate-200"
                      title="-1°"
                    >
                      ▼
                    </button>
                    <input
                      type="number"
                      value={rotation}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setRotation(((val % 360) + 360) % 360);
                      }}
                      className="w-10 text-center text-xs font-black bg-white py-1 focus:outline-none"
                      min={0}
                      max={359}
                    />
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 1) % 360)}
                      className="w-7 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-slate-700 font-black text-xs cursor-pointer border-l border-slate-200"
                      title="+1°"
                    >
                      ▲
                    </button>
                    <span className="pr-1.5 text-xs font-bold text-slate-400">°</span>
                  </div>
                </div>

                {/* आगे बढ़ें बटन */}
                <button
                  type="button"
                  onClick={confirmCrop}
                  className="flex-1 sm:flex-none sm:min-w-[120px] h-9 sm:h-10 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>✂️</span>
                  <span>क्रॉप</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 3. मुख्य एडिटर स्क्रीन */}
        {step === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start pb-3">
            {/* बायाँ प्रीव्यू बॉक्स */}
            <div className="lg:col-span-8 xl:col-span-9 bg-slate-200/95 rounded-2xl border-2 border-slate-300 shadow-inner p-2.5 flex flex-col sticky top-1 z-30 h-auto lg:h-[88vh] lg:min-h-[720px] xl:min-h-[780px]">
              {/* मोड स्विचर */}
              <div className="w-full flex items-center justify-between mb-1.5 px-1 shrink-0">

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* फिट vs फिल टॉगल */}
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFitMode("fit")}
                      className={`text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
                        fitMode === "fit" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🛡️ फिट (मार्जिन)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode("fill")}
                      className={`text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
                        fitMode === "fill" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📐 पूरा भरें (Fill)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhotoOrientation(o => o === "portrait" ? "landscape" : "portrait")}
                    className="text-[11px] bg-white border border-slate-300 px-2 py-1 rounded-lg font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    {photoOrientation === "portrait" ? "↕️ पोर्ट्रेट" : "↔️ लैंडस्केप"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("crop")}
                    className="text-[11px] text-blue-600 hover:underline font-bold px-1"
                  >
                    ↩ दोबारा क्रॉप
                  </button>
                </div>
              </div>

              {/* फोटो / डॉक्यूमेंट फ्रेम और लाइव प्रीव्यू */}
              <div className="w-full min-h-[360px] md:min-h-[560px] md:h-[68vh] flex items-center justify-center p-3 md:p-6 bg-slate-100/70 rounded-xl border border-slate-300/80 shadow-inner overflow-hidden">
                <div
                  style={{
                    backgroundColor: bgColor !== "transparent" ? bgColor : "#ffffff",
                    aspectRatio: getPresetRatio(preset),
                  }}
                  className={`relative rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center max-w-full max-h-full transition-all ${
                    hasBorder ? "border-[1.5px] border-slate-900" : "border border-slate-300"
                  }`}
                >
                  <img
                    src={activeDisplayImg}
                    alt="Preview"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${isBw ? 0 : saturation}%) ${
                        isBw ? "grayscale(100%)" : ""
                      }`,
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    }}
                    className={`w-full h-full block transition-all duration-150 ${fitMode === "fill" ? "object-cover" : "object-contain"}`}
                  />

                  {/* लाइव Name & DOP स्ट्रिप (फॉन्ट स्लाइडर से नियंत्रित) */}
                  {false && enableStamp && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-slate-900 py-1 px-1.5 text-center select-none shadow-md z-20">
                      <p
                        style={{ fontSize: `${stampFontSize}px` }}
                        className="font-black text-slate-950 uppercase leading-tight tracking-wide font-sans truncate"
                      >
                        {candidateName.trim() ? candidateName : "अभ्यर्थी का नाम"}
                      </p>
                      <p
                        style={{ fontSize: `${Math.max(10, Math.round(stampFontSize * 0.82))}px` }}
                        className="font-black text-slate-800 leading-tight mt-0.5 tracking-wider font-mono"
                      >
                        DOP: {dopDate ? dopDate.split("-").reverse().join("-") : "DD-MM-YYYY"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* दायाँ टूल्स पैनल */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md p-3 space-y-3 z-10">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  {false ? "📷 फोटो स्टूडियो टूल्स" : "📄 डॉक्यूमेंट टूल्स"}
                </h3>
                <button
                  type="button"
                  onClick={handleResetToCropped}
                  title="सभी बदलाव रीसेट करें और मूल क्रॉप स्थिति पर लौटें"
                  className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>↺</span>
                  <span>रीसेट</span>
                </button>
              </div>

              {/* 📷 फोटो मोड टूल्स */}
              {false && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. फोटो साइज़ मानक */}
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                    <span className="text-blue-950 font-black text-[11px]">📐 फोटो साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "passport", label: "पासपोर्ट (3.5×4.5)" },
                        { id: "4:6", label: "🖼 4×6 इंच" },
                        { id: "5:7", label: "🖼 5×7 इंच" },
                        { id: "8:10", label: "🖼 8×10 इंच" },
                        { id: "a4", label: "📄 A4 फोटो" },
                        { id: "1:1", label: "⏹️ 1:1 स्क्वायर" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyPreset(item.id as AspectPreset)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                            preset === item.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. AI बैकग्राउंड रिमूवर और 10 कलर्स */}
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-black">✨ AI बैकग्राउंड</span>
                      {bgRemovedUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setBgRemovedUrl(null);
                            setBgColor("transparent");
                          }}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          मूल बैकग्राउंड लाएं
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <span>{isRemovingBg ? "बैकग्राउंड हटाया जा रहा है..." : "✨ 1-क्लिक बैकग्राउंड हटाएँ (AI)"}</span>
                    </button>

                    <div>
                      <span className="text-[11px] font-black text-slate-700 block mb-1">
                        🎨 स्टूडियो बैकग्राउंड कलर्स (10 शेड्स):
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { name: "पारदर्शी", color: "transparent", border: "border-slate-300" },
                          { name: "शुद्ध सफेद", color: "#ffffff", border: "border-slate-300" },
                          { name: "हल्का नीला", color: "#93c5fd", border: "border-blue-300" },
                          { name: "पासपोर्ट नीला", color: "#2563eb", border: "border-blue-700" },
                          { name: "गहरा नेवी", color: "#1e3a8a", border: "border-blue-950" },
                          { name: "हल्का लाल", color: "#fca5a5", border: "border-red-300" },
                          { name: "स्टूडियो ग्रे", color: "#e2e8f0", border: "border-slate-300" },
                          { name: "हल्का हरा", color: "#86efac", border: "border-green-300" },
                          { name: "क्रीम येलो", color: "#fef08a", border: "border-amber-300" },
                          { name: "डार्क ग्रे", color: "#475569", border: "border-slate-600" },
                        ].map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            title={item.name}
                            style={{ backgroundColor: item.color !== "transparent" ? item.color : undefined }}
                            onClick={() => setBgColor(item.color)}
                            className={`h-7 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                              item.border
                            } ${item.color === "transparent" ? "bg-slate-100" : ""} ${
                              bgColor === item.color ? "ring-2 ring-blue-600 scale-105" : "hover:scale-105"
                            }`}
                          >
                            {bgColor === item.color && (
                              <span className="text-[10px] font-black text-slate-800">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. नाम व फोटो की तारीख (DOP) स्टैम्प */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableStamp}
                        onChange={(e) => setEnableStamp(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">
                        🏷️ नाम और तारीख (DOP) स्टैम्प जोड़ें
                      </span>
                    </label>

                    {enableStamp && (
                      <div className="space-y-2 pt-1.5 border-t border-slate-200">
                        <div>
                          <label className="block text-[11px] font-black text-slate-700 mb-1">
                            👤 अभ्यर्थी का नाम (Name):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. AMIT SHARMA"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full border-2 border-slate-300 focus:border-blue-600 p-2 rounded-lg text-xs bg-white uppercase font-bold text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-700 mb-1">
                            📅 फोटो की तारीख (DOP / Date):
                          </label>
                          <input
                            type="date"
                            value={dopDate}
                            onChange={(e) => setDopDate(e.target.value)}
                            className="w-full border-2 border-slate-300 focus:border-blue-600 p-2 rounded-lg text-xs bg-white font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* 🔤 फॉन्ट साइज़ कंट्रोल स्लाइडर */}
                        <div className="pt-1 border-t border-slate-200">
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="font-bold text-slate-700">🔤 नाम/तारीख का साइज़:</span>
                            <span className="font-black text-blue-700">{stampFontSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="11"
                            max="26"
                            value={stampFontSize}
                            onChange={(e) => setStampFontSize(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer h-1.5"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                            <span>छोटा</span>
                            <span>मध्यम</span>
                            <span>बड़ा</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. फोटो बॉर्डर, रोटेट और ऑटो फिट */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasBorder(!hasBorder)}
                      className={`py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        hasBorder
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {hasBorder ? "✓ बॉर्डर ऑन" : "🔲 पतला बॉर्डर"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-black cursor-pointer text-[11px]"
                    >
                      🔄 घुमाएँ ({rotation}°)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode(fitMode === "fill" ? "fit" : "fill")}
                      className={`py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        fitMode === "fill"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {fitMode === "fill" ? "✓ फिटेड (नो पट्टी)" : "🎯 ऑटो फिट"}
                    </button>
                  </div>
                </div>
              )}

              {/* 📄 डॉक्यूमेंट मोड टूल्स */}
              {true && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. डॉक्यूमेंट साइज मानक */}
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-emerald-950 font-black text-[11px]">📐 डॉक्यूमेंट साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "a4", label: "📄 A4 साइज" },
                        { id: "4:6", label: "📑 4×6 साइज" },
                        { id: "card", label: "💳 पहचान पत्र / पैन" },
                        { id: "signature", label: "✍️ हस्ताक्षर (Sign)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyPreset(item.id as AspectPreset)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                            preset === item.id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-white text-slate-800 border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. स्कैन फिल्टर्स */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-slate-900 font-black text-[11px]">✨ स्कैन व प्रिंट फिल्टर्स:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(125);
                          setContrast(160);
                          setSaturation(90);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        ⚡ ऑटो क्लीन
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(120);
                          setContrast(165);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📄 B&W ज़ेरॉक्स
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(105);
                          setContrast(120);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📑 ग्रे-स्केल
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        🎨 ओरिजिनल रंग
                      </button>
                    </div>
                  </div>

                  {/* 3. रोटेशन व फ्लिप */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-slate-900 font-black text-[11px]">🔄 ओरिएंटेशन व फ्लिप:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-black text-[11px] cursor-pointer"
                      >
                        🔄 90° घुमाएँ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipH((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipH ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↔️ मिरर H
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipV((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipV ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↕️ फ्लिप V
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🎨 टोन एडजस्टमेंट्स: ऑटो vs मैनुअल (एक समय पर केवल एक सक्रिय) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTuneMode("manual");
                        setIsAutoEnhanced(false);
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                        tuneMode === "manual"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      🎚️ मैनुअल
                    </button>
                    <button
                      type="button"
                      onClick={toggleAutoEnhance}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                        tuneMode === "auto"
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {tuneMode === "auto" ? "✓ ऑटो टोन ऑन" : "✨ ऑटो टोन"}
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {tuneMode === "auto" ? "ऑटो एक्टिव" : "मैनुअल एक्टिव"}
                  </span>
                </div>

                <div className={`space-y-2 transition-all ${tuneMode === "auto" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-slate-700">☀️ ब्राइटनेस (उजाला):</span>
                      <span className="font-black text-blue-700">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      disabled={tuneMode === "auto"}
                      value={brightness}
                      onChange={(e) => handleManualSliderChange(setBrightness, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-slate-700">🌓 कॉन्ट्रास्ट (शार्पनेस):</span>
                      <span className="font-black text-blue-700">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      disabled={tuneMode === "auto"}
                      value={contrast}
                      onChange={(e) => handleManualSliderChange(setContrast, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-slate-700">🌈 सैचुरेशन (रंग गाढ़ा):</span>
                      <span className="font-black text-blue-700">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      disabled={tuneMode === "auto"}
                      value={saturation}
                      onChange={(e) => handleManualSliderChange(setSaturation, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* 🎯 डाउनलोड क्वालिटी / KB साइज़ कंट्रोल (कॉमन) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-black text-slate-800">
                  🎯 डाउनलोड क्वालिटी व KB साइज़:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setKbMode("hd")}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "hd"
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    ⭐ Full HD (मूल)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKbMode("custom")}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "custom"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    🎯 कस्टम KB
                  </button>
                </div>

                <div className={`space-y-1 transition-opacity ${kbMode === "hd" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-600">टारगेट साइज़:</span>
                    <span className="font-black text-blue-700">{customKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="800"
                    step="5"
                    disabled={kbMode === "hd"}
                    value={customKb}
                    onChange={(e) => setCustomKb(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>10 KB</span>
                    <span>400 KB</span>
                    <span>800 KB</span>
                  </div>
                </div>
              </div>

              {/* डाउनलोड बटन्स */}
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span>
                  <span>JPG डाउनलोड ({kbMode === "hd" ? "Full HD" : `${customKb} KB`})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📄</span>
                    <span>PDF डाउनलोड</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>शेयर</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
