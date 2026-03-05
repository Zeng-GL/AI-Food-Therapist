"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOnboardingStore,
  Allergy,
  DietType,
  MedicalCondition,
} from "@/store/use-onboarding-store";
import { useLanguageStore } from "@/store/use-language-store";
import { onboardingText } from "@/lib/onboarding-i18n";
import { ChevronLeft, Check } from "lucide-react";
import { useSaveProfile } from "@/hooks/use-save-profile";

export default function EditDietaryPreferences() {
  const router = useRouter();
  const {
    allergies: initialAllergies,
    dietType: initialDietType,
    medicalConditions: initialMedical,
    customAllergy: initialCustomAllergy,
    customDietType: initialCustomDietType,
    customMedicalCondition: initialCustomMedical,
    updateProfile,
  } = useOnboardingStore();
  const { saveProfile } = useSaveProfile();
  const { language } = useLanguageStore();
  const isZh = language === "zh";
  const q4 = onboardingText.q4;

  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);
  const [dietType, setDietType] = useState<DietType>(initialDietType);
  const [medicalConditions, setMedicalConditions] =
    useState<MedicalCondition[]>(initialMedical);
  const [customAllergy, setCustomAllergy] = useState(initialCustomAllergy);
  const [customDietType, setCustomDietType] = useState(initialCustomDietType);
  const [customMedicalCondition, setCustomMedicalCondition] =
    useState(initialCustomMedical);

  const allergyOptions: Allergy[] = [
    "Seafood",
    "Nuts",
    "Gluten",
    "Dairy",
    "Soy",
    "Eggs",
    "Other",
    "None",
  ];
  const dietOptions: DietType[] = [
    "General",
    "Vegetarian",
    "Vegan",
    "No_Beef",
    "No_Pork",
    "Other",
  ];
  const medicalOptions: MedicalCondition[] = [
    "G6PD",
    "Diabetes",
    "Hypertension",
    "Kidney_Disease",
    "Other",
    "None",
  ];

  const toggleAllergy = (allergy: Allergy) => {
    if (allergy === "None") {
      setAllergies(["None"]);
      setCustomAllergy("");
    } else {
      const filtered = allergies.filter((a) => a !== "None");
      if (allergies.includes(allergy)) {
        const updated = filtered.filter((a) => a !== allergy);
        setAllergies(updated.length === 0 ? ["None"] : updated);
        if (allergy === "Other") {
          setCustomAllergy("");
        }
      } else {
        setAllergies([...filtered, allergy]);
      }
    }
  };

  const selectDietType = (diet: DietType) => {
    setDietType(diet);
    if (dietType === "Other" && diet !== "Other") {
      setCustomDietType("");
    }
  };

  const toggleMedical = (condition: MedicalCondition) => {
    if (condition === "None") {
      setMedicalConditions(["None"]);
      setCustomMedicalCondition("");
    } else {
      const filtered = medicalConditions.filter((m) => m !== "None");
      if (medicalConditions.includes(condition)) {
        const updated = filtered.filter((m) => m !== condition);
        setMedicalConditions(updated.length === 0 ? ["None"] : updated);
        if (condition === "Other") {
          setCustomMedicalCondition("");
        }
      } else {
        setMedicalConditions([...filtered, condition]);
      }
    }
  };

  const handleSave = async () => {
    updateProfile({
      allergies,
      dietType,
      medicalConditions,
      customAllergy,
      customDietType,
      customMedicalCondition,
    });

    await saveProfile({
      allergies,
      dietType,
      medicalConditions,
      customAllergy,
      customDietType,
      customMedicalCondition,
    });

    router.push("/profile/health-profile");
  };

  // Validation
  const hasOtherAllergy = allergies.includes("Other");
  const hasOtherDiet = dietType === "Other";
  const hasOtherMedical = medicalConditions.includes("Other");

  const isValid =
    (!hasOtherAllergy || customAllergy.trim()) &&
    (!hasOtherDiet || customDietType.trim()) &&
    (!hasOtherMedical || customMedicalCondition.trim());

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/profile/health-profile")}
              className="mr-3 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {isZh ? "飲食偏好與禁忌" : "Dietary Preferences"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="text-brand-muted font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: isValid ? "#6C9A5D" : undefined }}
          >
            {isZh ? "儲存" : "Save"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 space-y-8">
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
                      ? "border-brand bg-brand/10 text-brand-muted"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: "#6C9A5D",
                          backgroundColor: "rgba(108,154,93,0.1)",
                          color: "#6C9A5D",
                        }
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
          {allergies.includes("Other") && (
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              placeholder={q4.allergiesPlaceholder[language]}
              required
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
              style={{
                borderColor: customAllergy ? "#6C9A5D" : undefined,
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
                    ? "border-brand bg-brand/10 text-brand-muted"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
                style={
                  dietType === diet
                    ? {
                        borderColor: "#6C9A5D",
                        backgroundColor: "rgba(108,154,93,0.1)",
                        color: "#6C9A5D",
                      }
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
          {dietType === "Other" && (
            <input
              type="text"
              value={customDietType}
              onChange={(e) => setCustomDietType(e.target.value)}
              placeholder={q4.dietPlaceholder[language]}
              required
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
              style={{
                borderColor: customDietType ? "#6C9A5D" : undefined,
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
                      ? "border-brand bg-brand/10 text-brand-muted"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: "#6C9A5D",
                          backgroundColor: "rgba(108,154,93,0.1)",
                          color: "#6C9A5D",
                        }
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
          {medicalConditions.includes("Other") && (
            <input
              type="text"
              value={customMedicalCondition}
              onChange={(e) => setCustomMedicalCondition(e.target.value)}
              placeholder={q4.medicalPlaceholder[language]}
              required
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-brand focus:outline-none transition-all"
              style={{
                borderColor: customMedicalCondition ? "#6C9A5D" : undefined,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
