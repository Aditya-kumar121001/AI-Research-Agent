export async function finalize(state) {
  console.log("Finalizing...");
  // console.log("Sources:", state.sources);

  const validSources = Array.isArray(state.sources)
    ? state.sources.filter(source => source && typeof source === 'object' && source.title && source.url)
    : [];

  const sourcesText = validSources.length > 0
    ? validSources.map(s => `- ${s.title} (${s.url})`).join('\n')
    : "No valid sources available.";

  // Update the summary with topic, content, and sources
  state.currentSummary = `# Research on ${state.topic}\n\n${state.currentSummary}\n\n## Sources\n${sourcesText}`;
  
  console.log("Final summary:", state.currentSummary);
  return "stop";
}