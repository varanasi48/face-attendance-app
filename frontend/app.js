const video = document.getElementById("video");
const phoneInput = document.getElementById("phone");

// 1. Start the webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("Error accessing webcam: " + err.message);
  });

// 2. Capture image from webcam
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg").split(",")[1]; // base64 without prefix
}

// 3. Call backend to register user
async function register() {
  const phone = phoneInput.value;
  if (!phone) return alert("Enter phone number");

  const imageBase64 = captureImage();
  const response = await fetch("/api/RegisterUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, imageBase64 })
  });

  const result = await response.text();
  alert("Register: " + result);
}

// 4. Call backend to mark attendance
async function markAttendance() {
  const phone = phoneInput.value;
  if (!phone) return alert("Enter phone number");

  const imageBase64 = captureImage();
  const response = await fetch("/api/MarkAttendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, imageBase64 })
  });

  const result = await response.text();
  alert("Attendance: " + result);
}
