'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectTool() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tools/exact-kb-compressor");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-slate-600 font-semibold">टूल लोड हो रहा है...</p>
    </div>
  );
}
