'use client';

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { examCategories } from '@/data/exam-categories';
import {
  examRequirements,
  ExamRequirement,
  FileRequirement,
} from '@/data/exam-requirements';

type CheckItem = {
  status: 'pass' | 'fail';
  title: string;
  currentValue: string;
  expectedValue: string;
  type: 'size' | 'dimension' | 'format';
};

type GroupedResults = {
  photoResults: CheckItem[];
  signatureResults: CheckItem[];
};

async function getImageDimensions(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image();

        image.onload = () =>
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });

        image.onerror = () => reject(new Error('इमेज पढ़ने में असमर्थ।'));
        image.src = url;
      }
    );

    return dimensions;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function verifyFile(
  file: File,
  dimensions: { width: number; height: number } | null,
  requirement?: FileRequirement
): CheckItem[] {
  if (!requirement) return [];

  const items: CheckItem[] = [];
  const extension = file.name.split('.').pop()?.toUpperCase() || '';
  const sizeKb = file.size / 1024;

  if (requirement.formats.length > 0) {
    const isFormatOk = requirement.formats.includes(extension);
    items.push({
      status: isFormatOk ? 'pass' : 'fail',
      title: 'फ़ाइल फ़ॉर्मेट',
      currentValue: extension || 'अज्ञात',
      expectedValue: requirement.formats.join(', '),
      type: 'format',
    });
  }

  const minK = requirement.minKb || 0;
  const maxK = requirement.maxKb || 99999;
  const isSizeOk = sizeKb >= minK && sizeKb <= maxK;

  items.push({
    status: isSizeOk ? 'pass' : 'fail',
    title: 'फ़ाइल साइज़',
    currentValue: `${sizeKb.toFixed(1)} KB`,
    expectedValue: `${requirement.minKb || 0} KB से ${requirement.maxKb} KB`,
    type: 'size',
  });

  if (dimensions && (requirement.minWidth || requirement.maxWidth)) {
    const minW = requirement.minWidth || 0;
    const maxW = requirement.maxWidth || 99999;
    const isWidthOk = dimensions.width >= minW && dimensions.width <= maxW;

    items.push({
      status: isWidthOk ? 'pass' : 'fail',
      title: 'चौड़ाई (Width)',
      currentValue: `${dimensions.width} px`,
      expectedValue:
        requirement.minWidth && requirement.maxWidth
          ? `${requirement.minWidth} से ${requirement.maxWidth} px`
          : `अधिकतम ${requirement.maxWidth} px`,
      type: 'dimension',
    });
  }

  if (dimensions && (requirement.minHeight || requirement.maxHeight)) {
    const minH = requirement.minHeight || 0;
    const maxH = requirement.maxHeight || 99999;
    const isHeightOk = dimensions.height >= minH && dimensions.height <= maxH;

    items.push({
      status: isHeightOk ? 'pass' : 'fail',
      title: 'ऊंचाई (Height)',
      currentValue: `${dimensions.height} px`,
      expectedValue:
        requirement.minHeight && requirement.maxHeight
          ? `${requirement.minHeight} से ${requirement.maxHeight} px`
          : `अधिकतम ${requirement.maxHeight} px`,
      type: 'dimension',
    });
  }

  return items;
}

export default function ExamRequirementsPage() {
  const [selectedExam, setSelectedExam] = useState<ExamRequirement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredExams = selectedCategory
    ? examRequirements.filter(
        (exam) => exam.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    : [];

  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [results, setResults] = useState<GroupedResults | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedExam(null);
    setResults(null);
    setPhoto(null);
    setSignature(null);
  };

  const handleExamChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const exam = examRequirements.find((item) => item.id === e.target.value) || null;
    setSelectedExam(exam);
    setResults(null);
    setPhoto(null);
    setSignature(null);
  };

  const handleCheck = async () => {
    if (!selectedExam) return;

    setChecking(true);
    setResults(null);

    let photoItems: CheckItem[] = [];
    let sigItems: CheckItem[] = [];

    if (photo && selectedExam.photo) {
      try {
        const dim = await getImageDimensions(photo);
        photoItems = verifyFile(photo, dim, selectedExam.photo);
      } catch {
        photoItems = [
          {
            status: 'fail',
            title: 'रीडिंग एरर',
            currentValue: 'खराब फ़ाइल',
            expectedValue: 'वैध इमेज फ़ाइल',
            type: 'dimension',
          },
        ];
      }
    }

    if (signature && selectedExam.signature) {
      try {
        const dim = await getImageDimensions(signature);
        sigItems = verifyFile(signature, dim, selectedExam.signature);
      } catch {
        sigItems = [
          {
            status: 'fail',
            title: 'रीडिंग एरर',
            currentValue: 'खराब फ़ाइल',
            expectedValue: 'वैध इमेज फ़ाइल',
            type: 'dimension',
          },
        ];
      }
    }

    setResults({
      photoResults: photoItems,
      signatureResults: sigItems,
    });
    setChecking(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 lg:px-8 text-slate-800">
      <div className="mx-auto max-w-4xl">
        {/* मुख्य कार्ड */}
        <div className="rounded-2xl border border-slate-300 bg-white shadow-lg overflow-hidden">
          {/* हेडर */}
          <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div>
                <h1 className="font-bold text-sm sm:text-base tracking-wide leading-none">
                  Exam Requirements Checker
                </h1>
                <p className="text-[10px] text-slate-300 mt-0.5 hidden sm:block">
                  सरकारी परीक्षाओं के मानकों अनुसार फ़ोटो व हस्ताक्षर सत्यापन टूल
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-xs bg-slate-700/90 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition-colors font-medium"
            >
              ← होम
            </Link>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* शीर्ष सूचना व गाइड पट्टी */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-900 leading-relaxed shadow-2xs">
                <p className="font-bold flex items-center gap-1 mb-0.5">
                  <span>⚠️</span> महत्वपूर्ण सूचना (Important Note):
                </p>
                सरकारी आयोग समय-समय पर फ़ोटो/साइन के मानकों में संशोधन करते रहते हैं। यहाँ दिए गए नियम प्रचलित दिशानिर्देशों पर आधारित हैं। अंतिम आवेदन से पूर्व आधिकारिक विज्ञप्ति से मिलान अवश्य करें।
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <p className="text-[11px] font-semibold text-blue-950 leading-tight">
                    विभिन्न राज्यों के परीक्षा नियम व गाइडलाइन विस्तार से पढ़ना चाहते हैं?
                  </p>
                </div>
                <Link
                  href="/tools/exam-guide"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  गाइड देखें →
                </Link>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 🌟 चयन ग्रिड: मोबाइल पर एक के नीचे एक, कंप्यूटर पर आमने-सामने 🌟 */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* 1. Category चयन */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  1. परीक्षा श्रेणी चुनें (Category)
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  <option value="">श्रेणी चुनें (Teaching, Police, SSC, Railway...)</option>
                  {examCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Exam चयन */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  2. परीक्षा चुनें (Exam)
                </label>
                <select
                  value={selectedExam?.id || ''}
                  onChange={handleExamChange}
                  disabled={!selectedCategory}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 shadow-2xs"
                >
                  <option value="">परीक्षा चुनें</option>
                  {filteredExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.exam}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ============================================================== */}
            {/* चयनित परीक्षा के आधिकारिक नियम कार्ड (परीक्षा चुनने पर ही दिखेगा) */}
            {/* ============================================================== */}
            {selectedExam && (
              <div className="rounded-xl border-2 border-blue-100 bg-blue-50/60 p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-blue-200/80 pb-2.5">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                      <span>📌</span> {selectedExam.exam} - आधिकारिक मानक
                    </span>
                    {selectedExam.lastVerified && (
                      <span className="text-[10px] text-blue-700 block mt-0.5">
                        🗓️ समीक्षा तिथि: <b>{selectedExam.lastVerified}</b>
                      </span>
                    )}
                  </div>
                  {selectedExam.source && (
                    <a
                      href={selectedExam.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10.5px] bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      आधिकारिक वेबसाइट ↗
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedExam.photo && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-1 shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>📷</span> फ़ोटो मानक:
                      </p>
                      <div className="text-[10.5px] text-slate-600 space-y-0.5">
                        <p>
                          • <b>साइज़:</b> {selectedExam.photo.minKb || 20} KB से{' '}
                          {selectedExam.photo.maxKb} KB
                        </p>
                        {selectedExam.photo.maxWidth && (
                          <p>
                            • <b>डायमेंशन:</b> अधिकतम {selectedExam.photo.maxWidth}×
                            {selectedExam.photo.maxHeight} px
                          </p>
                        )}
                        <p>• <b>फॉर्मेट:</b> {selectedExam.photo.formats.join(', ')}</p>
                      </div>
                    </div>
                  )}

                  {selectedExam.signature && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-1 shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>✍️</span> हस्ताक्षर मानक:
                      </p>
                      <div className="text-[10.5px] text-slate-600 space-y-0.5">
                        <p>
                          • <b>साइज़:</b> {selectedExam.signature.minKb || 5} KB से{' '}
                          {selectedExam.signature.maxKb} KB
                        </p>
                        {selectedExam.signature.maxWidth && (
                          <p>
                            • <b>डायमेंशन:</b> अधिकतम{' '}
                            {selectedExam.signature.maxWidth}×
                            {selectedExam.signature.maxHeight} px
                          </p>
                        )}
                        <p>• <b>फॉर्मेट:</b> {selectedExam.signature.formats.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedExam.notes && selectedExam.notes.length > 0 && (
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-[10.5px] text-amber-900">
                    <p className="font-bold mb-0.5">⚠️ ध्यान दें:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {selectedExam.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. फ़ाइल अपलोड व जाँच सेक्शन */}
            {/* ============================================================== */}
            {selectedExam && (
              <div className="space-y-3.5 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="block text-xs font-bold text-slate-700">
                  3. अपनी फ़ाइल अपलोड करके जांचें (Verify Files)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      फ़ोटो (Photo) चुनें:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700 cursor-pointer bg-white p-1 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      हस्ताक्षर (Signature) चुनें:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSignature(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700 cursor-pointer bg-white p-1 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={checking || (!photo && !signature)}
                  className="w-full mt-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] py-2.5 text-xs font-bold text-white shadow transition-all disabled:opacity-50"
                >
                  {checking ? 'जांच हो रही है...' : '🔍 नियम अनुसार फाइल जांचें'}
                </button>
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. अलग-अलग (PHOTO vs SIGNATURE) स्पष्ट जांच परिणाम */}
            {/* ============================================================== */}
            {results && (
              <div className="space-y-3.5">
                {/* 1. फोटो परिणाम */}
                {photo && results.photoResults.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>📷</span> फ़ोटो जाँच रिपोर्ट (Photo Report)
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                        {photo.name}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.photoResults.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            item.status === 'pass'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-red-50 border-red-200 text-red-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold mr-1">
                              {item.status === 'pass' ? '✓' : '✗'} {item.title}:
                            </span>
                            <span>
                              आपकी फ़ाइल = <b>{item.currentValue}</b>
                            </span>
                          </div>
                          <div className="text-[10.5px] font-semibold text-right">
                            {item.status === 'pass' ? (
                              <span className="text-emerald-700">मान्य (OK)</span>
                            ) : (
                              <span className="text-red-700">
                                होना चाहिए: {item.expectedValue}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {results.photoResults.some((r) => r.status === 'fail') && (
                      <div className="pt-2 flex gap-2">
                        <Link
                          href="/tools/exact-kb-compressor"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10.5px] text-center"
                        >
                          ⚡ फ़ोटो साइज़ (KB) ठीक करें
                        </Link>
                        <Link
                          href="/tools/exact-pixel-resize"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10.5px] text-center"
                        >
                          📐 फ़ोटो पिक्सेल ठीक करें
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. सिग्नेचर परिणाम */}
                {signature && results.signatureResults.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>✍️</span> हस्ताक्षर जाँच रिपोर्ट (Signature Report)
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                        {signature.name}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {results.signatureResults.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            item.status === 'pass'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-red-50 border-red-200 text-red-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold mr-1">
                              {item.status === 'pass' ? '✓' : '✗'} {item.title}:
                            </span>
                            <span>
                              आपकी फ़ाइल = <b>{item.currentValue}</b>
                            </span>
                          </div>
                          <div className="text-[10.5px] font-semibold text-right">
                            {item.status === 'pass' ? (
                              <span className="text-emerald-700">मान्य (OK)</span>
                            ) : (
                              <span className="text-red-700">
                                होना चाहिए: {item.expectedValue}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {results.signatureResults.some((r) => r.status === 'fail') && (
                      <div className="pt-2 flex gap-2">
                        <Link
                          href="/tools/signature-resize"
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-2 rounded-lg text-[10.5px] text-center"
                        >
                          ✍️ सिग्नेचर रिसाइज़र व क्रॉपर पर जाएँ
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* वैकल्पिक कस्टम टूल्स बॉक्स (नीचे सेट) */}
            {/* ============================================================== */}
            <div className="rounded-xl border border-dashed border-slate-300 p-3.5 bg-slate-50 text-[11px] text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">
                🛠️ क्या आपकी परीक्षा का साइज़ यहाँ अलग है?
              </p>
              <p className="text-[10.5px]">
                अधिसूचना में दिए गए विशेष साइज़ को हमारे कस्टम टूल्स से सीधे तैयार करें:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/tools/exact-kb-compressor"
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold text-[10.5px]"
                >
                  ⚡ Exact KB Compressor
                </Link>
                <Link
                  href="/tools/exact-pixel-resize"
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold text-[10.5px]"
                >
                  📐 Exact Pixel Resizer
                </Link>
                <Link
                  href="/tools/image-format-converter"
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold text-[10.5px]"
                >
                  🔄 Format Converter
                </Link>
              </div>
            </div>

            {/* Evergreen FAQ Section */}
            <section className="mt-8 border-t border-slate-200 pt-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q1. क्या सभी परीक्षाओं के नियम समान होते हैं?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    नहीं। विभिन्न भर्ती बोर्डों (SSC, Railway, Police, Teaching) के नियम अलग-अलग होते हैं और नई अधिसूचना के साथ बदल सकते हैं।
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q2. अधिसूचना में अलग साइज़ होने पर क्या करें?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    आप हमारे <Link href="/tools/exact-kb-compressor" className="text-blue-600 underline font-semibold">Exact KB Compressor</Link> और <Link href="/tools/exact-pixel-resize" className="text-blue-600 underline font-semibold">Pixel Resizer</Link> से कोई भी साइज़ मैन्युअली बना सकते हैं।
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Q3. क्या मेरा डेटा सुरक्षित है?
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                    हाँ, फ़ाइल सत्यापन की संपूर्ण प्रक्रिया आपके ब्राउज़र में ही संपन्न होती है। कोई भी फ़ाइल सर्वर पर अपलोड नहीं की जाती।
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
