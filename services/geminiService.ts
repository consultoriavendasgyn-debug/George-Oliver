
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResponse, ProfileAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateProfileStatus = async (user: { name: string; gender: string; age: number; weight: number }): Promise<ProfileAnalysis> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Você é o Oráculo de Zeus, um mestre em fisiologia e nutrição. 
  Com base nos dados deste herói:
  Nome: ${user.name}
  Sexo: ${user.gender}
  Idade: ${user.age} anos
  Peso Atual: ${user.weight} kg

  1. Calcule a faixa de peso ideal (min e max) baseada em parâmetros de saúde.
  2. Determine um "Status de Saúde" criativo (ex: "Peso de Batalha", "Em Ascensão", "Físico Divino").
  3. Dê um conselho de herói curto (máximo 20 palavras) focado em longevidade.
  
  Retorne estritamente em JSON no idioma Português.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          idealWeightRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
            },
            required: ["min", "max"]
          },
          healthStatus: { type: Type.STRING },
          heroAdvice: { type: Type.STRING }
        },
        required: ["idealWeightRange", "healthStatus", "heroAdvice"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResponse> => {
  const model = "gemini-3-flash-preview";

  const prompt = `Analise esta imagem de comida com o poder de Zeus. 
  1. Identifique o tipo de refeição (Café da Manhã, Almoço, Jantar ou Lanche).
  2. Identifique os itens e porções detalhadas.
  3. Calcule calorias totais, proteínas, carboidratos e gorduras.
  4. Defina uma faixa de calorias ideal para esse tipo específico de refeição.
  5. Sugira 3 atividades físicas e o tempo necessário para queimar o total de calorias identificado.
  6. MUITO IMPORTANTE: Sugira 3 alternativas ou melhorias mais saudáveis para esta refeição específica, focando em equilíbrio nutricional e substituições inteligentes.
  Responda estritamente em JSON no idioma Português.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mealType: { type: Type.STRING },
          totalCalories: { type: Type.NUMBER },
          idealCaloriesRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
            },
            required: ["min", "max"]
          },
          totalMacros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fats"]
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                portion: { type: Type.STRING },
                nutrition: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER },
                  }
                },
              },
            },
          },
          healthTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          exerciseSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                activity: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                intensity: { type: Type.STRING },
              },
              required: ["activity", "durationMinutes", "intensity"]
            }
          },
          healthyAlternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"]
            }
          }
        },
        required: ["mealType", "totalCalories", "idealCaloriesRange", "totalMacros", "items", "healthTips", "exerciseSuggestions", "healthyAlternatives"],
      },
    },
  });

  const result = response.text;
  return JSON.parse(result);
};
