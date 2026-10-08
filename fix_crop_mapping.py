with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. sourceImgRef जोड़ना
if "sourceImgRef" not in code:
    code = code.replace(
        "const containerRef = useRef<HTMLDivElement>(null);",
        "const containerRef = useRef<HTMLDivElement>(null);\n  const sourceImgRef = useRef<HTMLImageElement>(null);"
    )

# 2. Crop Screen Image tag me ref={sourceImgRef} lagana
old_img_tag = 'src={imgUrl}\n                  alt="Source"'
new_img_tag = 'ref={sourceImgRef}\n                  src={imgUrl}\n                  alt="Source"'

if old_img_tag in code:
    code = code.replace(old_img_tag, new_img_tag)
else:
    # alternate match
    code = code.replace('src={imgUrl}\n                  alt="Source"', 'ref={sourceImgRef}\n                  src={imgUrl}\n                  alt="Source"')

# 3. confirmCrop ko 100% mathematically exact banana
old_confirm_crop = """  const confirmCrop = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sx = (crop.x / 100) * img.naturalWidth;
      const sy = (crop.y / 100) * img.naturalHeight;
      const sw = (crop.w / 100) * img.naturalWidth;
      const sh = (crop.h / 100) * img.naturalHeight;

      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      setCroppedUrl(canvas.toDataURL("image/png"));
      setBgRemovedUrl(null);
      setStep("editor");
    };
    img.src = imgUrl;
  };"""

new_confirm_crop = """  const confirmCrop = () => {
    const img = sourceImgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // कंटेनर के अंदर इमेज का वास्तविक स्थान (offset)
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;

    // क्रॉप बॉक्स का पिक्सल स्थान
    const cropPixelX = (crop.x / 100) * containerRect.width;
    const cropPixelY = (crop.y / 100) * containerRect.height;
    const cropPixelW = (crop.w / 100) * containerRect.width;
    const cropPixelH = (crop.h / 100) * containerRect.height;

    // सिर्फ इमेज के अंदर वाला क्रॉप एरिया
    const intersectX = Math.max(imgLeft, cropPixelX);
    const intersectY = Math.max(imgTop, cropPixelY);
    const intersectRight = Math.min(imgLeft + imgWidth, cropPixelX + cropPixelW);
    const intersectBottom = Math.min(imgTop + imgHeight, cropPixelY + cropPixelH);

    const validW = Math.max(10, intersectRight - intersectX);
    const validH = Math.max(10, intersectBottom - intersectY);

    // ओरिजिनल इमेज (naturalWidth/naturalHeight) के स्केल पर कन्वर्शन
    const scaleX = img.naturalWidth / imgWidth;
    const scaleY = img.naturalHeight / imgHeight;

    const sourceX = Math.round((intersectX - imgLeft) * scaleX);
    const sourceY = Math.round((intersectY - imgTop) * scaleY);
    const sourceW = Math.round(validW * scaleX);
    const sourceH = Math.round(validH * scaleY);

    if (sourceW <= 0 || sourceH <= 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = sourceW;
    canvas.height = sourceH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

    setCroppedUrl(canvas.toDataURL("image/png"));
    setBgRemovedUrl(null);
    setStep("editor");
  };"""

if old_confirm_crop in code:
    code = code.replace(old_confirm_crop, new_confirm_crop)
else:
    # Regex fallback if whitespace differs
    import re
    code = re.sub(r'const confirmCrop = \(\) => \{.*?setStep\("editor"\);\s*\};', new_confirm_crop, code, flags=re.DOTALL)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_CROP_MAPPING_APPLIED")
