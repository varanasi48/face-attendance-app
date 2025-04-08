const axios = require("axios");
const { MongoClient } = require("mongodb");

const FACE_ENDPOINT = process.env["FACE_API_ENDPOINT"];
const FACE_KEY = process.env["FACE_API_KEY"];
const PERSON_GROUP_ID = "attendance-group";
const MONGO_URI = process.env["MONGO_URI"];

module.exports = async function (context, req) {
  context.log("RegisterUser function called");

  try {
    const { phone, imageBase64 } = req.body || {};

    if (!phone || !imageBase64) {
      context.log.error("Missing phone or imageBase64 in request body");
      context.res = { status: 400, body: "Missing phone or image" };
      return;
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    context.log("Connected to MongoDB");

    const db = client.db("attendance");
    const users = db.collection("users");

    // Create person in Face API
    const createPersonResponse = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons`,
      { name: phone },
      { headers: { "Ocp-Apim-Subscription-Key": FACE_KEY } }
    );

    const personId = createPersonResponse.data.personId;
    context.log("Created person with ID:", personId);

    // Add face
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
    context.log("Added face to person:", addFaceResponse.data);

    // Save to DB
    await users.insertOne({ phone, personId });
    context.log("User saved to DB");

    context.res = { status: 200, body: "User registered successfully" };
  } catch (err) {
    context.log.error("Function failed:", err.message);
    context.res = { status: 500, body: "Internal Server Error: " + err.message };
  }
};
