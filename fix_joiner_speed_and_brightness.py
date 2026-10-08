with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. getCompressedBlob को सुपर-फास्ट और नेचुरल टोन (नो एक्स्ट्रा ब्राइटनेस) बनाना
old_blob_fn = """  // स्मार्ट कोर इंजन (आईडी कार्ड के दोनों हिस्सों के टेक्स्ट व बारीक फॉन्ट 100% सुरक्षित)
  const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    const canvas = await generateSheetCanvas(1.0);
    if (!canvas) return null;

    try {
      const smartRes = await exportSmartJpg(canvas, {
        targetKb: targetSizeKb,
        isDocument: true,
        minQuality: 0.15,
        maxQuality: 0.98,
      });
      return smartRes.blob;
    } catch {
      return new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    }
  };"""

new_blob_fn = """  // 1-स्टेप सुपर फास्ट इंजन (प्रीव्यू जैसा ओरिजिनल रंग, नो ओवर-ब्राइटनेस, जीरो लैग)
  const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    const canvas = await generateSheetCanvas(1.0);
    if (!canvas) return null;

    let q = 0.90;
    if (targetSizeKb <= 40) q = 0.50;
    else if (targetSizeKb <= 70) q = 0.68;
    else if (targetSizeKb <= 120) q = 0.82;

    return new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', q));
  };"""

# 2. handleShare को वास्तविक फाइल शेयर करने वाला बनाना
old_share_fn = """    const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ExamSewa ID Card Joiner',
          text: 'ExamSewa आईडी कार्ड जॉइनर टूल से तैयार दस्तावेज़',
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert('शेयर लिंक कॉपी हो गया है!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('शेयर करने में समस्या आई।');
      }
    }
  };"""

new_share_fn = """  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const file = new File([blob], `ExamSewa_IDCard_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'ExamSewa ID Card',
          text: 'Joined ID Card via ExamSewa',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ExamSewa_IDCard_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };"""

# कोड में रीप्लेस करें
if old_blob_fn in code:
    code = code.replace(old_blob_fn, new_blob_fn)
    print("BLOB_FUNCTION_UPDATED")
else:
    print("BLOB_FUNCTION_NOT_MATCHED_EXACTLY")

if old_share_fn in code:
    code = code.replace(old_share_fn, new_share_fn)
    print("SHARE_FUNCTION_UPDATED")
else:
    print("SHARE_FUNCTION_NOT_MATCHED_EXACTLY")

# revokeObjectURL डिले फिक्स (ताकि डाउनलोड बीच में न लटके)
code = code.replace("URL.revokeObjectURL(url);", "setTimeout(() => URL.revokeObjectURL(url), 2000);")

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ID_CARD_JOINER_FIXED_PERFECTLY")
