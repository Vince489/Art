// Select DOM elements
const imageUpload = document.getElementById('imageUpload');
const resizeButton = document.getElementById('resizeButton');
const outputCanvas = document.getElementById('outputCanvas');
const ctx = outputCanvas.getContext('2d');
const widthSelect = document.getElementById('widthSelect');

let image = new Image();

// Handle image upload
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            image.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Generate pixel art by downscaling and then upscaling
resizeButton.addEventListener('click', () => {
    if (image.src) {
        // Get the selected width from the dropdown
        const scaleDownWidth = parseInt(widthSelect.value);
        const scaleDownHeight = Math.floor((image.height / image.width) * scaleDownWidth);

        const scaleFactor = 4;  // Factor to upscale by
        const finalWidth = scaleDownWidth * scaleFactor;
        const finalHeight = scaleDownHeight * scaleFactor;

        // Create a temporary canvas for downscaling
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = scaleDownWidth;
        tempCanvas.height = scaleDownHeight;

        // Draw the downscaled image on the temporary canvas
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(image, 0, 0, scaleDownWidth, scaleDownHeight);

        // Set the output canvas to the upscaled size
        outputCanvas.width = finalWidth;
        outputCanvas.height = finalHeight;

        // Draw the upscaled image on the output canvas
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, scaleDownWidth, scaleDownHeight, 0, 0, finalWidth, finalHeight);
    } else {
        alert("Please upload an image first.");
    }
});
