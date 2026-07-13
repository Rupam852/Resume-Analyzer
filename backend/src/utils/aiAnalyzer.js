import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

/**
 * Analyzes a resume against a job description.
 * @param {string} resumeText - Raw text extracted from the resume
 * @param {string} [jobDescription] - Job description text
 * @returns {Promise<object>} - Structured analysis results
 */
export async function analyzeResumeWithAI(resumeText, jobDescription) {
  const provider = process.env.AI_PROVIDER || 'gemini';
  let modelName = process.env.AI_MODEL_NAME;

  // Override deprecated/invalid model names automatically
  if (modelName === 'gemini-2.5-flash') {
    modelName = 'gemini-3.5-flash';
  }

  const prompt = `
You are an expert Applicant Tracking System (ATS) and professional resume reviewer.
Analyze the following resume in the context of the provided target job description (if any).

Resume Content:
"""
${resumeText}
"""

Target Job Description:
${jobDescription ? `"""\n${jobDescription}\n"""` : "Not provided. Analyze the resume generally for its target job role."}

Analyze the resume and return a JSON object with the following fields:
- atsScore (integer from 0 to 100): An overall ATS score evaluating the alignment, structure, and keyword density.
- strengths (array of strings): 2-4 key strengths of the resume.
- weaknesses (array of strings): 2-4 areas of improvement or weaknesses.
- shortlistProbability (string): Estimated shortlist odds, e.g., "High (Around 85% compatibility)" or "Medium-Low (Around 40% compatibility)".
- structuralImprovements (array of strings): 2-4 actionable structural or formatting improvements.
- missingKeywords (array of strings): 3-6 keywords or technologies that are missing but critical/helpful.

Return ONLY a raw JSON object matching the schema. No markdown wrapping.
`;

  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseSchema = {
      type: "OBJECT",
      properties: {
        atsScore: { type: "INTEGER" },
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        weaknesses: { type: "ARRAY", items: { type: "STRING" } },
        shortlistProbability: { type: "STRING" },
        structuralImprovements: { type: "ARRAY", items: { type: "STRING" } },
        missingKeywords: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["atsScore", "strengths", "weaknesses", "shortlistProbability", "structuralImprovements", "missingKeywords"]
    };

    // Sequential fallback list in case the primary model is overloaded (503 Service Unavailable)
    const modelsToTry = [
      modelName || 'gemini-3.5-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash'
    ];

    let lastError = null;
    for (const currentModel of modelsToTry) {
      try {
        console.log(`[AI Engine] Attempting analysis using model: ${currentModel}`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Failed to retrieve content from Gemini API');
        }

        console.log(`[AI Engine] Success: Evaluated with model ${currentModel}`);
        return JSON.parse(text.trim());
      } catch (err) {
        console.warn(`[AI Engine] Model ${currentModel} failed: ${err.message}. Retrying...`);
        lastError = err;
      }
    }

    // If all models in the fallback loop fail, bubble up the final error
    throw lastError;

  } else if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = modelName || 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    const text = completion.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Failed to retrieve content from OpenAI API');
    }
    return JSON.parse(text.trim());

  } else {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}. Supported options are "gemini" or "openai".`);
  }
}
