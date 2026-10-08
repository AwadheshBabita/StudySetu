import os, shutil

utility_tools_seo = {
    "age-calculator": {
        "title": "Online Age Calculator for Govt Exams - उम्र की सटीक गणना | ExamSewa",
        "desc": "सरकारी नौकरी के फॉर्म भरने के लिए किसी भी कट-ऑफ तारीख (जैसे 01 जनवरी या 01 जुलाई) पर अपनी सही उम्र (वर्ष, माह, दिन) मिनटों में निकालें।",
        "keywords": ["age calculator for govt exams", "online age calculator", "dob to cutoff age calculate", "sarkari exam age calculator"]
    },
    "certificate-fitter": {
        "title": "Certificate Fitter Tool - मार्कशीट व सर्टिफिकेट A4 पर सेट करें | ExamSewa",
        "desc": "मार्कशीट, जाति, आय या निवास प्रमाण पत्र की फोटो को मानक A4 पेपर साइज में सही मार्जिन और ओरिएंटेशन के साथ फिट करें।",
        "keywords": ["certificate fitter online", "marksheet a4 paper fit", "document a4 print setter", "certificate printing tool"]
    },
    "csc-corner": {
        "title": "CSC & Jan Seva Kendra Tools - साइबर कैफे स्पेशल टूलकिट | ExamSewa",
        "desc": "जन सेवा केंद्र (CSC) और साइबर कैफे संचालकों के लिए ऑल-इन-वन टूल्स—आईडी कार्ड प्रिंटिंग, सर्टिफिकेट रिसाइज़, और फास्ट डॉक्यूमेंट प्रोसेसिंग।",
        "keywords": ["csc center tools online", "jan seva kendra photo tools", "cyber cafe document helper", "examsewa csc corner"]
    }
}

base_dir = "src/app/tools"

# 1. ग्रुप 4 के लेआउट बनाना
for folder, data in utility_tools_seo.items():
    target_path = os.path.join(base_dir, folder)
    if os.path.exists(target_path):
        canonical_url = f"https://examsewa.online/tools/{folder}"
        layout_code = f'''import type {{ Metadata }} from "next";

export const metadata: Metadata = {{
  title: "{data['title']}",
  description: "{data['desc']}",
  keywords: {str(data['keywords'])},
  alternates: {{
    canonical: "{canonical_url}",
  }},
  openGraph: {{
    title: "{data['title']}",
    description: "{data['desc']}",
    url: "{canonical_url}",
    type: "website",
  }},
}};

export default function Layout({{
  children,
}}: {{
  children: React.ReactNode;
}}) {{
  return <>{children}</>;
}}
'''
        layout_file = os.path.join(target_path, "layout.tsx")
        with open(layout_file, "w", encoding="utf-8") as f:
            f.write(layout_code)
        print(f"✅ SEO Layout बनाया गया: /tools/{folder}")
    else:
        print(f"⚠️ फ़ोल्डर नहीं मिला: /tools/{folder}")

# 2. पुराने टेस्ट/डेमो और बैकअप फ़ोल्डर्स को हटाना
trash_folders = [
    "cam-demo",
    "guide-demo",
    "id-card-joiner-demo",
    "document-scanner_STABLE_BACKUP"
]

for tf in trash_folders:
    tf_path = os.path.join(base_dir, tf)
    if os.path.exists(tf_path):
        shutil.rmtree(tf_path)
        print(f"🗑️ जंक/डेमो फ़ोल्डर साफ़ किया गया: /tools/{tf}")

# 3. फाइनल ऑडिट
print("\n" + "=" * 60)
print("अंतिम वेबसाइट SEO ऑडिट रिपोर्ट (Final SEO Audit):")
print("=" * 60)

all_routes = []
for root, dirs, files in os.walk(base_dir):
    if "page.tsx" in files:
        rel_path = os.path.relpath(root, base_dir)
        all_routes.append(rel_path)

all_routes.sort()

seo_ok = []
seo_missing = []

for r in all_routes:
    page_path = os.path.join(base_dir, r, "page.tsx")
    layout_path = os.path.join(base_dir, r, "layout.tsx")
    
    has_meta_in_page = False
    with open(page_path, "r", encoding="utf-8") as f:
        p_code = f.read()
        if "export const metadata" in p_code:
            has_meta_in_page = True

    has_meta_in_layout = False
    if os.path.exists(layout_path):
        with open(layout_path, "r", encoding="utf-8") as f:
            l_code = f.read()
            if "export const metadata" in l_code:
                has_meta_in_layout = True

    if has_meta_in_page or has_meta_in_layout:
        seo_ok.append(r)
    else:
        seo_missing.append(r)

print(f"कुल एक्टिव टूल्स रूट्स: {len(all_routes)}")
print(f"✅ 100% SEO Ready टूल्स: {len(seo_ok)}")
print(f"❌ पेंडिंग टूल्स: {len(seo_missing)}")

if seo_missing:
    print("\nपेंडिंग लिस्ट:", seo_missing)
else:
    print("\nबधाई हो! आपकी वेबसाइट के सभी सक्रिय टूल्स अब 100% SEO Ready हो चुके हैं! 🎉")

print("=" * 60)
