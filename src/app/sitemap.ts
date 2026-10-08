import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

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

  // 2. src/app/tools/ से सभी 47 टूल्स के फोल्डर्स को ऑटोमैटिक लोड करें
  const toolsDirectory = path.join(process.cwd(), 'src/app/tools');
  let toolSlugs: string[] = [];

  try {
    const entries = fs.readdirSync(toolsDirectory, { withFileTypes: true });
    toolSlugs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (err) {
    console.error('Error reading tools directory for sitemap:', err);
  }

  const toolUrls = toolSlugs.map((slug) => ({
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
