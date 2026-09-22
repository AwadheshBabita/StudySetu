import re

file_path = 'src/app/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# WhatsApp लिंक वाले बिगड़े हिस्से को सही करना
text = re.sub(
    r'href=\{\}\s*target="_blank"',
    r'href={`https://api.whatsapp.com/send?text=${whatsappShareText}`} target="_blank"',
    text
)

# इमेज स्कैनर सेक्शन को बाकी टूल्स जैसा हॉरिजॉन्टल बनाना
target_pattern = r'\{\(activeTab === \'all\' \Vert{}\Vert{} activeTab === \'scanner\'\) && \([\s\S]*?\}\s*\)\s*\}'

replacement_section = '''{(activeTab === 'all' || activeTab === 'scanner') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                इमेज व डॉक स्कैनर
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              नया टूल
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {scannerTools.map((t, idx) => (
              <Link
                key={idx}
                href={t.href}
                className="group p-4 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl shadow-xs hover:shadow-md transition flex items-start gap-3.5"
              >
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${t.color}`}>
                  {t.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-600 transition truncate">
                        {t.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                        {t.badge}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:translate-x-0.5 transition shrink-0">→</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}'''

text = re.sub(target_pattern, replacement_section, text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(">>> SUCCESS: Script Applied Cleanly <<<")
