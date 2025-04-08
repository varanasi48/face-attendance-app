const axios = require("axios");
const { MongoClient } = require("mongodb");

const FACE_ENDPOINT = process.env["FACE_API_ENDPOINT"];
const FACE_KEY = process.env["FACE_API_KEY"];
const PERSON_GROUP_ID = "attendance-group";  // Ensure this person group is created in Azure Face API
const MONGO_URI = process.env["MONGO_URI"];

module.exports = async function (context, req) {
  const { phone, imageBase64 } = req.body;

  // Validate request body
  if (!phone || !imageBase64) {
    context.res = { status: 400, body: "Missing phone or image" };
    return;
  }

  const client = new MongoClient(MONGO_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("attendance");
    const users = db.collection("users");

    // Check if the user is already registered
    const existingUser = await users.findOne({ phone });
    if (existingUser) {
      context.res = { status: 400, body: "User already registered" };
      return;
    }

    // Create person in Face API
    const createPersonResponse = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons`,
      { name: phone },
      { headers: { "Ocp-Apim-Subscription-Key": FACE_KEY } }
    );

    const personId = createPersonResponse.data.personId;

    // Add face to person
    const addFaceResponse = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons/${personId}/persistedFaces`,
      Buffer.from(imageBase64, "base64"),
      {
        headers: {
          "Ocp-Apim-Subscription-Key": FACE_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    if (addFaceResponse.status !== 200) {
      throw new Error("Failed to add face to person in Azure Face API");
    }

    // Save user to MongoDB
    await users.insertOne({ phone, personId });

    // Respond with success
    context.res = { status: 200, body: "User registered successfully" };
  } catch (err) {
    // Handle errors and provide appropriate feedback
    context.res = { status: 500, body: `Error: ${err.message}` };
  } finally {
    // Close MongoDB connection
    await client.close();
  }
};
