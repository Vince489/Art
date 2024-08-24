self.onmessage = function(e) {
    const { pixels, width, height, k } = e.data;
    const quantizedPixels = kMeansQuantize(pixels, k);
    const ditheredPixels = applyDithering(quantizedPixels, width, height);
    self.postMessage(ditheredPixels);
};

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

    return pixels.map(pixel => {
        let minDistance = Infinity;
        let nearestCentroid = centroids[0];
        for (const centroid of centroids) {
            const distance = getDistance(pixel, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCentroid = centroid;
            }
        }
        return nearestCentroid;
    });
}

function getDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2)
    );
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

function applyDithering(pixels, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const oldPixel = [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
            const newPixel = nearestColor(oldPixel);
            pixels[idx] = newPixel[0];
            pixels[idx + 1] = newPixel[1];
            pixels[idx + 2] = newPixel[2];

            const quantError = [
                oldPixel[0] - newPixel[0],
                oldPixel[1] - newPixel[1],
                oldPixel[2] - newPixel[2]
            ];

            distributeError(pixels, quantError, x + 1, y, width, height, 7 / 16);
            distributeError(pixels, quantError, x - 1, y + 1, width, height, 3 / 16);
            distributeError(pixels, quantError, x, y + 1, width, height, 5 / 16);
            distributeError(pixels, quantError, x + 1, y + 1, width, height, 1 / 16);
        }
    }
    return pixels;
}

function nearestColor(pixel) {
    // Implement logic to find the nearest color from the palette (centroids)
}

function distributeError(pixels, quantError, x, y, width, height, factor) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;
    pixels[idx] += quantError[0] * factor;
    pixels[idx + 1] += quantError[1] * factor;
    pixels[idx + 2] += quantError[2] * factor;
}
