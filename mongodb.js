const { MongoClient } = require("mongodb");
var uri = "mongodb://localhost:27017/";

const mongoclient = new MongoClient(uri);
async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}
async function mongoconnect() {
  try {
    // Connect to the MongoDB cluster
    await mongoclient.connect();

    // // Make the appropriate DB calls
    // const collection = mongoclient.db("mqttdb").collection("frequency");
    // // await collection.insertOne({ name: "Company Inc", address: "Highway 37" });
    // // const res = await collection.findOne({ name: "Company Inc" });
    // // console.log(res);
    // await collection.find().forEach(console.log);
    // await listDatabases(mongoclient);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoclient.close();
  }
}

module.exports = { mongoclient, mongoconnect };
