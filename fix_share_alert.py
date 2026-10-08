with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_share_lines = [
    "  const handleShare = async () => {\n",
    "    if (isProcessing) return;\n",
    "    setIsProcessing(true);\n",
    "    try {\n",
    "      const canvas = await generateSheetCanvas(1.0);\n",
    "      if (!canvas) return;\n",
    "\n",
    "      const blob = await new Promise<Blob | null>((resolve) => {\n",
    "        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.98);\n",
    "      });\n",
    "\n",
    "      if (!blob) return;\n",
    "\n",
    "      const file = new File([blob], `ExamSewa_IDCard_${sheetSize}.jpg`, { type: 'image/jpeg' });\n",
    "\n",
    "      // Web Share API with File check\n",
    "      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {\n",
    "        try {\n",
    "          await navigator.share({\n",
    "            files: [file],\n",
    "            title: 'ExamSewa ID Card',\n",
    "          });\n",
    "        } catch (shareErr: any) {\n",
    "          // User ne popup cancel/close kiya toh koi alert nahi dikhana hai\n",
    "          if (shareErr?.name !== 'AbortError' && shareErr?.name !== 'NotAllowedError') {\n",
    "            // Agar device share mana kare toh chupchap download kar dein\n",
    "            const link = document.createElement('a');\n",
    "            link.download = `ExamSewa_IDCard_${sheetSize}.jpg`;\n",
    "            link.href = URL.createObjectURL(blob);\n",
    "            link.click();\n",
    "            setTimeout(() => URL.revokeObjectURL(link.href), 1000);\n",
    "          }\n",
    "        }\n",
    "      } else {\n",
    "        // Desktop ya Unsupported browser me seedhe image download\n",
    "        const link = document.createElement('a');\n",
    "        link.download = `ExamSewa_IDCard_${sheetSize}.jpg`;\n",
    "        link.href = URL.createObjectURL(blob);\n",
    "        link.click();\n",
    "        setTimeout(() => URL.revokeObjectURL(link.href), 1000);\n",
    "      }\n",
    "    } catch (err) {\n",
    "      // Silent fallback, no annoying alert\n",
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
    print("SHARE_ALERT_PERMANENTLY_FIXED")
else:
    print("ERROR_FINDING_BLOCK", start_idx, end_idx)
