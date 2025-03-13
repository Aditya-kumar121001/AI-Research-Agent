import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function summarize(state) {
  const summarizerSystemPrompt = `Your goal is to produce a high-quality summary of web search results with consistent technical depth and factual focus. Avoid redundancy and repetition.

    For EXTENDING an existing summary:
    - Integrate new information seamlessly, preserving the style and depth of the existing content.
    - Add only non-redundant details with smooth transitions.

    For a NEW summary:
    - Extract the most relevant points from each source.
    - Deliver a concise, coherent overview of key findings related to the topic.
    - Highlight significant insights.

    In both cases, output the summary directly without preamble, phrases like "based on new results," or a references section.`;

    console.log("Summarizing...");
    const prompt = state.currentSummary
      ? `${summarizerSystemPrompt}\nExtend this summary: ${state.currentSummary}\nNew information: ${state.latestResults}`
      : `${summarizerSystemPrompt}\nSummarize this for "${state.topic}": ${state.latestResults}`;


  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let summaryText = result.response.text().trim();
    summaryText = summaryText.replace(/```/g, '').trim();
    state.currentSummary = summaryText;

    console.log(`Generated summary`);
    return "reflect";
  } catch (error) {
    console.error(`Error summarizing: ${error.message}`);
    state.currentSummary = "Error occurred during summarization";
    return "reflect";
  }
}