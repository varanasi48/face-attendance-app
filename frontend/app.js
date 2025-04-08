// Register Face Function
async function registerFace() {
    const imageFile = document.getElementById('registerImage').files[0];
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!imageFile || !phoneNumber) {
        alert("Please provide both an image and a phone number.");
        return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('phone', phoneNumber);

    const response = await fetch('https://attendance-system.azurewebsites.net/api/RegisterUser?code=b-PkIJLlvez6gswJP8npox4qijgsAsIce57LhUurlfe6AzFuPobCoQ==', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (response.ok) {
        alert("Face registered successfully!");
    } else {
        alert("Failed to register face: " + data.message);
    }
}

// Mark Attendance Function
async function markAttendance() {
    const imageFile = document.getElementById('attendanceImage').files[0];
    const phoneNumber = document.getElementById('attendancePhoneNumber').value;

    if (!imageFile || !phoneNumber) {
        alert("Please provide both an image and a phone number.");
        return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('phone', phoneNumber);

    const response = await fetch('https://attendance-system.azurewebsites.net/api/MarkAttendance?code=Ai5JIA1BnpU9FCVKM_HImnNyVGYyh2zYbA_PB8ZFYRCqAzFuG6QpVg==', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (response.ok) {
        alert("Attendance marked for " + data.name);
    } else {
        alert("Failed to mark attendance: " + data.message);
    }
}
