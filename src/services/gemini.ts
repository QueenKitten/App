import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateEmotionalPrompt(emotions: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are an expert artistic prompt engineer. 
Your task is to translate a user's raw emotional description into a vivid, detailed, and evocative visual prompt for an image generation AI.
Focus on:
1. Symbolic imagery that represents the emotions.
2. Specific lighting (e.g., golden hour, harsh shadows, ethereal glow).
3. A sophisticated color palette (e.g., muted teals and burnt oranges, monochrome with a splash of crimson).
4. Artistic style (e.g., surrealism, cinematic photography, oil painting, minimalist digital art).
5. Composition and mood.

Output ONLY the final prompt text. Do not include any introductory or concluding remarks.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Emotions: ${emotions}`,
    config: {
      systemInstruction,
      temperature: 0.8,
    },
  });

  return response.text || "A beautiful abstract representation of human emotion.";
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
