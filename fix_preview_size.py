with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Preset to Ratio helper function
ratio_helper = """  const getPresetRatio = (p: AspectPreset): string => {
    if (p === "passport") return "3.5 / 4.5";
    if (p === "4:6") return "4 / 6";
    if (p === "5:7") return "5 / 7";
    if (p === "8:10") return "8 / 10";
    if (p === "signature") return "3.5 / 1.5";
    if (p === "card") return "8.5 / 5.5";
    if (p === "a4") return "210 / 297";
    if (p === "1:1") return "1 / 1";
    return "auto";
  };
"""

if "getPresetRatio" not in code:
    code = code.replace("const activeDisplayImg = bgRemovedUrl || croppedUrl;", "const activeDisplayImg = bgRemovedUrl || croppedUrl;\n" + ratio_helper)

# 2. Preview Frame Container me dynamic aspectRatio lagana
old_frame_style = 'style={{ backgroundColor: bgColor !== "transparent" ? bgColor : "#ffffff" }}'
new_frame_style = 'style={{ backgroundColor: bgColor !== "transparent" ? bgColor : "#ffffff", aspectRatio: getPresetRatio(preset) }}'

if old_frame_style in code and "aspectRatio: getPresetRatio" not in code:
    code = code.replace(old_frame_style, new_frame_style, 1)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("PREVIEW_SIZE_RATIO_ACTIVATED")
