var express = require("express");
const { mongoclient } = require("./mongodb");
const durationcollection = mongoclient.db("mqttdb").collection("durationOn");
const statuscollection = mongoclient.db("mqttdb").collection("status");
var router = express.Router();

router.get("/durationOn", async function (req, res) {
  await mongoclient.connect();
  const result = await durationcollection.find().toArray();
  res.send(result);
});
router.get("/status", async function (req, res) {
  await mongoclient.connect();
  const result = await statuscollection
    .find()
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();
  res.send(result[0]);
});

//export this router to use in our index.js
module.exports = router;
