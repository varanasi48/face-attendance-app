const axios = require("axios");

const FACE_ENDPOINT = process.env["FACE_API_ENDPOINT"];
const FACE_KEY = process.env["FACE_API_KEY"];
const PERSON_GROUP_ID = "attendance-group";

module.exports = async function (context, req) {
  try {
    await axios.put(
      `${FACE_ENDPOINT}/face/v1.0/persongroups/${PERSON_GROUP_ID}`,
      {
        name: "Attendance Group",
        userData: "Group for attendance app",
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": FACE_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    context.res = {
      status: 200,
      body: "Person group created!",
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: err.message,
    };
  }
};
