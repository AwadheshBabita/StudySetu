import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://examsewa.online';

  const tools = [
    // मुख्य 20 टूल्स
    'photo-name-date',
    'pdf-compressor',
    'passport-grid-maker',
    'certificate-fitter',
    'live-photo-capture',
    'id-card-joiner',
    'photo-resize',
    'signature-resize',
    'pdf-to-image',
    'exact-pixel-resize',
    'document-scanner',
    'id-card-cropper',
    'age-calculator',
    'image-format-converter',
    'pdf-compress',
    'image-to-pdf',
    'pdf-merge-split',
    'pdf-rotate-delete',
    'pdf-password',
    'pdf-watermark',
  ];

  const toolUrls = tools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/csc-corner`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/rules-guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...toolUrls,
  ];
}
