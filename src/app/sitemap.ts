import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://examsewa.online';
  const now = new Date();

  // 1. मुख्य और भरोसेमंद पेज (Trust & Legal Pages)
  const corePages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/privacy-policy`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/terms`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/disclaimer`, priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  // 2. सभी कार्यशील टूल्स (सटीक रूट्स)
  const activeTools = [
    'pdf-compressor',
    'document-scanner',
    'pdf-to-jpg',
    'jpg-to-pdf',
    'photo-name-date',
    'photo-resizer',
    'photo-resize',
    'signature-resize',
    'signature-crop',
    'exact-kb-compressor',
    'exact-pixel-resize',
    'id-card-joiner',
    'id-card-cropper',
    'certificate-fitter',
    'passport-grid-maker',
    'passport-photo-4x6-maker',
    'live-photo-capture',
    'age-calculator',
    'image-format-converter',
    'pdf-merge-split',
    'pdf-rotate-delete',
    'pdf-password',
    'pdf-watermark',
    'ssc-photo-maker',
    'up-police-photo-resizer',
    'bihar-rtps-document-compressor',
    'agniveer-live-photo',
    'rrb-railway-photo-maker',
    'mpsc-photo-resizer',
    'wbpsc-photo-resizer',
    'tnpsc-photo-maker',
    'csc-corner',
    'exam-guide',
  ];

  const toolUrls = activeTools.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    ...corePages.map((page) => ({
      ...page,
      lastModified: now,
    })),
    ...toolUrls,
  ];
}
