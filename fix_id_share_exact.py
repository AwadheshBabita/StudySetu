with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_share_lines = [
    "  const handleShare = async () => {\n",
    "    setIsProcessing(true);\n",
    "    try {\n",
    "      const canvas = await generateSheetCanvas(1.0);\n",
    "      if (!canvas) {\n",
    "        setIsProcessing(false);\n",
    "        return;\n",
    "      }\n",
    "\n",
    "      canvas.toBlob(async (blob) => {\n",
    "        if (!blob) {\n",
    "          setIsProcessing(false);\n",
    "          return;\n",
    "        }\n",
    "        const file = new File([blob], `ExamSewa_IDCard_${sheetSize}.jpg`, { type: 'image/jpeg' });\n",
    "\n",
    "        if (navigator.canShare && navigator.canShare({ files: [file] })) {\n",
    "          try {\n",
    "            await navigator.share({\n",
    "              files: [file],\n",
    "              title: 'ID Card Document',\n",
    "              text: 'ExamSewa आईडी कार्ड',\n",
    "            });\n",
    "          } catch (e: any) {\n",
    "            // user cancelled share\n",
    "          }\n",
    "        } else {\n",
    "          // अगर ब्राउज़र में फाइल शेयर सपोर्ट नहीं है तो सीधे इमेज डाउनलोड\n",
    "          const link = document.createElement('a');\n",
    "          link.download = `ExamSewa_IDCard_${sheetSize}.jpg`;\n",
    "          link.href = URL.createObjectURL(blob);\n",
    "          link.click();\n",
    "        }\n",
    "        setIsProcessing(false);\n",
    "      }, 'image/jpeg', 0.98);\n",
    "    } catch (err) {\n",
    "      setIsProcessing(false);\n",
    "      alert('शेयर करने में समस्या आई।');\n",
    "    }\n",
    "  };\n"
]

# 374th line se handleShare ko replace karna
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
    print("SUCCESS_REPLACED_ID_CARD_SHARE")
else:
    print("COULD_NOT_LOCATE_BOUNDARIES", start_idx, end_idx)
