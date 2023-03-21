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
    const match = [];
    if (req.query.start && req.query.end) {
      const start = new Date(req.query.start);
      let end = new Date(req.query.end);
      if (start < end) {
        if (new Date().toDateString() === end.toDateString()) {
          end = new Date(Date.now());
        }
        match.push({
          $match: {
            timestamp: { $gte: start, $lte: end },
          },
        });
      }
    }
    // console.log(match);

    if (req.query.filter === "second") {
      match.push({
        $group: {
          _id: {
            ...project,
            minute: { $minute: "$timestamp" },
            second: { $second: "$timestamp" },
          },
          ...data,
        },
      });
      result = await durationcollection.aggregate(match).toArray();
    }
    if (req.query.filter === "minute") {
      match.push({
        $group: {
          _id: {
            ...project,
            minute: { $minute: "$timestamp" },
          },
          ...data,
        },
      });
      result = await durationcollection.aggregate(match).toArray();
    }
    if (req.query.filter === "hour") {
      match.push({
        $group: {
          _id: {
            ...project,
          },
          ...data,
          // timestamp: $h,
        },
      });
      result = await durationcollection.aggregate(match).toArray();
    }
    if (req.query.filter === "day") {
      match.push({
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          ...data,
        },
      });
      result = await durationcollection.aggregate(match).toArray();
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
    client.publish("ledControl", req.body.control);
    res.send("Successfully change led status to " + req.body.control);
  } catch (error) {
    console.log(error.message);
  }
});
router.post("/timer", async function (req, res) {
  try {
    // console.log(req.body);
    client.publish("ledTimer", req.body.timer);
    await delay(2000);
    res.send("Successfully change timer to " + req.body.timer);
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/duration", async function (req, res) {
  // console.log(req.body.duration);
  try {
    client.publish("ledDuration", req.body.duration.toString());
    // await delay(2000);
    res.send("Successfully change duration to " + req.body.duration);
  } catch (error) {
    console.log(error.message);
  }
});
//export this router to use in our index.js
module.exports = router;
