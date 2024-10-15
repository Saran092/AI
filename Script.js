const URL = "./my_model/";
let model, maxPredictions;

// Load the model when the page loads
window.onload = async function () {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("Model loaded successfully.");
};

// Use webcam input
async function useWebcam() {
    document.getElementById('webcam-container').style.display = 'block';
    document.getElementById('image-upload-container').style.display = 'none';
    
    // Setup the webcam stream
    const video = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;  // Attach the webcam stream to the video element
        video.onloadedmetadata = () => video.play();  // Ensure the video plays once loaded
    } catch (err) {
        console.error("Error accessing the webcam: ", err);
    }
}

// Use image upload input
function useImageUpload() {
    document.getElementById('webcam-container').style.display = 'none';
    document.getElementById('image-upload-container').style.display = 'block';
}

// Load and display uploaded image
function loadImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById('image-preview');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            predictFromCanvas(canvas);
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Predict from webcam
async function predictFromWebcam() {
    const video = document.getElementById('webcam');
    const prediction = await model.predict(video);  // Use video element for prediction
    displayBestPrediction(prediction);
}

// Predict from uploaded image
async function predictFromCanvas(canvas) {
    const prediction = await model.predict(canvas);  // Use canvas for prediction
    displayBestPrediction(prediction);
}

// Display the best prediction (highest probability)
function displayBestPrediction(prediction) {
    let maxProb = -1;
    let bestPrediction = '';
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > maxProb) {
            maxProb = prediction[i].probability;
            bestPrediction = prediction[i].className;
        }
    }
    document.getElementById('label-container').innerHTML =
        `Prediction: ${bestPrediction} (${(maxProb * 100).toFixed(2)}%)`;
}