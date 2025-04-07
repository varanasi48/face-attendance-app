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
  const logs = db.collection("attendance_logs");

  try {
    // 1. Detect face
    const detectRes = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/detect?returnFaceId=true`,
      Buffer.from(imageBase64, "base64"),
      {
        headers: {
          "Ocp-Apim-Subscription-Key": FACE_KEY,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    if (!detectRes.data.length) {
      context.res = { status: 404, body: "No face detected" };
      return;
    }

    const faceId = detectRes.data[0].faceId;

    // 2. Identify face
    const identifyRes = await axios.post(
      `${FACE_ENDPOINT}/face/v1.0/identify`,
      {
        personGroupId: PERSON_GROUP_ID,
        faceIds: [faceId],
        maxNumOfCandidatesReturned: 1,
        confidenceThreshold: 0.7
      },
      {
        headers: { "Ocp-Apim-Subscription-Key": FACE_KEY }
      }
    );

    const candidates = identifyRes.data[0]?.candidates;
    if (!candidates || candidates.length === 0) {
      context.res = { status: 401, body: "Face not recognized" };
      return;
    }

    const personId = candidates[0].personId;

    // 3. Match personId to phone number in DB
    const user = await users.findOne({ phone, personId });

    if (!user) {
      context.res = { status: 403, body: "Person mismatch" };
      return;
    }

    // 4. Log attendance
    await logs.insertOne({
      phone,
      timestamp: new Date().toISOString()
    });

    context.res = { status: 200, body: "Attendance marked" };
  } catch (err) {
    context.res = { status: 500, body: err.message };
  } finally {
    await client.close();
  }
};
