import dotenv from 'dotenv';
dotenv.config();

import { tavily } from '@tavily/core';
const client = tavily({ apiKey: `tvly-dev-${process.env.TAVILY_API_KEY}` });

export async function performSearch(state) {
  console.log("Performing search...");
  console.log(`Perform search query on: ${state.searchQuery}`);

  if (!Array.isArray(state.sources)) {
    state.sources = [];
  }

  try {
    const response = await client.search(`${state.searchQuery}`);
    state.latestResults = response.results.map(r => `${r.title}: ${r.content}`).join('\n');

    // Map results to { title, url } objects for sources
    const newSources = response.results.map(r => ({
      title: r.title || "Untitled",
      url: r.url || "No URL provided"
    }));
    state.sources = state.sources.concat(newSources);

    state.loopCount += 1;
    console.log("Search Done...");
    return "summarize";
    
  } catch (error) {
    console.error("Search error:", error.message);
    state.latestResults = "No results available due to search error.";
    state.loopCount += 1;
    return "summarize";
  }
}