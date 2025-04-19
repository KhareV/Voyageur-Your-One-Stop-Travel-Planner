const { MongoClient } = require("mongodb");
const { Collection } = require("mongoose");
require("dotenv").config({ path: "./.env" });
async function main() {
  const Db = process.env.VITE_MONGODB_URI;
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const collections = await client.db("propertydhundo").collections();
    collections.forEach((collection) =>
      console.log(collection.s.namespace.collection)
    );
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}
main();
