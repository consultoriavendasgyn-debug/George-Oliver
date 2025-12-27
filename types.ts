
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface FoodItem {
  name: string;
  portion: string;
  nutrition: NutritionInfo;
}

export interface ExerciseSuggestion {
  activity: string;
  durationMinutes: number;
  intensity: 'leve' | 'moderada' | 'intensa';
}

export interface HealthySuggestion {
  title: string;
  description: string;
}

export interface FoodAnalysisResponse {
  mealType: 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche';
  totalCalories: number;
  idealCaloriesRange: { min: number; max: number };
  totalMacros: NutritionInfo;
  items: FoodItem[];
  healthTips: string[];
  exerciseSuggestions: ExerciseSuggestion[];
  healthyAlternatives: HealthySuggestion[];
}

export interface ProfileAnalysis {
  idealWeightRange: { min: number; max: number };
  healthStatus: string;
  heroAdvice: string;
}

export interface User {
  email: string;
  name: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  age: number;
  weight: number;
  analysis?: ProfileAnalysis;
}

export interface AnalysisHistory {
  id: string;
  timestamp: number;
  imageUrl: string;
  data: FoodAnalysisResponse;
}
