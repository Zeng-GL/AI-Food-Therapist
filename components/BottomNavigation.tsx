'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, User } from 'lucide-react';
import { useLanguageStore } from '@/store/use-language-store';
import { useSession } from "next-auth/react";

const tabs = [
  {
    id: 'home',
    path: '/home',
    icon: Home,
    label: { en: 'Home', zh: '首頁' },
  },
  {
    id: 'trends',
    path: '/trends',
    icon: TrendingUp,
    label: { en: 'Trends', zh: '健康日誌' },
  },
  {
    id: 'profile',
    path: '/profile',
    icon: User,
    label: { en: 'Profile', zh: '個人中心' },
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const { data: session } = useSession();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-gray-200 safe-area-pb z-40">
      <div className="max-w-screen-lg mx-auto px-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`flex flex-col items-center justify-center py-2 px-4 flex-1 transition-colors ${
                  isActive ? 'text-brand' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={24} className={isActive ? 'stroke-[2.5]' : ''} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label[language]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
