#!/bin/bash
set -e

echo "=== 1. मौजूदा काम कर रहे कोड का बैकअप लिया जा रहा है... ==="
cp src/app/tools/exact-pixel-resize/page.tsx src/app/tools/exact-pixel-resize/page.tsx.last_working

echo "=== 2. टेस्ट बिल्ड चलाई जा रही है... ==="
if npm run build; then
    echo "✅ बिल्ड 100% पास हो गई! PM2 रीस्टार्ट किया जा रहा है..."
    pm2 restart examsewa
    echo "🚀 साइट बिना किसी डाउनटाइम के लाइव है।"
else
    echo "❌ बिल्ड में एरर आई! ऑटो-रोलबैक तुरंत चालू..."
    cp src/app/tools/exact-pixel-resize/page.tsx.last_working src/app/tools/exact-pixel-resize/page.tsx
    npm run build
    pm2 restart examsewa
    echo "🛡️ पुराना वर्किंग कोड रीस्टोर कर दिया गया। साइट 502 से सुरक्षित है।"
fi
