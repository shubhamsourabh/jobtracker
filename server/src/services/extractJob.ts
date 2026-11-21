import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const jobSchema = z.object({
    company: z.string(),
    role: z.string(),
    skills: z.array(z.string()),
});

export async function extractJobDetails(description: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL!,
        contents: `Extract company, role and skills (array of strings) from this job description:\n\n${description}`,
        config: {
            systemInstruction:
                "You extract details from job descriptions. Reply with JSON only.",
            responseMimeType: "application/json",
        },
    });

    if (!response.text) throw new Error("Empty response");
    return response.text;
}

export type ExtractedJob = z.infer<typeof jobSchema>;

export async function extractJob(description: string): Promise<ExtractedJob> {
  const MAX_TRIES = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      const text = await extractJobDetails(description);
      return jobSchema.parse(JSON.parse(text)); // success: return and stop
    } catch (err) {
      lastError = err;
      console.warn(`extract attempt ${attempt} failed`);
    }
  }

  throw lastError; // both tries failed: the route's catch sends the 502
}