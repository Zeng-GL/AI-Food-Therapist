'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HealthProfileOverview() {
  const router = useRouter();
  const profile = useOnboardingStore();
  const { language } = useLanguageStore();
  const isZh = language === 'zh';

  const sections = [
    {
      id: 'basic',
      title: isZh ? '基本資訊' : 'Basic Profile',
      items: [
        {
          label: onboardingText.q1.genderLabel[language],
          value: profile.gender ? onboardingText.q1.genderOptions[profile.gender][language] : '-',
        },
        {
          label: onboardingText.q1.ageLabel[language],
          value: profile.ageGroup ? onboardingText.q1.ageOptions[profile.ageGroup][language] : '-',
        },
      ],
    },
    {
      id: 'goals',
      title: isZh ? '健康目標' : 'Health Goals',
      items: [
        {
          label: onboardingText.q2.title[language],
          value: profile.primaryGoals.length > 0
            ? profile.primaryGoals.map(goal => onboardingText.q2.options[goal][language]).join(', ')
            : '-',
        },
      ],
    },
    {
      id: 'lifestyle',
      title: isZh ? '生活型態' : 'Lifestyle',
      items: [
        {
          label: onboardingText.q3.sleepLabel[language],
          value: profile.sleepHabit ? onboardingText.q3.sleepOptions[profile.sleepHabit][language] : '-',
        },
        {
          label: onboardingText.q3.stressLabel[language],
          value: `${getStressEmoji(profile.stressLevel)} ${isZh ? '等級' : 'Level'} ${profile.stressLevel}`,
        },
      ],
    },
    {
      id: 'dietary',
      title: isZh ? '飲食偏好與禁忌' : 'Dietary Preferences',
      items: [
        {
          label: onboardingText.q4.allergiesLabel[language],
          value: profile.allergies.length > 0
            ? profile.allergies.map(a => {
                if (a === 'Other' && profile.customAllergy) {
                  return profile.customAllergy;
                }
                return onboardingText.q4.allergiesOptions[a][language];
              }).join(', ')
            : '-',
        },
        {
          label: onboardingText.q4.dietLabel[language],
          value: profile.dietType === 'Other' && profile.customDietType
            ? profile.customDietType
            : onboardingText.q4.dietOptions[profile.dietType][language],
        },
        {
          label: onboardingText.q4.medicalLabel[language],
          value: profile.medicalConditions.length > 0
            ? profile.medicalConditions.map(m => {
                if (m === 'Other' && profile.customMedicalCondition) {
                  return profile.customMedicalCondition;
                }
                return onboardingText.q4.medicalOptions[m][language];
              }).join(', ')
            : '-',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center">
          <button
            onClick={() => router.push('/profile')}
            className="mr-3 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {isZh ? '健康檔案' : 'Health Profile'}
          </h1>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 py-6 space-y-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => router.push(`/profile/health-profile/edit/${section.id}`)}
            className="w-full bg-surface-card rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden text-left border border-gray-100"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {section.title}
              </h2>
              <ChevronRight size={20} className="text-gray-400" />
            </div>

            <div className="p-5 space-y-3">
              {section.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <dt className="text-sm text-gray-600 flex-shrink-0 w-1/3">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium text-gray-800 flex-1 text-right">
                    {item.value}
                  </dd>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="px-6 py-4 text-center text-xs text-gray-500">
        {isZh ? '點擊任一區塊進行編輯' : 'Tap any section to edit'}
      </div>
    </div>
  );
}

// Helper function
function getStressEmoji(level: number): string {
  const emojis = ['😌', '😊', '😐', '😟', '😰'];
  return emojis[level - 1] || '😐';
}
