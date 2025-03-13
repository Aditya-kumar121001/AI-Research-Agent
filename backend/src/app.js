import express from 'express';
import { ResearchState } from './models/researchState.js';
import { generateQuery } from './tools/generateQuery.js';
import { performSearch } from './tools/performSearch.js';
import { summarize } from './tools/summarize.js';
import { reflect } from './tools/reflect.js';
import { decide } from './tools/decide.js';
import { finalize } from './tools/finalize.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const tools = {
  search: performSearch,
  summarize,
  reflect,
  decide,
  finalize
};

async function runResearch(topic) {
  const state = new ResearchState();
  state.topic = topic
  let nextStep = "generate_query";
  while (nextStep !== "stop") {
    if (nextStep === "generate_query") {
      nextStep = await generateQuery(state);
    } else {
      nextStep = await tools[nextStep](state);
    }
  }
  return {
    topic: state.topic,
    summary: state.currentSummary,
    sources: state.sources
  } || "No summary generated";
}

app.post('/research', async (req, res) => {
  const { topic } = req.body;
  console.log(`Topic: ${topic}`)
  if (!topic) return res.status(400).json({ error: "Topic required" });
  try {
    const result = await runResearch(topic);
    console.log(result)
    //console.log(`Final response to bot : ${state.topic}, ${state.currentSummary}, ${state.sources}`)
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Research failed" });
  }
});

export default app;