const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const Db = process.env.VITE_MONGODB_URI;
const client = new MongoClient(Db);

async function connectDB() {
  await client.connect();
  console.log("Connected to MongoDB");
}
connectDB();

app.get("/api/properties", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const properties = await db.collection("properties").find({}).toArray();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
