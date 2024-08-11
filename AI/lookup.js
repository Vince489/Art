class Lookup2 {
  constructor(features = [], outputs = []) {
    this.featureLookup = this.createLookup(features);
    this.outputLookup = this.createLookup(outputs);
  }

  createLookup(items) {
    const lookup = {};
    items.forEach((item, index) => {
      lookup[item] = index;
    });
    return lookup;
  }

  getFeatureIndex(feature) {
    return this.featureLookup[feature];
  }

  getOutputIndex(output) {
    return this.outputLookup[output];
  }

  getFeatureName(index) {
    return Object.keys(this.featureLookup).find(key => this.featureLookup[key] === index);
  }

  getOutputName(index) {
    return Object.keys(this.outputLookup).find(key => this.outputLookup[key] === index);
  }
}

module.exports = Lookup2;
