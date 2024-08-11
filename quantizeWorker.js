self.onmessage = function(e) {
    const { pixels, k } = e.data;
    const quantizedPixels = kMeansQuantize(pixels, k);
    self.postMessage(quantizedPixels);
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
