import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'http://129.154.228.242:3000';
  const tools = [
    '',
    '/tools/photo-resize',
    '/tools/signature-resize',
    '/tools/exact-kb-compressor',
    '/tools/exact-pixel-resize',
    '/tools/document-scanner',
    '/tools/id-card-cropper',
    '/tools/age-calculator',
    '/tools/image-format-converter',
    '/tools/pdf-compress',
    '/tools/image-to-pdf',
    '/tools/pdf-merge-split',
    '/tools/pdf-rotate-delete',
    '/tools/pdf-password',
    '/tools/pdf-watermark',
  ];

  return tools.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
