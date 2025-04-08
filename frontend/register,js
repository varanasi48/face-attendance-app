document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureButton = document.getElementById('captureButton');
  const imageBase64Input = document.getElementById('imageBase64');

  // Access the camera
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      alert('Error accessing the camera: ' + err);
    });

  // Capture image from the video feed
  captureButton.addEventListener('click', function() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/png');
    imageBase64Input.value = imageBase64;
  });

  // Handle the form submission
  document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const phone = document.getElementById('phone').value;
    const imageBase64 = imageBase64Input.value;

    if (!phone || !imageBase64) {
      document.getElementById('statusMessage').innerText = 'Phone number and image are required.';
      return;
    }

    try {
      const response = await fetch('YOUR_AZURE_FUNCTION_URL/RegisterUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, imageBase64 }),
      });

      if (response.ok) {
        document.getElementById('statusMessage').innerText = 'User registered successfully!';
      } else {
        document.getElementById('statusMessage').innerText = 'Failed to register user.';
      }
    } catch (error) {
      document.getElementById('statusMessage').innerText = 'Error: ' + error.message;
    }
  });
});
