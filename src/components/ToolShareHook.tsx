'use client';

import React from 'react';

interface ToolShareHookProps {
  toolName?: string;
}

export default function ToolShareHook({ toolName = "सरकारी फॉर्म टूल" }: ToolShareHookProps) {
  const shareText = encodeURIComponent(
    `सरकारी नौकरी व फॉर्म के लिए 100% मुफ़्त टूल (${toolName}) — फ़ोटो, साइन और A4 डॉक स्कैनर बिना किसी विज्ञापन के: https://examsewa.online`
  );

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-[11px] text-slate-500 font-medium">काम आसान हुआ? दोस्तों की मदद करें:</span>
      <a
        href={`https://api.whatsapp.com/send?text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
      >
        <span>💬</span> WhatsApp पर शेयर करें
      </a>
    </div>
  );
}
