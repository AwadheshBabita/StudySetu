with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. कार्ड लेआउट बटन (अगल-बगल / ऊपर-नीचे)
code = code.replace(
    ': "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"',
    ': "bg-amber-50/70 text-slate-800 border-2 border-amber-200/90 hover:bg-amber-100/60 font-bold shadow-xs"'
)

# 2. दिशा व घुमाव बटन (↺ -90°, ↻ +90°, ⇄ क्षैतिज, ⇅ लंबवत)
code = code.replace(
    'className="py-2 px-1 border border-slate-200 rounded-xl text-center bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs"',
    'className="py-2.5 px-1 border-2 border-amber-200/90 rounded-xl text-center bg-amber-50/70 hover:bg-amber-100/60 transition active:scale-95 shadow-xs"'
)
code = code.replace('text-[10px] font-bold text-slate-700 mt-0.5', 'text-[11px] font-black text-slate-900 mt-0.5')
code = code.replace('text-xs font-bold text-slate-800', 'text-xs font-black text-slate-900')

# 3. फ़िल्टर बटन (Magic Color, B&W, Grayscale, Original)
code = code.replace(
    ': "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"',
    ': "bg-amber-50/70 text-slate-900 border-2 border-amber-200/90 hover:bg-amber-100/60 font-black shadow-xs"'
)

# 4. KB प्रीसेट बटन (10 KB, 20 KB ... 300 KB)
code = code.replace(
    ': "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"',
    ': "bg-amber-50/70 text-slate-900 border-2 border-amber-200/90 hover:bg-amber-100/60 font-black shadow-xs"'
)

# 5. मैक्स एचडी बटन
code = code.replace(
    ': "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"',
    ': "bg-emerald-50/80 text-emerald-900 border-2 border-emerald-300 hover:bg-emerald-100 font-black shadow-xs"'
)

# 6. फ्रंट/बैक टॉगल में इन-एक्टिव बटन का बोल्डनेस
code = code.replace(
    ': "text-slate-600 hover:text-slate-900"',
    ': "text-slate-700 font-bold hover:text-slate-900"'
)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BUTTONS_HIGHLIGHTED_WITH_WARM_TINT_AND_BOLD_TEXT")
