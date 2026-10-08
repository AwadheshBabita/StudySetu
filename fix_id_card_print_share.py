with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. handleShare ko asali Image File share karne yogya banana
old_share = """    const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'ExamSewa ID Card Joiner',
          text: 'ExamSewa आईडी कार्ड जॉइनर टूल से तैयार दस्तावेज़',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('लिंक कॉपी हो गया!');
      }
    } catch {
      if ((error as Error).name !== 'AbortError') {
        alert('शेयर करने में समस्या आई।');
      }
    }
  };"""

new_share = """  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }
        const file = new File([blob], `ExamSewa_IDCard_${sheetSize}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'ExamSewa ID Card',
              text: 'ExamSewa आईडी कार्ड',
            });
          } catch {
            // share cancelled by user
          }
        } else if (navigator.share) {
          await navigator.share({
            title: 'ExamSewa ID Card Joiner',
            text: 'ExamSewa आईडी कार्ड जॉइनर',
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert('लिंक कॉपी हो गया!');
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.98);
    } catch {
      setIsProcessing(false);
      alert('शेयर करने में समस्या आई।');
    }
  };"""

if old_share in code:
    code = code.replace(old_share, new_share)
else:
    import re
    code = re.sub(r'const handleShare = async \(\) => \{.*?alert\(\'शेयर करने में समस्या आई\.\'\);\s*\}\s*\};', new_share, code, flags=re.DOTALL)

# 2. handlePrint ko foolproof banana (Sirf Canvas Image naye clean popup me print hogi)
old_print_func = """  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('पॉपअप ब्लॉक है! कृपया पॉपअप की अनुमति दें।');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ExamSewa Print</title>
            <style>
              @page {
                size: ${sheetSize === 'a4' ? 'A4 portrait' : '4in 6in landscape'};
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #ffffff;
              }
              .print-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                display: block;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 250);" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      alert('प्रिंट करने में समस्या आई।');
    } finally {
      setIsProcessing(false);
    }
  };"""

new_print_func = """  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('पॉपअप ब्लॉक है! कृपया ब्राउज़र में पॉपअप की अनुमति दें।');
        return;
      }

      printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Print_ID_Card</title>
    <style>
      @page { size: ${sheetSize === 'a4' ? 'A4 portrait' : '4in 6in landscape'}; margin: 0; }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; }
      img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    </style>
  </head>
  <body>
    <img src="${dataUrl}" onload="setTimeout(function(){ window.focus(); window.print(); window.close(); }, 300);" />
  </body>
</html>`);
      printWindow.document.close();
    } catch {
      alert('प्रिंट करने में समस्या आई।');
    } finally {
      setIsProcessing(false);
    }
  };"""

if "const handlePrint =" in code:
    code = re.sub(r'const handlePrint = async \(\) => \{.*?printWindow\.document\.close\(\);\s*\}\s*catch\s*\{.*?\}\s*finally\s*\{.*?\}\s*\};', new_print_func, code, flags=re.DOTALL)

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ID_CARD_PRINT_AND_SHARE_FIXED_SUCCESSFULLY")
