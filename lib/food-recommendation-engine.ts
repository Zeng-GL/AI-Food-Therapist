import { getTongueData, FoodItem, TongueType } from './tongue-data';
import { OnboardingProfile } from '@/store/use-onboarding-store';

/**
 * Food Recommendation Engine
 * Filters and ranks food recommendations based on user's dietary restrictions and health goals
 */

export interface FilteredFoodRecommendation extends FoodItem {
  reason?: { en: string; zh: string };
  score: number; // Higher score = better match
}

export function getRecommendedFoods(
  resultCode: TongueType,
  userProfile: OnboardingProfile | null,
  maxResults: number = 3
): FilteredFoodRecommendation[] {

  if (resultCode) {


    // console.log('resultCode:', resultCode)


    // Get tongue-specific foods
    const tongueData = getTongueData(resultCode);
    // console.log('tongueData:', tongueData)


    let foods = [...tongueData.foods] as FilteredFoodRecommendation[];
    // console.log('foods:', foods)

    // Initialize scores
    foods = foods.map(food => ({ ...food, score: 0 }));

    // If no user profile, return default foods
    if (!userProfile) {
      return foods.slice(0, maxResults);
    }

    // Filter based on dietary restrictions
    foods = filterByAllergies(foods, userProfile.allergies);
    foods = filterByDietType(foods, userProfile.dietType);
    foods = filterByMedicalConditions(foods, userProfile.medicalConditions);

    // Rank by health goals
    foods = rankByHealthGoals(foods, userProfile.primaryGoals);

    // Sort by score (descending)
    foods.sort((a, b) => b.score - a.score);

    // Return top N results
    return foods.slice(0, maxResults);
  } else {
    return [];
  }
}

/**
 * Filter out foods with allergens
 */
function filterByAllergies(foods: FilteredFoodRecommendation[], allergies: string[]): FilteredFoodRecommendation[] {
  // If user selected 'None', no filtering needed
  if (allergies.includes('None') || allergies.length === 0) {
    return foods;
  }

  return foods.filter(food => {
    if (!food.allergens || food.allergens.length === 0) {
      return true;
    }

    // Check if food contains any of user's allergens
    const hasAllergen = food.allergens.some(allergen => allergies.includes(allergen));
    return !hasAllergen;
  });
}

/**
 * Filter by diet type (Vegan, Vegetarian, etc.)
 */
function filterByDietType(foods: FilteredFoodRecommendation[], dietType: string): FilteredFoodRecommendation[] {
  if (dietType === 'General') {
    return foods;
  }

  if (dietType === 'Vegan') {
    return foods.filter(food => food.isVegan);
  }

  if (dietType === 'Vegetarian') {
    return foods.filter(food => food.isVegetarian);
  }

  // For No_Beef, No_Pork - in our current data, all foods are plant-based
  // So no filtering needed. In future, add animal product tags.
  return foods;
}

/**
 * Filter out foods contraindicated for medical conditions
 */
function filterByMedicalConditions(foods: FilteredFoodRecommendation[], conditions: string[]): FilteredFoodRecommendation[] {
  // If user selected 'None', no filtering needed
  if (conditions.includes('None') || conditions.length === 0) {
    return foods;
  }

  return foods.filter(food => {
    if (!food.contraindications || food.contraindications.length === 0) {
      return true;
    }

    // Check if food is contraindicated for any of user's conditions
    const hasContraindication = food.contraindications.some(condition =>
      conditions.includes(condition)
    );
    return !hasContraindication;
  });
}

/**
 * Rank foods by how well they match user's health goals
 */
function rankByHealthGoals(foods: FilteredFoodRecommendation[], healthGoals: string[]): FilteredFoodRecommendation[] {
  return foods.map(food => {
    let score = 0;

    if (food.benefits && healthGoals.length > 0) {
      // Count how many user goals this food addresses
      const matchCount = healthGoals.filter(goal =>
        food.benefits!.includes(goal)
      ).length;

      // Add score based on match count
      score += matchCount * 10;
    }

    return { ...food, score };
  });
}

/**
 * Get reason text for why this food was recommended
 */
export function getRecommendationReason(
  food: FoodItem,
  userProfile: OnboardingProfile | null
): { en: string; zh: string } | undefined {
  if (!userProfile || !food.benefits || food.benefits.length === 0) {
    return undefined;
  }

  const matchedGoals = userProfile.primaryGoals.filter(goal =>
    food.benefits!.includes(goal)
  );

  if (matchedGoals.length === 0) {
    return undefined;
  }

  // Map goal to text
  const goalText: Record<string, { en: string; zh: string }> = {
    sleep_quality: { en: 'Good for sleep', zh: '改善睡眠' },
    digestion: { en: 'Aids digestion', zh: '助消化' },
    fatigue_relief: { en: 'Boosts energy', zh: '提升精力' },
    skin_health: { en: 'Good for skin', zh: '改善皮膚' },
    general_wellness: { en: 'Overall health', zh: '整體健康' },
  };

  const reason = goalText[matchedGoals[0]];
  return reason;
}
