with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# शीट कैनवास में स्मूथिंग और शार्पनेस को अधिकतम करना
old_scale_def = "const generateSheetCanvas = async (scaleMultiplier = 1.0) => {"
if old_scale_def in code:
    print("FOUND_SHEET_FUNCTION")

# यह सुनिश्चित करना कि ctx में इमेज ड्रॉ करते समय हाई क्वालिटी स्मूथिंग ऑन रहे
fix_ctx_pattern = "ctx.imageSmoothingEnabled = true;"
if "ctx.imageSmoothingQuality" not in code:
    code = code.replace(
        "ctx.imageSmoothingEnabled = true;",
        "ctx.imageSmoothingEnabled = true;\n    ctx.imageSmoothingQuality = 'high';"
    )

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("HIGH_QUALITY_DRAW_ESTABLISHED")
