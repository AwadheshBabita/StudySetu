with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_share_lines = [
    "  // 📤 नेटिव शेयर सिस्टम (Document Scanner जैसा सटीक फॉर्मूला)\n",
    "  const handleShare = async () => {\n",
    "    if (isProcessing) return;\n",
    "    setIsProcessing(true);\n",
    "    try {\n",
    "      const canvas = await generateSheetCanvas(1.0);\n",
    "      if (!canvas) {\n",
    "        setIsProcessing(false);\n",
    "        return;\n",
    "      }\n",
    "\n",
    "      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.98);\n",
    "      const res = await fetch(jpgDataUrl);\n",
    "      const blob = await res.blob();\n",
    "      const fileName = `ExamSewa_IDCard_${sheetSize}.jpg`;\n",
    "      const file = new File([blob], fileName, { type: 'image/jpeg' });\n",
    "\n",
    "      if (navigator.canShare && navigator.canShare({ files: [file] })) {\n",
    "        await navigator.share({\n",
    "          files: [file],\n",
    "          title: 'ExamSewa आईडी कार्ड',\n",
    "          text: 'ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़',\n",
    "        });\n",
    "      } else if (navigator.share) {\n",
    "        await navigator.share({\n",
    "          title: 'ExamSewa आईडी कार्ड',\n",
    "          text: 'ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़',\n",
    "        });\n",
    "      } else {\n",
    "        // अगर शेयर सपोर्ट नहीं है तो सीधा डाउनलोड\n",
    "        const link = document.createElement('a');\n",
    "        link.download = fileName;\n",
    "        link.href = URL.createObjectURL(blob);\n",
    "        link.click();\n",
    "        setTimeout(() => URL.revokeObjectURL(link.href), 1000);\n",
    "      }\n",
    "    } catch (err: any) {\n",
    "      if (err.name !== 'AbortError') {\n",
    "        console.error('शेयरिंग में त्रुटि:', err);\n",
    "      }\n",
    "    } finally {\n",
    "      setIsProcessing(false);\n",
    "    }\n",
    "  };\n"
]

start_idx = -1
end_idx = -1
for i, l in enumerate(lines):
    if "const handleShare = async () => {" in l:
        start_idx = i
        break

if start_idx != -1:
    for j in range(start_idx, len(lines)):
        if "const handlePrint = async () => {" in lines[j]:
            end_idx = j
            break

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx] = new_share_lines
    with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("MATCHED_SCANNER_LOGIC_SUCCESSFULLY")
else:
    print("ERROR_SLICING", start_idx, end_idx)
