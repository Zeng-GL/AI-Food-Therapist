'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { UserCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PendingResult {
  result_code: string;
  confidence: number;
  imageFile: string;
  timestamp: number;
}

export default function ChooseAuthTypePage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { completeOnboarding } = useOnboardingStore();
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [savingPending, setSavingPending] = useState(false);
  const isZh = language === 'zh';

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect(() => {
  //   // If not logged in after a delay, redirect to home
  //   // Give time for auth state to sync
  //   if (mounted) {
  //     const timer = setTimeout(() => {
  //       if (!isLoggedIn) {
  //         console.log('⚠️ Not logged in after timeout, redirecting to home');
  //         router.push('/');
  //       }
  //     }, 500);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [mounted, isLoggedIn, router]);

  // 檢查並自動儲存待處理的結果
  useEffect(() => {
    const savePendingResult = async () => {
      // if (!user) return;

      const pendingResultStr = localStorage.getItem('pending_save_result');
      if (!pendingResultStr) return;

      try {
        const pendingResult: PendingResult = JSON.parse(pendingResultStr);
        
        // 檢查結果是否在 24 小時內
        const isRecent = Date.now() - pendingResult.timestamp < 24 * 60 * 60 * 1000;
        if (!isRecent) {
          localStorage.removeItem('pending_save_result');
          return;
        }

        // Mock 模式下：清除待處理結果
        // const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true';
        // if (useMockMode) {
        //   console.log('⚠️ Mock mode: Clearing pending result');
        //   localStorage.removeItem('pending_save_result');
        //   return;
        // }

        setSavingPending(true);

        // 上傳圖片到 Supabase Storage
        const imageBlob = await (await fetch(pendingResult.imageFile)).blob();
        const fileName = `${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('tongue-images')
          .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        // 取得公開 URL
        const { data: urlData } = supabase.storage
          .from('tongue-images')
          .getPublicUrl(fileName);

        // 儲存到 History 表
        const { error: dbError } = await supabase
          .from('history')
          .insert({
            user_id: user?.id,
            image_url: urlData.publicUrl,
            result_code: pendingResult.result_code,
          });

        if (dbError) throw dbError;

        // 清除待處理的結果
        localStorage.removeItem('pending_save_result');
        
        console.log('✅ Pending result saved successfully');
      } catch (error) {
        console.error('Failed to save pending result:', error);
        // 失敗時不清除，下次還能再試
      } finally {
        setSavingPending(false);
      }
    };

    if (mounted && user) {
      savePendingResult();
    }
  }, [mounted, user]);

  const handleLogin = () => {
    // 直接登入：跳過 Onboarding，標記為已完成（但不填寫資料）
    completeOnboarding();
    
    // Mark that user has chosen auth type (quick login)
    localStorage.setItem('auth_type_chosen', 'login');
    
    router.push('/home');
  };

  const handleRegister = () => {
    // 註冊：導向 Onboarding 問卷
    // Mark that user has chosen to register (will be confirmed after completing onboarding)
    router.push('/onboarding');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (savingPending) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{isZh ? '正在儲存您的檢測記錄...' : 'Saving your diagnosis...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isZh ? '歡迎使用' : 'Welcome'}
          </h1>
          <p className="text-gray-600">
            {isZh 
              ? '請選擇您的使用方式' 
              : 'Choose how you want to proceed'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Register Button (Recommended) */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-teal-500" style={{ borderColor: '#4DB6AC' }}>
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus size={24} className="text-teal-600" style={{ color: '#4DB6AC' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isZh ? '完整註冊' : 'Full Registration'}
                  </h2>
                  <span className="px-2 py-0.5 bg-brand/20 text-brand-muted text-xs font-semibold rounded-full">
                    {isZh ? '推薦' : 'Recommended'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {isZh 
                    ? '回答幾個簡單問題，獲得個人化的食療建議' 
                    : 'Answer a few questions to get personalized food recommendations'}
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li className="flex items-center space-x-2">
                    <span className="text-teal-500">✓</span>
                    <span>{isZh ? '個人化食療推薦' : 'Personalized recommendations'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-teal-500">✓</span>
                    <span>{isZh ? '過濾過敏原與禁忌' : 'Filter allergens & restrictions'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-teal-500">✓</span>
                    <span>{isZh ? '健康目標追蹤' : 'Health goal tracking'}</span>
                  </li>
                </ul>
                <button
                  onClick={handleRegister}
                  className="w-full py-3 px-6 bg-brand text-white rounded-full font-semibold hover:opacity-90 transition-colors shadow-md"
                  style={{ backgroundColor: '#4DB6AC' }}
                >
                  {isZh ? '開始註冊' : 'Start Registration'}
                </button>
              </div>
            </div>
          </div>

          {/* Login Button (Quick Access) */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck size={24} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {isZh ? '快速登入' : 'Quick Login'}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {isZh 
                    ? '跳過問卷，直接開始使用（不會有個人化建議）' 
                    : 'Skip questions and start immediately (no personalization)'}
                </p>
                <button
                  onClick={handleLogin}
                  className="w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  {isZh ? '直接登入' : 'Login Now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isZh 
            ? '您可以稍後在個人中心完成註冊資料' 
            : 'You can complete registration later in your profile'}
        </p>
      </div>
    </div>
  );
}
