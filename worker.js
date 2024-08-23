self.onmessage = function(event) {
    const { imgData, k, refImgData, algorithm } = event.data;
    const { data: imgDataArray, width, height } = imgData;

    // Convert image data to an array of colors
    const colors = [];
    for (let i = 0; i < imgDataArray.length; i += 4) {
        colors.push([imgDataArray[i], imgDataArray[i + 1], imgDataArray[i + 2]]);
    }

    // Convert reference image data to an array of colors
    const refColors = [];
    for (let i = 0; i < refImgData.data.length; i += 4) {
        refColors.push([refImgData.data[i], refImgData.data[i + 1], refImgData.data[i + 2]]);
    }

    let quantizedColors = [];

    // Apply chosen quantization algorithm
    if (algorithm === 'medianCut') {
        quantizedColors = medianCut(colors, k);
    } else if (algorithm === 'octree') {
        quantizedColors = octree(colors, k);
    }

    // Create a map from original colors to quantized colors
    const colorMap = new Map();
    for (let i = 0; i < colors.length; i++) {
        const originalColor = JSON.stringify(colors[i]);
        const closestColor = findClosestColor(colors[i], quantizedColors);
        colorMap.set(originalColor, closestColor);
    }

    // Map the original colors to the quantized colors
    const quantizedDataArray = new Uint8ClampedArray(imgDataArray.length);
    for (let i = 0; i < imgDataArray.length; i += 4) {
        const colorKey = JSON.stringify([imgDataArray[i], imgDataArray[i + 1], imgDataArray[i + 2]]);
        const quantizedColor = colorMap.get(colorKey) || [0, 0, 0]; // Default to black if no match
        quantizedDataArray[i] = quantizedColor[0];
        quantizedDataArray[i + 1] = quantizedColor[1];
        quantizedDataArray[i + 2] = quantizedColor[2];
        quantizedDataArray[i + 3] = 255; // Alpha
    }

    self.postMessage({ quantizedData: { data: quantizedDataArray, width, height } });
};

function medianCut(colors, numColors) {
    // Implement Median Cut Algorithm here
    // This is a placeholder implementation
    return colors.slice(0, numColors); // Return array of quantized colors
}

function octree(colors, numColors) {
    // Implement Octree Algorithm here
    // This is a placeholder implementation
    return colors.slice(0, numColors); // Return array of quantized colors
}

function findClosestColor(color, palette) {
    let closestColor = palette[0];
    let minDistance = colorDistance(color, closestColor);

    for (let i = 1; i < palette.length; i++) {
        const distance = colorDistance(color, palette[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = palette[i];
        }
    }

    return closestColor;
}

function colorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2)
    );
}