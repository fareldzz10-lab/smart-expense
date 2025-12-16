import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';

// Initialize the Google GenAI client with the API key from the environment variable.
// We safely check for import.meta.env to avoid runtime crashes if environment variables are missing.
const apiKey = (import.meta as any).env?.VITE_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: apiKey });

export const geminiService = {
  /**
   * Parses natural language input into a structured transaction object.
   * Handles IDR formatting logic (e.g., '25rb' -> 25000).
   */
  async parseTransactionWithAI(input: string): Promise<Partial<Transaction> | null> {
    try {
      if (!apiKey) {
        console.warn("Gemini API Key is missing. Please check your .env file.");
        return null;
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Parse the following user input into a financial transaction JSON object.
        User Input: "${input}"
        
        Rules:
        1. "rb", "k", "thousand" means multiply by 1000.
        2. "jt", "juta", "million" means multiply by 1,000,000.
        3. Infer the category from the context (e.g., "coffee" -> "Food", "grab" -> "Transport").
        4. Determine if it is 'income' or 'expense'. Default to 'expense' if ambiguous, unless words like "salary", "received", "sold" are used.
        5. Return ONLY the JSON object.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['income', 'expense'] },
              category: { type: Type.STRING },
              date: { type: Type.STRING, description: "ISO 8601 Date String" }
            },
            required: ['title', 'amount', 'type', 'category', 'date']
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as Partial<Transaction>;
    } catch (error) {
      console.error("Error parsing transaction with AI:", error);
      return null;
    }
  },

  /**
   * Provides financial advice based on current financial data.
   */
  async getFinancialAdvice(currentData: string, userQuery: string) {
     try {
       if (!apiKey) {
          return "API Key is missing. Please check your configuration.";
       }
       const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `You are a helpful and savvy financial advisor.
         
         Context Data (User's current finances):
         ${currentData}

         User Question: "${userQuery}"

         Provide concise, actionable, and encouraging advice. Use formatting (bullet points) if necessary.`,
       });
       return response.text;
     } catch (error) {
       console.error("Error getting advice:", error);
       return "I'm having trouble connecting to the financial wisdom source right now. Please try again later.";
     }
  }
};