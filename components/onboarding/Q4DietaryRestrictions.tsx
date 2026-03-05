'use client';

import { useOnboardingStore, Allergy, DietType, MedicalCondition } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';
import { Check } from 'lucide-react';

export default function Q4DietaryRestrictions() {
  const { allergies, dietType, medicalConditions, customAllergy, customDietType, customMedicalCondition, updateProfile } = useOnboardingStore();
  const { language } = useLanguageStore();
  const q4 = onboardingText.q4;
  
  const allergyOptions: Allergy[] = ['Seafood', 'Nuts', 'Gluten', 'Dairy', 'Soy', 'Eggs', 'Other', 'None'];
  const dietOptions: DietType[] = ['General', 'Vegetarian', 'Vegan', 'No_Beef', 'No_Pork', 'Other'];
  const medicalOptions: MedicalCondition[] = ['G6PD', 'Diabetes', 'Hypertension', 'Kidney_Disease', 'Other', 'None'];

  const toggleAllergy = (allergy: Allergy) => {
    if (allergy === 'None') {
      updateProfile({ allergies: ['None'] });
    } else {
      const filtered = allergies.filter(a => a !== 'None');
      if (allergies.includes(allergy)) {
        const updated = filtered.filter(a => a !== allergy);
        updateProfile({ allergies: updated.length === 0 ? ['None'] : updated });
        // Clear custom input when "Other" is deselected
        if (allergy === 'Other') {
          updateProfile({ customAllergy: '' });
        }
      } else {
        updateProfile({ allergies: [...filtered, allergy] });
      }
    }
  };

  const toggleMedical = (condition: MedicalCondition) => {
    if (condition === 'None') {
      updateProfile({ medicalConditions: ['None'] });
    } else {
      const filtered = medicalConditions.filter(m => m !== 'None');
      if (medicalConditions.includes(condition)) {
        const updated = filtered.filter(m => m !== condition);
        updateProfile({ medicalConditions: updated.length === 0 ? ['None'] : updated });
        // Clear custom input when "Other" is deselected
        if (condition === 'Other') {
          updateProfile({ customMedicalCondition: '' });
        }
      } else {
        updateProfile({ medicalConditions: [...filtered, condition] });
      }
    }
  };

  const selectDietType = (diet: DietType) => {
    updateProfile({ dietType: diet });
    // Clear custom input when switching away from "Other"
    if (dietType === 'Other' && diet !== 'Other') {
      updateProfile({ customDietType: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {q4.title[language]}
        </h2>
        <p className="text-gray-600">
          {q4.subtitle[language]}
        </p>
        <p className="text-xs text-gray-500">
          {q4.optional[language]}
        </p>
      </div>

      {/* Allergies */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q4.allergiesLabel[language]}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {allergyOptions.map((allergy) => {
            const isSelected = allergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-brand bg-brand/10 text-brand-muted'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                style={
                  isSelected
                    ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                    : {}
                }
              >
                <span className="text-sm font-medium">
                  {q4.allergiesOptions[allergy][language]}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Custom Allergy Input */}
        {allergies.includes('Other') && (
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => updateProfile({ customAllergy: e.target.value })}
            placeholder={q4.allergiesPlaceholder[language]}
            required
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
            style={{
              borderColor: customAllergy ? '#6C9A5D' : undefined,
            }}
          />
        )}
      </div>

      {/* Diet Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q4.dietLabel[language]}
        </label>
        <div className="space-y-2">
          {dietOptions.map((diet) => (
            <button
              key={diet}
              onClick={() => selectDietType(diet)}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                dietType === diet
                  ? 'border-brand bg-brand/10 text-brand-muted'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              style={
                dietType === diet
                  ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                  : {}
              }
            >
              <span className="text-sm font-medium">
                {q4.dietOptions[diet][language]}
              </span>
            </button>
          ))}
        </div>
        
        {/* Custom Diet Type Input */}
        {dietType === 'Other' && (
          <input
            type="text"
            value={customDietType}
            onChange={(e) => updateProfile({ customDietType: e.target.value })}
            placeholder={q4.dietPlaceholder[language]}
            required
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
            style={{
              borderColor: customDietType ? '#6C9A5D' : undefined,
            }}
          />
        )}
      </div>

      {/* Medical Conditions */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q4.medicalLabel[language]}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {medicalOptions.map((condition) => {
            const isSelected = medicalConditions.includes(condition);
            return (
              <button
                key={condition}
                onClick={() => toggleMedical(condition)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-brand bg-brand/10 text-brand-muted'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                style={
                  isSelected
                    ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                    : {}
                }
              >
                <span className="text-sm font-medium">
                  {q4.medicalOptions[condition][language]}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand text-white">
                    <Check size={14} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Custom Medical Condition Input */}
        {medicalConditions.includes('Other') && (
          <input
            type="text"
            value={customMedicalCondition}
            onChange={(e) => updateProfile({ customMedicalCondition: e.target.value })}
            placeholder={q4.medicalPlaceholder[language]}
            required
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
            style={{
              borderColor: customMedicalCondition ? '#6C9A5D' : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
}
