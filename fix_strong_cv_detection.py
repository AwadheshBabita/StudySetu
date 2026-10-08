with open("src/app/tools/cam-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_pipeline = """      // Step 1: ग्रेस्केल
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

      // Step 2: गॉसियन ब्लर (चादर/दीवार के खुरदरेपन को मिटाना)
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

      // Step 3: कैनी एज डिटेक्शन
      cv.Canny(blurred, edges, 50, 150);

      // Step 4: मॉर्फोलॉजिकल क्लोज (टूटे हुए किनारों को जोड़ना)
      cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel);

      // Step 5: क्लोज्ड लूप कंटूर्स खोजना
      cv.findContours(closed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);"""

new_pipeline = """      // Step 1: ग्रेस्केल व नॉइज़ फिल्टर
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.GaussianBlur(gray, blurred, new cv.Size(7, 7), 0, 0, cv.BORDER_DEFAULT);

      // Step 2: ऑत्सू अडैप्टिव बाइनराइजेशन (रोशनी व लैमिनेशन रिफ्लेक्शन को संभालना)
      const binary = new cv.Mat();
      cv.threshold(blurred, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

      // Step 3: कैनी एज + डायलेशन (ठोस बाहरी बॉर्डर बनाना)
      cv.Canny(binary, edges, 30, 100);
      binary.delete();

      // Step 4: टूटे हुए लैमिनेशन रिफ्लेक्शन को जोड़ना (5x5 कर्नेल)
      const kernel5 = cv.Mat.ones(5, 5, cv.CV_8U);
      cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel5);
      kernel5.delete();

      // Step 5: बाहरी कंटूर्स की खोज (RETR_EXTERNAL केवल बाहरी सीमा को पकड़ेगा)
      cv.findContours(closed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);"""

if old_pipeline in code:
    code = code.replace(old_pipeline, new_pipeline)
    with open("src/app/tools/cam-demo/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("STRONG_CV_DETECTION_APPLIED")
else:
    print("PIPELINE_NOT_MATCHED_CHECKING_CODE")
