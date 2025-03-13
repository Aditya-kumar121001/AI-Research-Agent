export async function finalize(state) {
  console.log("Finalizing...");
  // console.log("Sources:", state.sources);

  // Update the summary with topic, content, and sources
  state.currentSummary = `${state.currentSummary}`;
  
  //console.log("Final summary:", state.currentSummary);
  return "stop";
}