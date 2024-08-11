const Lookup = require('./lookup');

class DataProcessor {
  constructor() {
    this.lookup = null;
  }

  initialize(features, outputs) {
    this.lookup = new Lookup(features, outputs);
  }

  addIntentsAndResponses(corpus, newIntents) {
    // Update corpus with new intents and responses
    corpus.forEach(entry => {
      Object.keys(newIntents).forEach(intent => {
        if (!entry.output[intent]) {
          entry.output[intent] = newIntents[intent];
        }
      });
    });
    return this.prepareData(corpus);
  }
  
  prepareData(corpus) {
    return corpus.map(entry => {
      const { input, output } = entry;
      return {
        inputData: this.transformInput(input),
        outputData: this.transformOutput(output),
      };
    });
  }

  transformInput(input) {
    const indices = [];
    const values = [];
    Object.keys(input).forEach(feature => {
      const index = this.lookup.getFeatureIndex(feature);
      if (index !== undefined) {
        indices.push(index);
        values.push(input[feature]);
      }
    });
    return { indices, values };
  }

  transformOutput(output) {
    const result = {};
    Object.keys(output).forEach(label => {
      const index = this.lookup.getOutputIndex(label);
      if (index !== undefined) {
        result[index] = output[label];
      }
    });
    return result;
  }
}

module.exports = DataProcessor;
