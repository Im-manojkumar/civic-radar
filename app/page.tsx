'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Default redirect to citizen view
    router.replace('/citizen');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-tn-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading Civic Radar TN...</p>
      </div>
    </div>
  );
}
