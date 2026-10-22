'use client';

import React, { useState, useEffect, useRef } from 'react';

type Step = 'upload' | 'options' | 'print-sheet';
type ColorEffect = 'original' | 'bw' | 'bright' | 'studio';
type FitMode = 'trim' | 'no-trim' | 'adjust';
type PaperCategory = '4x6' | '5x7' | 'a4';
type MeasurementUnit = 'mm' | 'cm';

interface GridVariant {
  id: string;
  name: string;
  subText: string;
  rows: number;
  cols: number;
  gapMm: number;
  rowGapMm?: number;
  colGapMm?: number;
  topMarginMm: number;
  sideMarginMm: number;
  cellWidthMm: number;
  cellHeightMm: number;
  isSingle?: boolean;
  isCustom?: boolean;
}

interface PaperGroup {
  id: PaperCategory;
  title: string;
  aspect: string;
  pixelW: number;
  pixelH: number;
  paperWidthMm: number;
  paperHeightMm: number;
  variants: GridVariant[];
}

const DEFAULT_PAPER_CONFIG: Record<PaperCategory, PaperGroup> = {
  '4x6': {
    id: '4x6',
    title: '4×6 इंच',
    aspect: '101.6 / 152.4',
    pixelW: 1200,
    pixelH: 1800,
    paperWidthMm: 101.6,
    paperHeightMm: 152.4,
    variants: [
      {
        id: '4x6-1',
        name: '1 फ़ोटो',
        subText: 'फुल पेज',
        rows: 1,
        cols: 1,
        gapMm: 0,
        topMarginMm: 0,
        sideMarginMm: 0,
        cellWidthMm: 101.6,
        cellHeightMm: 152.4,
        isSingle: true
      },
      {
        id: '4x6-8',
        name: '8 फ़ोटो',
        subText: '3.5×4.5 cm',
        rows: 4,
        cols: 2,
        gapMm: 2.0,
        rowGapMm: 2.0,
        colGapMm: 2.0,
        topMarginMm: 3.2,
        sideMarginMm: 4.3,
        cellWidthMm: 45.0,
        cellHeightMm: 35.0
      },
      {
        id: '4x6-9',
        name: '9 फ़ोटो',
        subText: '3.0×4.0 cm',
        rows: 3,
        cols: 3,
        gapMm: 2.5,
        rowGapMm: 2.5,
        colGapMm: 2.5,
        topMarginMm: 4.0,
        sideMarginMm: 3.3,
        cellWidthMm: 30.0,
        cellHeightMm: 40.0
      },
      {
        id: '4x6-12',
        name: '12 फ़ोटो',
        subText: '3×3.35 cm',
        rows: 4,
        cols: 3,
        gapMm: 2.5,
        rowGapMm: 2.5,
        colGapMm: 2.5,
        topMarginMm: 5.7,
        sideMarginMm: 3.3,
        cellWidthMm: 30.0,
        cellHeightMm: 33.5
      }
    ]
  },
  '5x7': {
    id: '5x7',
    title: '5×7 इंच',
    aspect: '127 / 178',
    pixelW: 1500,
    pixelH: 2100,
    paperWidthMm: 127.0,
    paperHeightMm: 177.8,
    variants: [
      {
        id: '5x7-1',
        name: '1 फ़ोटो',
        subText: 'फुल पेज',
        rows: 1,
        cols: 1,
        gapMm: 0,
        topMarginMm: 0,
        sideMarginMm: 0,
        cellWidthMm: 127.0,
        cellHeightMm: 177.8,
        isSingle: true
      },
      {
        id: '5x7-9',
        name: '9 फ़ोटो',
        subText: '3.5×4.5 cm',
        rows: 3,
        cols: 3,
        gapMm: 3.0,
        rowGapMm: 3.0,
        colGapMm: 3.0,
        topMarginMm: 6.0,
        sideMarginMm: 8.0,
        cellWidthMm: 35.0,
        cellHeightMm: 45.0
      },
      {
        id: '5x7-12',
        name: '12 फ़ोटो',
        subText: '3.0×4.0 cm',
        rows: 4,
        cols: 3,
        gapMm: 3.0,
        rowGapMm: 3.0,
        colGapMm: 3.0,
        topMarginMm: 4.4,
        sideMarginMm: 15.5,
        cellWidthMm: 30.0,
        cellHeightMm: 40.0
      }
    ]
  },
  'a4': {
    id: 'a4',
    title: 'A4 शीट',
    aspect: '210 / 297',
    pixelW: 2480,
    pixelH: 3508,
    paperWidthMm: 210.0,
    paperHeightMm: 297.0,
    variants: [
      {
        id: 'a4-1',
        name: '1 फ़ोटो',
        subText: 'फुल A4',
        rows: 1,
        cols: 1,
        gapMm: 0,
        topMarginMm: 0,
        sideMarginMm: 0,
        cellWidthMm: 210.0,
        cellHeightMm: 297.0,
        isSingle: true
      },
      {
        id: 'a4-30',
        name: '30 फ़ोटो',
        subText: '3.5×4.5 cm',
        rows: 6,
        cols: 5,
        gapMm: 2.5,
        rowGapMm: 2.5,
        colGapMm: 2.5,
        topMarginMm: 5.0,
        sideMarginMm: 12.5,
        cellWidthMm: 35.0,
        cellHeightMm: 45.0
      },
      {
        id: 'a4-36',
        name: '36 फ़ोटो',
        subText: '3.0×4.0 cm',
        rows: 6,
        cols: 6,
        gapMm: 4.0,
        rowGapMm: 4.0,
        colGapMm: 4.0,
        topMarginMm: 6.0,
        sideMarginMm: 5.0,
        cellWidthMm: 30.0,
        cellHeightMm: 40.0
      }
    ]
  }
};

export default function MrPhotoFullDemo() {
  const [step, setStep] = useState<Step>('upload');
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);

  const [fitMode, setFitMode] = useState<FitMode>('trim');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [hasTitle, setHasTitle] = useState<boolean>(false);
  const [titleText, setTitleText] = useState<string>('STUDENT NAME');
  const [hasDate, setHasDate] = useState<boolean>(false);
  const [dateText, setDateText] = useState<string>(new Date().toISOString().slice(0, 10));
  const [hasOutline, setHasOutline] = useState<boolean>(true);
  const [colorEffect, setColorEffect] = useState<ColorEffect>('original');

  const [isBorderless, setIsBorderless] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);

  const [paperCat, setPaperCat] = useState<PaperCategory>('4x6');
  const [paperConfig, setPaperConfig] = useState(DEFAULT_PAPER_CONFIG);
  const [activeVariantId, setActiveVariantId] = useState<string>('4x6-9');

  // कस्टम कैटलॉग मोडल स्टेट्स
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [custUnit, setCustUnit] = useState<MeasurementUnit>('mm');
  const [custStyleName, setCustStyleName] = useState<string>('कस्टम साइज़');
  const [custPaperType, setCustPaperType] = useState<PaperCategory>('4x6');

  const [custTopMarginStr, setCustTopMarginStr] = useState<string>('4');
  const [custLeftMarginStr, setCustLeftMarginStr] = useState<string>('4');
  const [custRowsStr, setCustRowsStr] = useState<string>('3');
  const [custColsStr, setCustColsStr] = useState<string>('3');
  const [custRowGapStr, setCustRowGapStr] = useState<string>('3');
  const [custColGapStr, setCustColGapStr] = useState<string>('3');
  const [custCellWStr, setCustCellWStr] = useState<string>('30');
  const [custCellHStr, setCustCellHStr] = useState<string>('40');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('examsewa_custom_layouts');
      if (saved) {
        const parsed: Record<string, GridVariant[]> = JSON.parse(saved);
        setPaperConfig((prev) => {
          const updated = { ...prev };
          (Object.keys(parsed) as PaperCategory[]).forEach((cat) => {
            if (updated[cat]) {
              const defIds = DEFAULT_PAPER_CONFIG[cat].variants.map((v) => v.id);
              const customOnly = parsed[cat].filter((v) => !defIds.includes(v.id));
              updated[cat] = {
                ...updated[cat],
                variants: [...DEFAULT_PAPER_CONFIG[cat].variants, ...customOnly]
              };
            }
          });
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentPaper = paperConfig[paperCat];
  const activeVariant =
    currentPaper.variants.find((v) => v.id === activeVariantId) || currentPaper.variants[0];

  const totalSlots = activeVariant.rows * activeVariant.cols;
  const [slots, setSlots] = useState<(string | null)[]>([]);

  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setRawPhoto(url);
    setRotation(0);
    setFitMode('trim');
    setZoomScale(100);
    setColorEffect('original');
    setStep('options');
  };

  const getFilterStyle = (effect: ColorEffect) => {
    switch (effect) {
      case 'bw':
        return 'grayscale(100%) contrast(110%)';
      case 'bright':
        return 'brightness(110%) contrast(104%) saturate(102%)';
      case 'studio':
        return 'contrast(108%) saturate(112%) brightness(103%)';
      default:
        return 'none';
    }
  };

  const handleApplyOptions = () => {
    if (!rawPhoto) return;

    const img = new Image();
    img.src = rawPhoto;
    img.onload = () => {
      const w = 840;
      const h = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.filter = getFilterStyle(colorEffect);

      const textSpace = (hasTitle ? 48 : 0) + (hasDate ? 40 : 0);
      const photoAreaH = h - textSpace - 24;
      const photoAreaW = w - 24;

      ctx.save();
      ctx.translate(w / 2, (photoAreaH + 24) / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const imgAspect = img.width / img.height;
      const targetAspect = photoAreaW / photoAreaH;

      let drawW = photoAreaW;
      let drawH = photoAreaH;

      if (fitMode === 'trim') {
        if (imgAspect > targetAspect) {
          drawH = photoAreaH;
          drawW = photoAreaH * imgAspect;
        } else {
          drawW = photoAreaW;
          drawH = photoAreaW / imgAspect;
        }
      } else if (fitMode === 'no-trim') {
        if (imgAspect > targetAspect) {
          drawW = photoAreaW;
          drawH = photoAreaW / imgAspect;
        } else {
          drawH = photoAreaH;
          drawW = photoAreaH * imgAspect;
        }
      } else if (fitMode === 'adjust') {
        const scale = zoomScale / 100;
        if (imgAspect > targetAspect) {
          drawH = photoAreaH * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = photoAreaW * scale;
          drawH = drawW / imgAspect;
        }
      }

      ctx.beginPath();
      ctx.rect(-photoAreaW / 2, -photoAreaH / 2, photoAreaW, photoAreaH);
      ctx.clip();
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.filter = 'none';

      if (hasOutline) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, w - 20, h - 20);
      }

      if (hasTitle || hasDate) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, h - textSpace - 16, w - 24, textSpace + 4);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        if (hasTitle && hasDate) {
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText(titleText, w / 2, h - 56);
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(dateText, w / 2, h - 20);
        } else if (hasTitle) {
          ctx.font = 'bold 38px sans-serif';
          ctx.fillText(titleText, w / 2, h - 24);
        } else if (hasDate) {
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(dateText, w / 2, h - 24);
        }
      }

      const resultUrl = canvas.toDataURL('image/jpeg', 0.98);
      setFinalPhoto(resultUrl);
      setSlots(Array(totalSlots).fill(resultUrl));
      setStep('print-sheet');
    };
  };

  const handleCategoryChange = (cat: PaperCategory) => {
    setPaperCat(cat);
    const firstVar = paperConfig[cat].variants.find((v) => !v.isSingle) || paperConfig[cat].variants[0];
    setActiveVariantId(firstVar.id);
    if (finalPhoto) {
      setSlots(Array(firstVar.rows * firstVar.cols).fill(finalPhoto));
    }
  };

  const handleVariantChange = (variant: GridVariant) => {
    setActiveVariantId(variant.id);
    if (finalPhoto) {
      setSlots(Array(variant.rows * variant.cols).fill(finalPhoto));
    }
  };

      const handleDirectPrint = () => {
    const printArea = document.getElementById('print-sheet-area');
    if (!printArea) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // एक्टिव पेपर का आस्पेक्ट रेशियो और स्टाइल निकालना
    const paperAspect = currentPaper?.aspect || '4/6';
    const isSingle = activeVariant?.isSingle;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Photo Print</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: 100%;
              height: 100%;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sheet-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            #print-sheet-area {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              aspect-ratio: ${paperAspect} !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            #print-sheet-area > div {
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              padding: ${isBorderless ? '0mm' : '3mm'} !important;
            }
            #print-sheet-area img {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: ${isSingle ? (isBorderless ? 'cover' : 'contain') : 'cover'} !important;
              object-position: center center !important;
              display: block !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div class="sheet-wrapper">
            ${printArea.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 450);
  };

  const toggleSlot = (idx: number) => {
    if (!finalPhoto) return;
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = next[idx] ? null : finalPhoto;
      return next;
    });
  };

  const handleUnitSwitch = (newUnit: MeasurementUnit) => {
    if (newUnit === custUnit) return;
    const factor = newUnit === 'cm' ? 0.1 : 10;
    setCustUnit(newUnit);

    const convert = (valStr: string) => {
      const num = parseFloat(valStr);
      if (isNaN(num)) return '';
      const res = num * factor;
      return newUnit === 'cm' ? res.toFixed(2).replace(/\.?0+$/, '') : Math.round(res).toString();
    };

    setCustTopMarginStr(convert(custTopMarginStr));
    setCustLeftMarginStr(convert(custLeftMarginStr));
    setCustRowGapStr(convert(custRowGapStr));
    setCustColGapStr(convert(custColGapStr));
    setCustCellWStr(convert(custCellWStr));
    setCustCellHStr(convert(custCellHStr));
  };

  const openCustomModal = () => {
    setCustPaperType(paperCat);
    setCustUnit('mm');

    setCustRowsStr(activeVariant.rows.toString());
    setCustColsStr(activeVariant.cols.toString());
    setCustRowGapStr((activeVariant.rowGapMm ?? activeVariant.gapMm).toString());
    setCustColGapStr((activeVariant.colGapMm ?? activeVariant.gapMm).toString());
    setCustTopMarginStr(activeVariant.topMarginMm.toString());
    setCustLeftMarginStr(activeVariant.sideMarginMm.toString());
    setCustCellWStr(activeVariant.cellWidthMm.toString());
    setCustCellHStr(activeVariant.cellHeightMm.toString());

    setCustStyleName(activeVariant.isCustom ? activeVariant.name : `कस्टम ${activeVariant.rows * activeVariant.cols} फ़ोटो`);
    setShowCatalogModal(true);
  };

  const toMm = (valStr: string, fallback: number) => {
    const n = parseFloat(valStr);
    if (isNaN(n) || n < 0) return fallback;
    return custUnit === 'cm' ? n * 10 : n;
  };

  const previewPaperW = paperConfig[custPaperType].paperWidthMm;
  const previewPaperH = paperConfig[custPaperType].paperHeightMm;
  const previewRows = Math.max(1, parseInt(custRowsStr) || 1);
  const previewCols = Math.max(1, parseInt(custColsStr) || 1);
  const previewTopMargin = toMm(custTopMarginStr, 4);
  const previewLeftMargin = toMm(custLeftMarginStr, 4);
  const previewRowGap = toMm(custRowGapStr, 3);
  const previewColGap = toMm(custColGapStr, 3);
  const previewCellW = toMm(custCellWStr, 30);
  const previewCellH = toMm(custCellHStr, 40);

  const totalUsedWidth = previewLeftMargin + previewCols * previewCellW + (previewCols - 1) * previewColGap;
  const totalUsedHeight = previewTopMargin + previewRows * previewCellH + (previewRows - 1) * previewRowGap;

  const isWidthOverflow = totalUsedWidth > previewPaperW;
  const isHeightOverflow = totalUsedHeight > previewPaperH;
  const isAnyOverflow = isWidthOverflow || isHeightOverflow;

  const handleSaveCustomLayout = () => {
    if (isAnyOverflow) return;

    const newId = `custom-${Date.now()}`;
    const newVariant: GridVariant = {
      id: newId,
      name: custStyleName || `${previewRows * previewCols} फ़ोटो`,
      subText: `${previewCellW.toFixed(1)}×${previewCellH.toFixed(1)} mm • कस्टम`,
      rows: previewRows,
      cols: previewCols,
      gapMm: previewColGap,
      rowGapMm: previewRowGap,
      colGapMm: previewColGap,
      topMarginMm: previewTopMargin,
      sideMarginMm: previewLeftMargin,
      cellWidthMm: previewCellW,
      cellHeightMm: previewCellH,
      isCustom: true
    };

    const targetCat = custPaperType;
    const updatedVariants = [...paperConfig[targetCat].variants, newVariant];

    const updatedConfig = {
      ...paperConfig,
      [targetCat]: {
        ...paperConfig[targetCat],
        variants: updatedVariants
      }
    };

    setPaperConfig(updatedConfig);
    setPaperCat(targetCat);
    setActiveVariantId(newId);

    if (finalPhoto) {
      setSlots(Array(newVariant.rows * newVariant.cols).fill(finalPhoto));
    }

    try {
      const toStore: Record<string, GridVariant[]> = {
        '4x6': updatedConfig['4x6'].variants.filter((v) => v.isCustom),
        '5x7': updatedConfig['5x7'].variants.filter((v) => v.isCustom),
        'a4': updatedConfig['a4'].variants.filter((v) => v.isCustom)
      };
      localStorage.setItem('examsewa_custom_layouts', JSON.stringify(toStore));
    } catch (e) {
      console.error(e);
    }

    setShowCatalogModal(false);
  };

  // केवल कस्टम लेआउट को हटाने का सुरक्षित फंक्शन
  const handleDeleteCurrentCustom = () => {
    if (!activeVariant.isCustom) return;

    if (!window.confirm(`क्या आप कस्टम लेआउट "${activeVariant.name}" को हटाना चाहते हैं?`)) {
      return;
    }

    const targetCat = paperCat;
    const remaining = paperConfig[targetCat].variants.filter((v) => v.id !== activeVariant.id);
    const fallbackVariant = remaining[0];

    const updatedConfig = {
      ...paperConfig,
      [targetCat]: {
        ...paperConfig[targetCat],
        variants: remaining
      }
    };

    setPaperConfig(updatedConfig);
    setActiveVariantId(fallbackVariant.id);

    if (finalPhoto) {
      setSlots(Array(fallbackVariant.rows * fallbackVariant.cols).fill(finalPhoto));
    }

    try {
      const toStore: Record<string, GridVariant[]> = {
        '4x6': updatedConfig['4x6'].variants.filter((v) => v.isCustom),
        '5x7': updatedConfig['5x7'].variants.filter((v) => v.isCustom),
        'a4': updatedConfig['a4'].variants.filter((v) => v.isCustom)
      };
      localStorage.setItem('examsewa_custom_layouts', JSON.stringify(toStore));
    } catch (e) {
      console.error(e);
    }

    setShowCatalogModal(false);
  };

  const handleShareSheet = async () => {
    if (!finalPhoto || isSharing) return;
    setIsSharing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = currentPaper.pixelW;
      canvas.height = currentPaper.pixelH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const loadedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = finalPhoto;
      });

      if (activeVariant.isSingle) {
        const borderPadding = isBorderless ? 0 : Math.round(canvas.width * 0.03);
        const drawW = canvas.width - borderPadding * 2;
        const drawH = canvas.height - borderPadding * 2;
        ctx.drawImage(loadedImg, borderPadding, borderPadding, drawW, drawH);
      } else {
        const mmToPx = canvas.width / currentPaper.paperWidthMm;
        const topPx = activeVariant.topMarginMm * mmToPx;
        const sidePx = activeVariant.sideMarginMm * mmToPx;
        const rowGapPx = (activeVariant.rowGapMm ?? activeVariant.gapMm) * mmToPx;
        const colGapPx = (activeVariant.colGapMm ?? activeVariant.gapMm) * mmToPx;

        const cellW = activeVariant.cellWidthMm * mmToPx;
        const cellH = activeVariant.cellHeightMm * mmToPx;

        for (let r = 0; r < activeVariant.rows; r++) {
          for (let c = 0; c < activeVariant.cols; c++) {
            const idx = r * activeVariant.cols + c;
            if (slots[idx]) {
              const x = sidePx + c * (cellW + colGapPx);
              const y = topPx + r * (cellH + rowGapPx);
              ctx.drawImage(loadedImg, x, y, cellW, cellH);
            }
          }
        }
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `examsewa-print-${paperCat}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'ExamSewa Photo Print Sheet',
            text: 'WiFi Printer / Print App के लिए शीट',
            files: [file]
          });
        } else {
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `examsewa-print-${paperCat}.jpg`;
          a.click();
          URL.revokeObjectURL(downloadUrl);
        }
        setIsSharing(false);
      }, 'image/jpeg', 0.98);
    } catch (err) {
      console.error(err);
      setIsSharing(false);
    }
  };

  const currentPaperW = currentPaper.paperWidthMm;
  const currentPaperH = currentPaper.paperHeightMm;
  const currentTopMarginPercent = (activeVariant.topMarginMm / currentPaperH) * 100;
  const currentLeftMarginPercent = (activeVariant.sideMarginMm / currentPaperW) * 100;
  const currentCellWPercent = (activeVariant.cellWidthMm / currentPaperW) * 100;
  const currentCellHPercent = (activeVariant.cellHeightMm / currentPaperH) * 100;
  const currentRowGapPercent = ((activeVariant.rowGapMm ?? activeVariant.gapMm) / currentPaperH) * 100;
  const currentColGapPercent = ((activeVariant.colGapMm ?? activeVariant.gapMm) / currentPaperW) * 100;

  const mainUsedHeightMm =
    activeVariant.topMarginMm +
    activeVariant.rows * activeVariant.cellHeightMm +
    (activeVariant.rows - 1) * (activeVariant.rowGapMm ?? activeVariant.gapMm);
  const remainingBottomMm = Math.max(0, currentPaperH - mainUsedHeightMm);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none">
      <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm text-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-wide">
            ExamSewa - Mr. Photo
          </span>
        </div>

        {step === 'print-sheet' && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setStep('options')}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1 active:scale-95 border border-amber-500/40"
            >
              <span>✏️</span>
              <span>एडिट</span>
            </button>
            <button
              onClick={handleShareSheet}
              disabled={isSharing}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition flex items-center gap-1 active:scale-95"
            >
              {isSharing ? '⌛' : '🔗'} शेयर
            </button>
            <button
              onClick={handleDirectPrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition flex items-center gap-1 active:scale-95"
            >
              🖨️ प्रिंट
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-2 sm:p-4 lg:p-6 w-full">
        {step === 'upload' && (
          <div className="w-full max-w-sm my-auto bg-white border border-slate-200 p-6 rounded-2xl shadow-lg text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
              📸
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">पासपोर्ट फोटो चुनें</h2>
            <p className="text-xs text-slate-600 mb-6">प्रिंट शीट तैयार करने के लिए फ़ोटो अपलोड करें</p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => galleryRef.current?.click()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                📁 गैलरी से फोटो चुनें
              </button>
              <button
                onClick={() => cameraRef.current?.click()}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                📷 कैमरे से फोटो खींचें
              </button>
            </div>

            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
            />
          </div>
        )}

        {/* ऑप्शन्स विंडो */}
        {step === 'options' && rawPhoto && (
          <div className="w-full max-w-2xl bg-[#c0c0c0] text-black border-2 border-[#dfdfdf] shadow-2xl rounded p-3 sm:p-5 font-sans">
            <div className="text-xs font-bold text-slate-700 mb-3 border-b border-slate-400 pb-1 flex justify-between">
              <span>ExamSewa - Cell Options</span>
              <button
                onClick={() => setStep('upload')}
                className="text-red-700 font-bold hover:underline cursor-pointer"
              >
                ✕ बंद करें
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col items-center justify-center bg-white border border-slate-500 p-3 shadow-inner min-w-[220px]">
                <div
                  className={`w-44 h-56 bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                    hasOutline ? 'border-2 border-black' : 'border border-dashed border-slate-300'
                  }`}
                >
                  <img
                    src={rawPhoto}
                    alt="preview"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${fitMode === 'adjust' ? zoomScale / 100 : 1})`,
                      filter: getFilterStyle(colorEffect),
                      objectFit: fitMode === 'trim' ? 'cover' : 'contain'
                    }}
                    className="w-full h-full pointer-events-none transition-all duration-150"
                  />
                  {(hasTitle || hasDate) && (
                    <div className="absolute bottom-1 left-1 right-1 bg-white/95 px-1 py-0.5 text-center leading-tight border-t border-slate-300">
                      {hasTitle && <div className="text-[10px] font-bold text-black">{titleText}</div>}
                      {hasDate && <div className="text-[9px] text-black">{dateText}</div>}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 mt-2 font-mono">
                  Cell: 35 × 45 mm (HD Preview)
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3 text-xs">
                <fieldset className="border border-slate-500 p-2.5 rounded">
                  <legend className="px-1 font-bold text-slate-800">Size in the Cell (साइज़ सेटिंग)</legend>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-white/40 p-1.5 rounded">
                      <input
                        type="radio"
                        name="fitMode"
                        checked={fitMode === 'trim'}
                        onChange={() => setFitMode('trim')}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Fit the Cell (Trimming) — पूरा डिब्बा भरें</span>
                        <span className="text-[10px] text-slate-600">डिब्बा 100% भरेगा, कोई खाली जगह नहीं छूटेगी (अनुशंसित)</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-white/40 p-1.5 rounded">
                      <input
                        type="radio"
                        name="fitMode"
                        checked={fitMode === 'no-trim'}
                        onChange={() => setFitMode('no-trim')}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Fit the Cell (No Trimming) — पूरी फ़ोटो दिखाएँ</span>
                        <span className="text-[10px] text-slate-600">फ़ोटो का कुछ भी नहीं कटेगा, पूरी तस्वीर सुरक्षित रहेगी</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-white/40 p-1.5 rounded">
                      <input
                        type="radio"
                        name="fitMode"
                        checked={fitMode === 'adjust'}
                        onChange={() => setFitMode('adjust')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block">Adjust (कस्टम ज़ूम)</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="20"
                            max="200"
                            value={zoomScale}
                            disabled={fitMode !== 'adjust'}
                            onChange={(e) => setZoomScale(Number(e.target.value))}
                            className="flex-1 cursor-pointer"
                          />
                          <span className="w-10 text-right font-mono font-bold text-blue-800">{zoomScale}%</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <fieldset className="border border-slate-500 p-2.5 rounded flex items-center justify-between">
                  <legend className="px-1 font-bold text-slate-800">Orientation</legend>
                  <div className="flex gap-2 w-full justify-around">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-600 rounded font-bold cursor-pointer"
                    >
                      ↩ 90° बाएँ
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 180) % 360)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-600 rounded font-bold cursor-pointer"
                    >
                      ↷ 180°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-600 rounded font-bold cursor-pointer"
                    >
                      ↪ 90° दाएँ
                    </button>
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 gap-2">
                  <fieldset className="border border-slate-500 p-2 rounded">
                    <legend className="px-1 font-bold text-slate-800">Text and Outline</legend>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasTitle}
                          onChange={(e) => setHasTitle(e.target.checked)}
                        />
                        Title
                      </label>
                      {hasTitle && (
                        <input
                          type="text"
                          value={titleText}
                          onChange={(e) => setTitleText(e.target.value)}
                          placeholder="नाम लिखें"
                          className="w-full bg-white border border-slate-500 px-1.5 py-0.5 rounded text-[11px]"
                        />
                      )}

                      <label className="flex items-center gap-1.5 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={hasDate}
                          onChange={(e) => setHasDate(e.target.checked)}
                        />
                        Date
                      </label>
                      {hasDate && (
                        <input
                          type="text"
                          value={dateText}
                          onChange={(e) => setDateText(e.target.value)}
                          placeholder="तारीख लिखें"
                          className="w-full bg-white border border-slate-500 px-1.5 py-0.5 rounded text-[11px]"
                        />
                      )}

                      <label className="flex items-center gap-1.5 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={hasOutline}
                          onChange={(e) => setHasOutline(e.target.checked)}
                        />
                        Outline (1px बॉर्डर)
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="border border-slate-500 p-2 rounded">
                    <legend className="px-1 font-bold text-slate-800">Color Filter</legend>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="colorEffect"
                          checked={colorEffect === 'original'}
                          onChange={() => setColorEffect('original')}
                        />
                        <span>Original</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="colorEffect"
                          checked={colorEffect === 'bw'}
                          onChange={() => setColorEffect('bw')}
                        />
                        <span>Black and White</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="colorEffect"
                          checked={colorEffect === 'bright'}
                          onChange={() => setColorEffect('bright')}
                        />
                        <span>Bright and Clear</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="colorEffect"
                          checked={colorEffect === 'studio'}
                          onChange={() => setColorEffect('studio')}
                        />
                        <span>Studio Tone</span>
                      </label>
                    </div>
                  </fieldset>
                </div>

                <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-slate-400">
                  <button
                    type="button"
                    onClick={handleApplyOptions}
                    className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded shadow cursor-pointer text-sm"
                  >
                    OK (प्रिंट शीट पर भेजें)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold rounded cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* मुख्य प्रिंट शीट स्क्रीन */}
        {step === 'print-sheet' && finalPhoto && (
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* बायाँ भाग: प्रीव्यू (2/3) */}
            <div className="w-full lg:col-span-8 flex flex-col items-center">
            <div className="sticky top-[49px] z-40 w-full bg-white border border-slate-200 backdrop-blur-md pt-1 pb-2.5 px-1 border-b border-slate-800/80 shadow-2xl flex flex-col items-center">
              <div className="flex items-center justify-between w-full px-2 mb-1.5 text-[11px]">
                <span className="text-emerald-700 font-semibold">
                  {activeVariant.isSingle
                    ? '👉 सिंगल फ़ोटो लेआउट (फुल पेज)'
                    : '👉 डिब्बे पर टैप करके फ़ोटो भरें या खाली करें'}
                </span>
                <span className="text-slate-600 font-mono font-medium">
                  {slots.filter(Boolean).length} / {totalSlots} फ़ोटो
                </span>
              </div>

              <div
                id="print-sheet-area"
                className="bg-white shadow-2xl border-2 border-slate-400 transition-all rounded-xs overflow-hidden relative h-[280px] sm:h-[340px] lg:h-[580px] max-w-full"
                style={{
                  
                  aspectRatio: currentPaper.aspect
                }}
              >
                {activeVariant.isSingle ? (
                  <div
                    onClick={() => toggleSlot(0)}
                    className="w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
                    style={{
                      padding: isBorderless ? '0px' : '5mm'
                    }}
                  >
                    {slots[0] && (
                      <img
                        src={slots[0]}
                        alt="single"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                  </div>
                ) : (
                  Array.from({ length: activeVariant.rows }).map((_, rIdx) => {
                    const topPercent = currentTopMarginPercent + rIdx * (currentCellHPercent + currentRowGapPercent);

                    return Array.from({ length: activeVariant.cols }).map((_, cIdx) => {
                      const leftPercent = currentLeftMarginPercent + cIdx * (currentCellWPercent + currentColGapPercent);
                      const idx = rIdx * activeVariant.cols + cIdx;
                      const img = slots[idx];

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          onClick={() => toggleSlot(idx)}
                          style={{
                            position: 'absolute',
                            top: `${topPercent}%`,
                            left: `${leftPercent}%`,
                            width: `${currentCellWPercent}%`,
                            height: `${currentCellHPercent}%`
                          }}
                          className={`flex items-center justify-center cursor-pointer overflow-hidden transition-all ${
                            !img
                              ? 'border border-dashed border-slate-400 bg-slate-50 hover:bg-blue-50'
                              : 'border border-slate-200 bg-slate-100 shadow-2xs'
                          }`}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt="slot"
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-600 font-mono font-medium">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                      );
                    });
                  })
                )}
              </div>

              {!activeVariant.isSingle && remainingBottomMm > 0.5 && (
                <div className="text-[10px] text-slate-600 mt-1 font-mono font-medium">
                  नीचे कटिंग के लिए खाली पेपर: {remainingBottomMm.toFixed(1)} mm
                </div>
              )}
            </div>

            {/* बॉटम कंट्रोल सेक्शन */}
            </div>

            {/* दायाँ भाग: टूल्स और सेटिंग्स (1/3) */}
            <div className="w-full lg:col-span-4 lg:sticky lg:top-20 bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-md text-slate-800 flex flex-col gap-3 mt-4 lg:mt-0">
              {activeVariant.isSingle && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-900">🔲 फुल 4×6 बॉर्डरलेस फिट</span>
                    <span className="text-[10px] text-blue-600">बिना सफ़ेद किनारी के पूरे पेपर पर फ़िट करें</span>
                  </div>
                  <button
                    onClick={() => setIsBorderless(!isBorderless)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                      isBorderless
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-700 border border-blue-300'
                    }`}
                  >
                    {isBorderless ? '✓ बॉर्डरलेस चालू' : 'बॉर्डरलेस करें'}
                  </button>
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  1. पेपर साइज़:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['4x6', '5x7', 'a4'] as PaperCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        paperCat === cat
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/30'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-400'
                      }`}
                    >
                      {paperConfig[cat].title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  2. {currentPaper.title} में लेआउट:
                </span>
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(currentPaper.variants.length, 4)}, minmax(0, 1fr))`
                  }}
                >
                  {currentPaper.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantChange(v)}
                      className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                        activeVariantId === v.id
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span className="text-[11px] font-bold leading-tight truncate w-full px-1">{v.name}</span>
                      <span className="text-[9px] opacity-80 mt-0.5 leading-tight truncate w-full px-1">{v.subText}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeVariant.isSingle && (
                <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-white">बॉर्डर स्टाइल</span>
                    <span className="text-[10px] text-slate-400">
                      {isBorderless ? 'फुल पेपर (बॉर्डरलेस प्रिंट)' : 'चारों तरफ 5mm सफ़ेद बॉर्डर'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBorderless(!isBorderless)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      isBorderless
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 text-slate-200 border border-slate-600'
                    }`}
                  >
                    {isBorderless ? 'बॉर्डरलेस' : 'विद बॉर्डर'}
                  </button>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSlots(Array(totalSlots).fill(finalPhoto))}
                  className="text-xs bg-white hover:bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg border-2 border-slate-800 cursor-pointer font-bold shadow-xs"
                >
                  ▦ पूरी शीट भरें ({totalSlots})
                </button>
                <button
                  onClick={() => setSlots(Array(totalSlots).fill(null))}
                  className="text-xs bg-white hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border-2 border-red-500 cursor-pointer font-bold shadow-xs"
                >
                  🗑️ खाली करें
                </button>
              </div>

              <button
                onClick={openCustomModal}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition"
              >
                <span>✨</span>
                <span>मनपसंद साइज़ बनाएं (कस्टम कैटलॉग)</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Presto! PrintFun Catalog स्टाइल कस्टम लेआउट मोडल (Delete बटन सहित) */}
        {showCatalogModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#c0c0c0] text-black border-2 border-[#dfdfdf] shadow-2xl rounded p-3 font-sans">
              <div className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-400 pb-1 flex justify-between items-center">
                <span>ExamSewa - PrintFun</span>
                <button
                  onClick={() => setShowCatalogModal(false)}
                  className="text-red-700 font-bold hover:underline cursor-pointer text-xs"
                >
                  ✕ बंद करें
                </button>
              </div>

              <div className="flex gap-2 items-end mb-2.5">
                <div className="w-2/3">
                  <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Style Name:</label>
                  <input
                    type="text"
                    value={custStyleName}
                    onChange={(e) => setCustStyleName(e.target.value)}
                    className="w-full bg-white border border-slate-500 px-2 py-1 rounded text-xs font-semibold"
                    placeholder="स्टाइल का नाम लिखें"
                  />
                </div>

                <div className="w-1/3">
                  <fieldset className="border border-slate-500 px-2 py-0.5 rounded bg-slate-200/60">
                    <legend className="px-1 font-bold text-[10px] text-slate-800">Unit (इकाई)</legend>
                    <div className="flex items-center justify-around gap-2 h-7">
                      <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                        <input
                          type="radio"
                          name="custUnit"
                          checked={custUnit === 'mm'}
                          onChange={() => handleUnitSwitch('mm')}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>mm</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                        <input
                          type="radio"
                          name="custUnit"
                          checked={custUnit === 'cm'}
                          onChange={() => handleUnitSwitch('cm')}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>cm</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-[#0b6623] p-3 rounded flex flex-col items-center justify-center min-h-[300px] shadow-inner relative overflow-hidden">
                  <div
                    className="bg-white shadow-2xl relative transition-all overflow-hidden border border-slate-400"
                    style={{
                      width: '180px',
                      height: `${(previewPaperH / previewPaperW) * 180}px`,
                      maxHeight: '270px'
                    }}
                  >
                    {Array.from({ length: previewRows }).map((_, rIdx) => {
                      const topPercent = ((previewTopMargin + rIdx * (previewCellH + previewRowGap)) / previewPaperH) * 100;
                      const heightPercent = (previewCellH / previewPaperH) * 100;

                      return Array.from({ length: previewCols }).map((_, cIdx) => {
                        const leftPercent = ((previewLeftMargin + cIdx * (previewCellW + previewColGap)) / previewPaperW) * 100;
                        const widthPercent = (previewCellW / previewPaperW) * 100;

                        const isCellOverflow =
                          leftPercent + widthPercent > 100.2 || topPercent + heightPercent > 100.2;

                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            style={{
                              position: 'absolute',
                              top: `${topPercent}%`,
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              height: `${heightPercent}%`
                            }}
                            className={`flex items-center justify-center text-[7px] font-mono transition-all ${
                              isCellOverflow
                                ? 'bg-red-500/80 border-2 border-red-700 text-white font-bold animate-pulse'
                                : 'bg-slate-50 border border-slate-400 text-slate-600'
                            }`}
                          >
                            {rIdx * previewCols + cIdx + 1}
                          </div>
                        );
                      });
                    })}
                  </div>

                  <div className="mt-2 text-center w-full">
                    {isAnyOverflow ? (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        ⚠️ फ़ोटो पेपर साइज़ से बाहर निकल रही है!
                      </span>
                    ) : (
                      <span className="text-white/90 text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded">
                        नीचे बचा पेपर: {(previewPaperH - totalUsedHeight).toFixed(1)} mm
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-72 flex flex-col gap-2 text-xs">
                  <fieldset className="border border-slate-500 p-2 rounded bg-slate-200/60">
                    <legend className="px-1 font-bold text-[11px] text-slate-800">Paper (कागज़)</legend>
                    <div className="flex gap-2 mb-1.5">
                      {(['4x6', '5x7', 'a4'] as PaperCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCustPaperType(cat);
                          }}
                          className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            custPaperType === cat ? 'bg-blue-700 text-white' : 'bg-slate-300 text-black'
                          }`}
                        >
                          {paperConfig[cat].title}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span>Top Margin:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custTopMarginStr}
                            onChange={(e) => setCustTopMarginStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                      <div>
                        <span>Left Margin:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custLeftMarginStr}
                            onChange={(e) => setCustLeftMarginStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border border-slate-500 p-2 rounded bg-slate-200/60">
                    <legend className="px-1 font-bold text-[11px] text-slate-800">Layout (कॉलम व रो)</legend>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span>Total Row:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={custRowsStr}
                          onChange={(e) => setCustRowsStr(e.target.value)}
                          placeholder="रो"
                          className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs mt-0.5 font-bold"
                        />
                      </div>
                      <div>
                        <span>Total Column:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={custColsStr}
                          onChange={(e) => setCustColsStr(e.target.value)}
                          placeholder="कॉलम"
                          className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs mt-0.5 font-bold"
                        />
                      </div>
                      <div>
                        <span>Row Gap:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custRowGapStr}
                            onChange={(e) => setCustRowGapStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                      <div>
                        <span>Column Gap:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custColGapStr}
                            onChange={(e) => setCustColGapStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border border-slate-500 p-2 rounded bg-slate-200/60">
                    <legend className="px-1 font-bold text-[11px] text-slate-800">Cell (फ़ोटो साइज़)</legend>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span>Cell Width:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custCellWStr}
                            onChange={(e) => setCustCellWStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                      <div>
                        <span>Cell Height:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={custCellHStr}
                            onChange={(e) => setCustCellHStr(e.target.value)}
                            className="w-full bg-white border border-slate-500 px-1 py-0.5 rounded text-xs"
                          />
                          <span className="text-[10px] font-bold">{custUnit}</span>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* एक्शन्स: Delete, Cancel, Save */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-400 mt-1">
                    {/* Delete बटन: केवल कस्टम लेआउट होने पर सक्रिय होगा */}
                    <button
                      type="button"
                      disabled={!activeVariant.isCustom}
                      onClick={handleDeleteCurrentCustom}
                      title={activeVariant.isCustom ? "इस कस्टम लेआउट को हमेशा के लिए हटाएं" : "डिफ़ॉल्ट सिस्टम लेआउट डिलीट नहीं किए जा सकते"}
                      className={`px-3 py-1.5 rounded font-bold text-xs transition ${
                        activeVariant.isCustom
                          ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer active:scale-95'
                          : 'bg-slate-300 text-slate-400 border border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Delete (हटाएं)
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCatalogModal(false)}
                        className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold rounded cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isAnyOverflow}
                        onClick={handleSaveCustomLayout}
                        className={`px-4 py-1.5 font-bold rounded shadow text-xs transition ${
                          isAnyOverflow
                            ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                            : 'bg-blue-700 hover:bg-blue-600 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        Save & OK (जोड़ें)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

            
    </div>
  );
}
