with open('src/app/tools/id-card-joiner/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = "{cropTarget && cropImgSrc && ("
idx = code.find(target)

if idx != -1:
    correct_block = """{cropTarget && cropImgSrc && (
        <ScannerCropModal
          imgSrc={cropImgSrc}
          title={cropTarget === 'front' ? 'Front Side' : 'Back Side'}
          onConfirm={(croppedUrl) => {
            if (cropTarget === 'front') setFrontCropped(croppedUrl);
            else setBackCropped(croppedUrl);
            setCropTarget(null);
            setCropImgSrc(null);
          }}
          onCancel={() => {
            setCropTarget(null);
            setCropImgSrc(null);
          }}
        />
      )}
    </div>
  );
}
"""
    code = code[:idx] + correct_block
    with open('src/app/tools/id-card-joiner/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("PAGE_FIXED_PERFECTLY")
else:
    print("TARGET_NOT_FOUND")
