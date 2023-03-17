var express = require("express");
var app = express();
var route = require("./routes");
const { mongoconnect, mongoclient } = require("./mongodb");
const { client } = require("./mqtt");
const cors = require("cors");

mongoclient.connect().catch(console.error);

client.on("connect", function () {
  client.subscribe("durationOn", function (err) {
    if (err) {
      console.log(err.message);
    }
  });
  client.subscribe("dataStatus", function (err) {
    if (err) {
      console.log(err.message);
    }
  });
});

client.on("message", async function (topic, message) {
  // message is Buffer
  // console.log(topic);
  if (topic === "durationOn") {
    const timestamp = new Date(Date.now());
    const tempMessage = message.toString().split(":");
    await mongoclient
      .db("mqttdb")
      .collection("duration")
      .insertOne({
        onDuration: parseInt(tempMessage[0]),
        offDuration: parseInt(tempMessage[1]),
        timestamp: timestamp,
      });
  }
  if (topic === "dataStatus") {
    const tempData = message.toString().split(":");
    // console.log(tempData);

    await mongoclient
      .db("mqttdb")
      .collection("dataStatus")
      .insertOne({
        status: parseInt(tempData[0]),
        timerStatus: tempData[1],
        duration: tempData[2],
        timestamp: new Date(Date.now()),
      });
  }
  // client.end();
});
app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/", route);
app.listen(8000, function () {
  console.log("info", "Server is running at port : " + 8000);
});
