const { runPartM } = require('./percy.partM.bridge');

Percy.PartM = {
  hypotheses: [],

  async run() {
    const patterns = Percy.PartL?.Patterns || [];
    const result = await runPartM(patterns, Percy.PartL, Percy.PartN);

    Percy.PartM.hypotheses = result.hypotheses || [];

    if (Percy.PartN?.selfModel) {
      Percy.PartN.selfModel.confidence = result.confidence;
    }
  }
};
