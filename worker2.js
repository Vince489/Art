// worker.js
self.onmessage = function(event) {
  const { imageData, k, refPixels } = event.data;
  const pixels = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
      pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
  }

  const refPalette = kMeansQuantize(refPixels, k);

  // Map colors from original image to reference palette
  const mappedPixels = pixels.map(pixel => {
      let minDistance = Infinity;
      let closestColor = refPalette[0];
      for (const refColor of refPalette) {
          const distance = getDistance(pixel, refColor);
          if (distance < minDistance) {
              minDistance = distance;
              closestColor = refColor;
          }
      }
      return closestColor;
  });

  // Adjust colors for shades based on luminance
  const quantizedData = new Uint8ClampedArray(imageData.data.length);
  for (let i = 0; i < mappedPixels.length; i++) {
      const [r, g, b] = mappedPixels[i];
      quantizedData[i * 4] = r;
      quantizedData[i * 4 + 1] = g;
      quantizedData[i * 4 + 2] = b;
      quantizedData[i * 4 + 3] = 255; // Alpha channel
  }

  postMessage({ quantizedData });
}

function kMeansQuantize(pixels, k) {
  let centroids = [];
  for (let i = 0; i < k; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  let clusters = Array.from({ length: k }, () => []);
  let oldCentroids = [];
  let maxIterations = 10;
  let iteration = 0;

  while (!areCentroidsEqual(centroids, oldCentroids) && iteration < maxIterations) {
      clusters = Array.from({ length: k }, () => []);
      for (const pixel of pixels) {
          let minDistance = Infinity;
          let clusterIndex = 0;
          for (let i = 0; i < centroids.length; i++) {
              const distance = getDistance(pixel, centroids[i]);
              if (distance < minDistance) {
                  minDistance = distance;
                  clusterIndex = i;
              }
          }
          clusters[clusterIndex].push(pixel);
      }

      oldCentroids = centroids.map(centroid => [...centroid]);
      centroids = clusters.map(cluster => {
          if (cluster.length === 0) return [0, 0, 0];
          const sum = cluster.reduce((acc, pixel) => [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]], [0, 0, 0]);
          return [Math.floor(sum[0] / cluster.length), Math.floor(sum[1] / cluster.length), Math.floor(sum[2] / cluster.length)];
      });

      iteration++;
  }

  return centroids;
}

function areCentroidsEqual(centroids1, centroids2) {
  if (centroids1.length !== centroids2.length) return false;
  for (let i = 0; i < centroids1.length; i++) {
      if (!centroids1[i].every((value, index) => value === centroids2[i][index])) {
          return false;
      }
  }
  return true;
}

function getDistance(color1, color2) {
  return Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
      Math.pow(color1[1] - color2[1], 2) +
      Math.pow(color1[2] - color2[2], 2)
  );
}
