import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function reflect(state) {
  console.log("Reflecting...");
  const reflection_system_prompt =  `You are an expert research assistant analyzing a summary about ${state.topic}: ${state.currentSummary}.

  Your tasks:
  1. Identify knowledge gaps or areas that need deeper exploration
  2. Generate a follow-up question that would help expand your understanding
  3. Focus on technical details, implementation specifics, or emerging trends that weren't fully covered
  
  Ensure the follow-up question is self-contained and includes necessary context for web search.
  
  Return your analysis as a JSON object:
  {{ 
      "knowledge_gap": "string",
      "follow_up_query": "string"
  }}
  `
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(reflection_system_prompt);

    let responseText = result.response.text().trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const resultJson = JSON.parse(responseText);
    state.searchQuery = resultJson.follow_up_query;
    console.log(state.searchQuery)
    console.log(`Reflected`);
    return "decide";

  } catch (error) {
    console.error(`Error reflecting: ${error.message}`);
    state.searchQuery = null; 
    return "decide";
  }
}