'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xl font-black text-white">
              Exam Sewa (एग्जाम सेवा)
            </span>
            <p className="text-sm text-slate-400 max-w-sm">
              प्रतियोगी परीक्षाओं, ऑनलाइन फॉर्म और पढ़ाई के लिए 100% मुफ़्त और सुरक्षित इन-ब्राउज़र टूल्स। आपका कोई भी डेटा सर्वर पर स्टोर नहीं होता।
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Exam Sewa. सर्वाधिकार सुरक्षित।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">त्वरित लिंक</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">होम (Home)</Link></li>
              <li><Link href="/calculators" className="hover:text-white transition">छात्र कैलकुलेटर</Link></li>
              <li><Link href="/poster" className="hover:text-white transition">पोस्टर व शेयर (QR Code)</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">महत्वपूर्ण नीतियां</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white transition">गोपनीयता नीति (Privacy Policy)</Link></li>
              <li><Link href="/about" className="hover:text-white transition">हमारे बारे में (About Us)</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">संपर्क सूत्र (Contact Us)</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
