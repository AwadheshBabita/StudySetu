import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-10 px-4 text-slate-600">
      <div className="max-w-6xl mx-auto space-y-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Exam<span className="text-blue-600">Sewa</span>
            </span>
            <p className="text-xs text-slate-500 mt-1">
              छात्रों और साइबर कैफ़े के लिए 100% सुरक्षित और तेज़ ऑनलाइन डॉक्यूमेंट टूल्स
            </p>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
            <Link href="/about" className="hover:text-blue-600 transition">About Us</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
            <Link href="/privacy-policy" className="hover:text-blue-600 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-blue-600 transition">Disclaimer</Link>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} ExamSewa. सर्वाधिकार सुरक्षित। यह एक स्वतंत्र शैक्षणिक सहायक प्लेटफ़ॉर्म है।</p>
          <p>सहायता हेतु: <span className="font-mono text-slate-600">examsewa.official@gmail.com</span></p>
        </div>
      </div>
    </footer>
  );
}
