with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_buttons_block = """          {/* 7. डाउनलोड सेक्शन */}
          <div className="pt-2 border-t-2 border-slate-300 space-y-1.5">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block text-center">
              आउटपुट डाउनलोड व शेयर
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDownload('jpg')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖼️</span>
                <span>JPG</span>
              </button>

              <button
                onClick={() => handleDownload('pdf')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>📄</span>
                <span>PDF</span>
              </button>

              <button
                onClick={handleShare}
                disabled={(!frontCropped && !backCropped) || isSharing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🔗</span>
                <span>शेयर करें</span>
              </button>
            </div>
          </div>"""

new_buttons_block = """          {/* 7. डाउनलोड सेक्शन (प्रत्येक बटन पूरी तरह स्वतंत्र) */}
          <div className="pt-2 border-t-2 border-slate-300 space-y-1.5">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider block text-center">
              आउटपुट डाउनलोड व शेयर
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. JPG बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('jpg');
                }}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>🖼️</span>
                <span>{isProcessing ? 'तैयार...' : 'JPG'}</span>
              </button>

              {/* 2. PDF बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('pdf');
                }}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>📄</span>
                <span>{isProcessing ? 'तैयार...' : 'PDF'}</span>
              </button>

              {/* 3. शेयर बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={(!frontCropped && !backCropped) || isSharing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>🔗</span>
                <span>{isSharing ? 'खुल रहा...' : 'शेयर करें'}</span>
              </button>
            </div>
          </div>"""

if old_buttons_block in code:
    code = code.replace(old_buttons_block, new_buttons_block)
else:
    import re
    code = re.sub(
        r'\{\/\* 7\. डाउनलोड सेक्शन \*\/.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>',
        new_buttons_block + "\n        </div>\n      </main>",
        code,
        flags=re.DOTALL
    )

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BUTTONS_ISOLATION_APPLIED_SUCCESSFULLY")
