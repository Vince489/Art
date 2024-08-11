const DataProcessor = require('./data-processor'); // Handles data transformation and preparation

const DEFAULT_CONFIG = {
  epochs: 20000,
  errorThreshold: 0.00005,
  deltaErrorThreshold: 0.000001,
  learningRate: 0.6,
  momentum: 0.5,
  activationAlpha: 0.07,
  enableLogging: false,
};

class SimpleNeuralNetwork {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logFunction = this.config.enableLogging ? this.createLogger() : null;
    this.neurons = [];
    this.featureCount = 0;
    this.outputLabels = [];
  }

  createLogger() {
    return (status, duration) =>
      console.log(`Epoch ${status.epoch} Error ${status.error} Duration ${duration}ms`);
  }

  setupNetwork(inputFeatures, outputLabels) {
    this.featureCount = inputFeatures.length;
    this.outputLabels = outputLabels;
    this.neurons = outputLabels.map((label, index) => ({
      label,
      id: index,
      weights: new Float32Array(this.featureCount),
      weightChanges: new Float32Array(this.featureCount),
      bias: 0,
    }));
  }

  calculateOutput(neuron, inputData) {
    const sum = inputData.indices.reduce(
      (total, index) => total + inputData.values[index] * neuron.weights[index],
      neuron.bias
    );
    return sum <= 0 ? 0 : this.config.activationAlpha * sum;
  }

  applyInput(inputData) {
    return this.neurons.reduce((results, neuron) => {
      results[neuron.label] = this.calculateOutput(neuron, inputData);
      return results;
    }, {});
  }

  trainModel(corpus) {
    if (!corpus.length) return {};

    const data = this.processCorpus(corpus);
    let previousError = Infinity;
    const { epochs, errorThreshold, deltaErrorThreshold } = this.config;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const startTime = new Date();
      this.config.learningRate /= 1 + 0.001 * epoch;

      let totalError = 0;
      for (const neuron of this.neurons) {
        totalError += this.trainNeuron(neuron, data);
      }
      totalError /= this.neurons.length * data.length;

      const deltaError = Math.abs(totalError - previousError);
      previousError = totalError;

      if (this.logFunction) {
        this.logFunction({ epoch, error: totalError, deltaError }, new Date() - startTime);
      }

      if (totalError <= errorThreshold && deltaError <= deltaErrorThreshold) break;
    }

    return { error: previousError };
  }

  trainNeuron(neuron, data) {
    const { learningRate, momentum } = this.config;
    const { weights, weightChanges } = neuron;
    let totalError = 0;

    for (const { inputData, outputData } of data) {
      const actualOutput = this.calculateOutput(neuron, inputData);
      const expectedOutput = outputData[neuron.id] || 0;
      const error = expectedOutput - actualOutput;
      totalError += error ** 2;

      if (error) {
        const delta = (actualOutput > 0 ? 1 : this.config.activationAlpha) * error * learningRate;
        for (let i = 0; i < inputData.indices.length; i++) {
          const index = inputData.indices[i];
          const change = delta * inputData.values[index] + momentum * weightChanges[index];
          weightChanges[index] = change;
          weights[index] += change;
        }
        neuron.bias += delta;
      }
    }

    return totalError;
  }

  processCorpus(corpus) {
    const processor = new DataProcessor();
    return processor.prepareData(corpus);
  }

  predict(inputData) {
    return this.applyInput(this.transformInput(inputData));
  }

  transformInput(input) {
    return this.dataProcessor.transformInput(input);
  }

  saveToJSON() {
    return {
      config: this.config,
      features: this.featureCount,
      outputs: this.outputLabels,
      neurons: this.neurons.map(neuron => ({
        weights: Array.from(neuron.weights),
        bias: neuron.bias,
      })),
    };
  }

  loadFromJSON(json) {
    this.config = { ...DEFAULT_CONFIG, ...json.config };
    this.setupNetwork(json.features, json.outputs);
    this.neurons.forEach((neuron, index) => {
      const data = json.neurons[index];
      neuron.weights.set(data.weights);
      neuron.bias = data.bias;
    });
  }
}

module.exports = SimpleNeuralNetwork;
