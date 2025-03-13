import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateQuery(state) {
  console.log("Generating query...");
  try {
    const query_writer_system_prompt = `Your goal is to generate targeted web search query.
      The query will gather information related to a specific topic. Topic: ${state.topic}

      Return your query as a JSON object:
      {{
          "query": "string",
          "aspect": "string",
          "rationale": "string"
      }}
    `
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(query_writer_system_prompt);
    let queryText = result.response.text().trim();
    
    queryText = queryText.replace(/```json/g, '').replace(/```/g, '').trim();

    const queryObj = JSON.parse(queryText);
    const query = queryObj.query;

    state.searchQuery = query;

    console.log(`Generated query: ${query}`);
    return "search";
  } catch (error) {
    console.error(`Error generating query: ${error.message}`);
    state.searchQuery = null; 
    return "search"; 
  }
}