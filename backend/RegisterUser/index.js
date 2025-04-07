const axios = require("axios");
const { MongoClient } = require("mongodb");

const FACE_ENDPOINT = process.env["FACE_API_ENDPOINT"];
const FACE_KEY = process.env["FACE_API_KEY"];
const PERSON_GROUP_ID = "attendance-group";
const MONGO_URI = process.env["MONGO_URI"];

module.exports = async function (context, req) {
  const { phone, imageBase64 } = req.body;

  if (!phone || !imageBase64) {
    context.res = { status: 400, body: "Missing phone or image" };
    return;
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("attendance");
  const users = db.collection("users");

  try {
    // Create person in Face API
    const createPerson = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons`,
      { name: phone },
      { headers: { "Ocp-Apim-Subscription-Key": FACE_KEY } }
    );

    const personId = createPerson.data.personId;

    // Add face to person
    await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}/persons/${personId}/persistedFaces`,
      Buffer.from(imageBase64, "base64"),
      {
        headers: {
          "Ocp-Apim-Subscription-Key": FACE_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    // Save to DB
    await users.insertOne({ phone, personId });

    context.res = { status: 200, body: "User registered successfully" };
  } catch (err) {
    context.res = { status: 500, body: err.message };
  } finally {
    await client.close();
  }
};
