'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BottomNavigation from '@/components/BottomNavigation';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // 確保組件已在瀏覽器掛載，避免伺服器端渲染錯誤
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 當 NextAuth 確認沒有 session 且已經加載完成時，才導向首頁
    if (mounted && status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, mounted]);

  // 如果還在加載中或尚未掛載，顯示 Loading 或回傳 null
  if (!mounted || status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 如果未登入，不要渲染內容 (由 useEffect 處理跳轉)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
