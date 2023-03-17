var express = require("express");
const { mongoclient } = require("./mongodb");
const { client } = require("./mqtt");
const durationcollection = mongoclient.db("mqttdb").collection("duration");
const dataStatusCollection = mongoclient.db("mqttdb").collection("dataStatus");
const { delay } = require("./lib/functions");
var router = express.Router();

router.get("/duration", async function (req, res) {
  await mongoclient.connect();
  let result = "no data";
  if (!req.query.filter) {
    result = await durationcollection.find().toArray();
  } else {
    const data = {
      onDuration: { $sum: "$onDuration" },
      offDuration: { $sum: "$offDuration" },
    };
    const project = {
      year: { $year: "$timestamp" },
      month: { $month: "$timestamp" },
      day: { $dayOfMonth: "$timestamp" },
      hour: { $hour: "$timestamp" },
      // min: { $minute: "$timestamp" },
      // s: { $second: "$timestamp" },
    };
    if (req.query.filter === "second") {
      result = await durationcollection
        .aggregate([
          {
            $group: {
              _id: {
                ...project,
                minute: { $minute: "$timestamp" },
                second: { $second: "$timestamp" },
              },
              ...data,
            },
          },
        ])
        .toArray();
    }
    if (req.query.filter === "minute") {
      result = await durationcollection
        .aggregate([
          {
            $group: {
              _id: {
                ...project,
                minute: { $minute: "$timestamp" },
              },
              ...data,
            },
          },
        ])
        .toArray();
    }
    if (req.query.filter === "hour") {
      result = await durationcollection
        .aggregate([
          {
            $group: {
              _id: {
                ...project,
              },
              ...data,
              // timestamp: $h,
            },
          },
        ])
        .toArray();
    }
    if (req.query.filter === "day") {
      result = await durationcollection
        .aggregate([
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              ...data,
            },
          },
        ])
        .toArray();
    }
  }
  res.send(result);
});
router.get("/dataStatus", async function (req, res) {
  client.publish("requestData", "get");
  await delay(2000);
  await mongoclient.connect();
  const result = await dataStatusCollection
    .find()
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();
  res.send(result[0]);
});
router.post("/status", function (req, res) {
  try {
    // console.log(req.body);
    client.publish("control", req.body.control);
    res.send("Successfully change led status to " + req.body.control);
  } catch (error) {
    console.log(error.message);
  }
});
router.post("/timer", async function (req, res) {
  try {
    // console.log(req.body);
    client.publish("timer", req.body.timer);
    await delay(2000);
    res.send("Successfully change timer to " + req.body.timer);
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/duration", async function (req, res) {
  try {
    client.publish("duration", req.body.duration);
    // await delay(2000);
    res.send("Successfully change duration to " + req.body.duration);
  } catch (error) {
    console.log(error.message);
  }
});
//export this router to use in our index.js
module.exports = router;
