var express = require("express");
var app = express();
var route = require("./routes");
const mqtt = require("mqtt");
const { mongoconnect, mongoclient } = require("./mongodb");
// mongoconnect().catch(console.error);
mongoclient.connect().catch(console.error);

const host = "broker.emqx.io";
const port = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `mqtt://${host}:${port}`;
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});
client.on("connect", function () {
  client.subscribe("durationOn", function (err) {
    if (err) {
      console.log(err.message);
    }
  });
  client.subscribe("ledStatus", function (err) {
    if (err) {
      console.log(err.message);
    }
  });
});

client.on("message", async function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  if (topic === "durationOn") {
    await mongoclient
      .db("mqttdb")
      .collection("durationOn")
      .insertOne({
        onDuration: parseInt(message.toString()),
        timestamp: new Date(Date.now()),
      });
  }
  if (topic === "ledStatus") {
    await mongoclient
      .db("mqttdb")
      .collection("status")
      .insertOne({
        status: parseInt(message.toString()),
        timestamp: new Date(Date.now()),
      });
  }
  // client.end();
});
app.use(express.json());
route.post("/status", function (req, res) {
  try {
    // console.log(req.body);
    client.publish("requestStatus", req.body.control);
  } catch (error) {
    console.log(error.message);
  }
  res.send("POST route on things.");
});

app.use("/", route);
app.listen(8000, function () {
  console.log("info", "Server is running at port : " + 8000);
});
