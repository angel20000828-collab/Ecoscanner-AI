import { GoogleGenAI } from "@google/genai";
import { ScanItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are an expert Waste Management AI with access to a vast database of consumer products, packaging materials, and local recycling protocols.

TASK:
1. ACCURATE IDENTIFICATION: Analyze the image to identify the specific product brand, material composition, and type of waste. Use your knowledge base to determine hidden materials (e.g., plastic linings in paper cups, foil layers in chip bags).
2. COMPONENT BREAKDOWN: If the item has multiple parts, you MUST split them.
   - Coffee Cup -> "Paper Cup" (Paper) + "Plastic Lid" (Recycle) + "Sleeve" (Paper).
   - Plastic Bottle -> "Plastic Bottle" (Recycle) + "Cap" (Recycle) + "Label" (Garbage).
   - Takeout Container -> "Plastic Container" (Recycle) + "Food Leftovers" (Compost).
3. SORTING RULES (Strict):
   - Flexible Plastics (Wrappers, bags, pouches) -> Garbage (Standard curbside rule).
   - Styrofoam / Polystyrene -> Garbage.
   - Food-soiled paper (Pizza box grease) -> Compost.
   - Clean Paper -> Paper.
   - Rigid Plastic Containers -> Recycle.
   - Metal Cans / Glass Bottles -> Recycle.
   - Organic Food Waste -> Compost.

OUTPUT FORMAT:
Return a raw JSON Array only: [{ "item": "Specific Name (Material)", "bin": "Category" }, ...]
Allowed Categories: 'Compost', 'Garbage', 'Recycle', 'Paper'
Do not use markdown formatting.
`;

export const identifyTrash = async (base64Image: string): Promise<ScanItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: SYSTEM_PROMPT,
        },
      ],
    },
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON from AI response", text);
    return [];
  }
};