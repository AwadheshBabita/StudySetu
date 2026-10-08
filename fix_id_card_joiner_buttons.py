import re

file_path = "src/app/tools/id-card-joiner/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. स्वतंत्र स्टेट्स जोड़ना (यदि नहीं हैं)
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in content:
    state_injection = """
  const [isDownloadingJpg, setIsDownloadingJpg] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
"""
    # पहली स्टेट घोषणा के बाद इंजेक्ट करें
    content = re.sub(r'(const \[[a-zA-Z0-9_]+,\s*set[a-zA-Z0-9_]+\]\s*=\s*useState[^;]+;)', r'\1' + state_injection, content, count=1)

# 2. सुपर-फास्ट और नॉन-ब्लॉकिंग JPG डाउनलोड हैंडलर
jpg_fast_func = """
  const handleFastDownloadJpg = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingJpg(true);

    try {
      const canvas = previewCanvasRef.current || document.querySelector("canvas");
      if (!canvas) throw new Error("Canvas not ready");

      await new Promise((resolve) => setTimeout(resolve, 30));

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloadingJpg(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ID_Card_Joined_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setIsDownloadingJpg(false);
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("JPG Download Error:", err);
      setIsDownloadingJpg(false);
    }
  };
"""

# 3. सुपर-फास्ट और नॉन-ब्लॉकिंग PDF डाउनलोड हैंडलर
pdf_fast_func = """
  const handleFastDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingPdf(true);

    try {
      const canvas = previewCanvasRef.current || document.querySelector("canvas");
      if (!canvas) throw new Error("Canvas not ready");

      await new Promise((resolve) => setTimeout(resolve, 30));

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsDownloadingPdf(false);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          pdf.addImage(base64data, "JPEG", 10, 15, 190, 0);
          pdf.save(`ID_Card_Joined_${Date.now()}.pdf`);
          setIsDownloadingPdf(false);
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.92);
    } catch (err) {
      console.error("PDF Download Error:", err);
      setIsDownloadingPdf(false);
    }
  };
"""

# 4. सुपर-फास्ट और आइसोलेटेड शेयर हैंडलर
share_fast_func = """
  const handleFastShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsSharing(true);

    try {
      const canvas = previewCanvasRef.current || document.querySelector("canvas");
      if (!canvas) throw new Error("Canvas not ready");

      await new Promise((resolve) => setTimeout(resolve, 30));

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        const file = new File([blob], `ID_Card_${Date.now()}.jpg`, { type: "image/jpeg" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Joined ID Card",
            text: "Joined ID Card via ExamSewa",
          });
        } else {
          // यदि ब्राउज़र शेयर सपोर्ट न करे तो ऑटो डाउनलोड
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `ID_Card_Joined_${Date.now()}.jpg`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        setIsSharing(false);
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Share Error:", err);
      setIsSharing(false);
    }
  };
"""

# फ़ंक्शन जोड़ें (घटक के अंदर)
if "handleFastDownloadJpg" not in content:
    content = re.sub(r'(export default function [^{]+{)', r'\1\n' + jpg_fast_func + pdf_fast_func + share_fast_func, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("ID_CARD_JOINER_FAST_ISOLATED_HANDLERS_ADDED")
