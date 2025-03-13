export async function decide(state) {
  console.log("Deciding...");
  if (state.loopCount >= state.maxLoops) {
    return "finalize";
  }
  return "search";
}