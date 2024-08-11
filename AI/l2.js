class Lookup {
  constructor(features = [], outputs = []) {
    this.featureLookup = {};
    this.outputLookup = {};
    this.featureItems = [];
    this.outputItems = [];
    this.buildFromData(features, outputs);
  }

  buildFromData(features, outputs) {
    features.forEach(feature => this.addFeature(feature));
    outputs.forEach(output => this.addOutput(output));
  }

  addFeature(feature) {
    if (this.featureLookup[feature] === undefined) {
      this.featureLookup[feature] = this.featureItems.length;
      this.featureItems.push(feature);
    }
  }

  addOutput(output) {
    if (this.outputLookup[output] === undefined) {
      this.outputLookup[output] = this.outputItems.length;
      this.outputItems.push(output);
    }
  }

  getFeatureIndex(feature) {
    return this.featureLookup[feature];
  }

  getOutputIndex(output) {
    return this.outputLookup[output];
  }

  getFeatureName(index) {
    return this.featureItems[index];
  }

  getOutputName(index) {
    return this.outputItems[index];
  }
}

module.exports = Lookup;