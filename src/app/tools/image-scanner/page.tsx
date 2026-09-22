"use client";

import React from "react";
import Link from "next/link";

export default function ImageScannerPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-3">इमेज स्कैनर टूल</h1>
        <p className="text-slate-600 text-sm mb-6">टूल जल्द ही अपडेट किया जाएगा।</p>
        <Link 
          href="/" 
          className="inline-block px-5 py-2.5 bg-blue-900 text-white text-sm font-semibold rounded-xl hover:bg-blue-800"
        >
          होमपेज पर वापस जाएँ
        </Link>
      </div>
    </main>
  );
}
