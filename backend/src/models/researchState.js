export class ResearchState {
    constructor(topic) {
      this.topic = topic;
      this.searchQuery = null;
      this.currentSummary = null;
      this.sources = [];
      this.latestResults = null;
      this.loopCount = 0;
      this.maxLoops = 2;
    }
  }