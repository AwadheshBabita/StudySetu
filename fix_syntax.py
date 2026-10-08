with open('src/app/tools/id-card-joiner/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bad_block = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
    if (format === 'jpg') await handleDownloadJpgOnly();
    else await handleDownloadPdfOnly();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsProcessing(false);
    }
  };"""

clean_block = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
    if (format === 'jpg') await handleDownloadJpgOnly();
    else await handleDownloadPdfOnly();
  };"""

if bad_block in code:
    code = code.replace(bad_block, clean_block)
    print("REPLACED_EXACT_BLOCK")
else:
    # रेगेक्स फॉलबैक अगर स्पेस का थोड़ा अंतर हो
    import re
    pattern = r"const handleDownload = async \(format: 'jpg' \| 'pdf'\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);[\s\S]*?setIsProcessing\(false\);[\s\S]*?\};"
    code = re.sub(pattern, "const handleDownload = async (format: 'jpg' | 'pdf') => {\n    if (format === 'jpg') await handleDownloadJpgOnly();\n    else await handleDownloadPdfOnly();\n  };", code)
    print("REPLACED_VIA_REGEX")

with open('src/app/tools/id-card-joiner/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("CLEANUP_COMPLETE")
