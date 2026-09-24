'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectOld() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/tools/pdf-to-image');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-xs font-bold text-slate-600">नया टूल खुल रहा है...</p>
    </div>
  );
}
