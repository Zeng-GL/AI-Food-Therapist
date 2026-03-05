'use client';

import { useOnboardingStore, Gender, AgeGroup } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';

export default function Q1BasicProfile() {
  const { gender, ageGroup, updateProfile } = useOnboardingStore();
  const { language } = useLanguageStore();
  const isZh = language === 'zh';
  const q1 = onboardingText.q1;
  
  const genders: Gender[] = ['Male', 'Female', 'Other'];
  const ageGroups: AgeGroup[] = [
    'Under_20', '21_25', '26_30', '31_35', '36_40', 
    '41_45', '46_50', '51_65', 'Over_65'
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {q1.title[language]}
        </h2>
        <p className="text-gray-600">
          {q1.subtitle[language]}
        </p>
      </div>

      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q1.genderLabel[language]}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => updateProfile({ gender: g })}
              className={`p-4 rounded-xl border-2 transition-all ${
                gender === g
? 'border-brand bg-brand/10 text-brand-muted'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
            style={gender === g ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' } : {}}
            >
              <div className="text-2xl mb-2">
                {g === 'Male' ? '♂' : g === 'Female' ? '♀' : '⚥'}
              </div>
              <div className="text-sm font-medium">
                {q1.genderOptions[g][language]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Age Group Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q1.ageLabel[language]}
        </label>
        <select
          value={ageGroup || ''}
          onChange={(e) => updateProfile({ ageGroup: e.target.value as AgeGroup })}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none text-gray-700"
          style={{ borderColor: ageGroup ? '#6C9A5D' : undefined }}
        >
          <option value="" disabled>
            {isZh ? '請選擇年齡範圍' : 'Select age group'}
          </option>
          {ageGroups.map((age) => (
            <option key={age} value={age}>
              {q1.ageOptions[age][language]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
