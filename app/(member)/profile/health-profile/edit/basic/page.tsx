'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore, Gender, AgeGroup } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';
import { ChevronLeft, Check } from 'lucide-react';
import { useSaveProfile } from '@/hooks/use-save-profile';


export default function EditBasicProfile() {
  const router = useRouter();
  const { gender: initialGender, ageGroup: initialAgeGroup, updateProfile } = useOnboardingStore();
  const { saveProfile } = useSaveProfile(); 
  const { language } = useLanguageStore();
  const isZh = language === 'zh';
  const q1 = onboardingText.q1;

  const [gender, setGender] = useState<Gender | null>(initialGender);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(initialAgeGroup);

  const genderOptions: Gender[] = ['Male', 'Female', 'Other'];
  const ageOptions: AgeGroup[] = [
    'Under_20', '21_25', '26_30', '31_35', '36_40',
    '41_45', '46_50', '51_65', 'Over_65'
  ];

  const handleSave = async() => {
    updateProfile({ gender, ageGroup });
    await saveProfile({ gender, ageGroup });
    router.push('/profile/health-profile');
  };

  const isValid = gender !== null && ageGroup !== null;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/profile/health-profile')}
              className="mr-3 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {isZh ? '基本資訊' : 'Basic Profile'}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="text-brand-muted font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: isValid ? '#6C9A5D' : undefined }}
          >
            {isZh ? '儲存' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-8">
        {/* Gender */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {q1.genderLabel[language]}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option}
                onClick={() => setGender(option)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  gender === option
                    ? 'border-brand bg-brand/10 text-brand-muted'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                style={
                  gender === option
                    ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                    : {}
                }
              >
                <span className="text-sm font-medium">
                  {q1.genderOptions[option][language]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {q1.ageLabel[language]}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ageOptions.map((option) => (
              <button
                key={option}
                onClick={() => setAgeGroup(option)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  ageGroup === option
                    ? 'border-brand bg-brand/10 text-brand-muted'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                style={
                  ageGroup === option
                    ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                    : {}
                }
              >
                <span className="text-sm font-medium">
                  {q1.ageOptions[option][language]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
