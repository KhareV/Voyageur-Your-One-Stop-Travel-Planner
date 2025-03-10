const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();
const Stripe = require("stripe");
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Db = process.env.VITE_MONGODB_URI;
const client = new MongoClient(Db);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
}
connectDB();

app.get("/api/properties", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const properties = await db
      .collection("properties")
      .find({})
      .sort({ _id: 1 })
      .toArray();

    res.json(properties);
  } catch (err) {
    console.error("❌ Error fetching properties:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const propertyId = parseInt(req.params.id);
    const property = await db
      .collection("properties")
      .findOne({ _id: propertyId });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error("❌ Error fetching property:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

app.post("/api/properties", upload.array("images", 4), async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const propertyData = JSON.parse(req.body.propertyData);

    const lastProperty = await db
      .collection("properties")
      .find({})
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    const nextId = lastProperty.length > 0 ? lastProperty[0]._id + 1 : 1;

    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "properties" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );

    const completePropertyData = {
      _id: nextId,
      owner: propertyData.owner,
      name: propertyData.name,
      type: propertyData.type,
      description: propertyData.description,
      location: propertyData.location,
      beds: parseInt(propertyData.beds),
      baths: parseInt(propertyData.baths),
      square_feet: parseInt(propertyData.square_feet),
      amenities: propertyData.amenities,
      rates: propertyData.rates,
      seller_info: propertyData.seller_info,
      images: imageUrls,
      is_featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("properties").insertOne(completePropertyData);

    res.status(201).json({
      message: "✅ Property created successfully",
      property: completePropertyData,
    });
  } catch (error) {
    console.error("❌ Error creating property:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
});

app.put("/api/properties/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const propertyId = parseInt(req.params.id);
    const updatedData = req.body;

    const result = await db
      .collection("properties")
      .updateOne(
        { _id: propertyId },
        { $set: { ...updatedData, updatedAt: new Date().toISOString() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ message: "✅ Property updated successfully" });
  } catch (err) {
    console.error("❌ Error updating property:", err);
    res.status(500).json({ error: "Failed to update property" });
  }
});

app.delete("/api/properties/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const propertyId = parseInt(req.params.id);

    const result = await db
      .collection("properties")
      .deleteOne({ _id: propertyId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json({ message: "✅ Property deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting property:", err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

app.get("/api/trips", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const trips = await db
      .collection("trips")
      .find({})
      .sort({ id: 1 })
      .toArray();
    res.json(trips);
  } catch (err) {
    console.error("❌ Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

app.get("/api/trips/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const tripId = parseInt(req.params.id);
    const trip = await db.collection("trips").findOne({ id: tripId });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    console.error("❌ Error fetching trip:", err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

app.post("/api/trips", upload.array("images", 4), async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);

    const db = client.db("propertydhundo");

    if (!req.body.tripData) {
      return res.status(400).json({ error: "Trip data is missing" });
    }

    let tripData;
    try {
      tripData = JSON.parse(req.body.tripData);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({ error: "Invalid trip data format" });
    }

    if (!tripData.id) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    if (!client.topology || !client.topology.isConnected()) {
      return res.status(500).json({ error: "Database connection error" });
    }

    const existingTrip = await db
      .collection("trips")
      .findOne({ id: parseInt(tripData.id) });

    if (existingTrip) {
      return res
        .status(409)
        .json({ error: "Trip with this ID already exists" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "trips" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                return reject(
                  new Error(`Cloudinary upload failed: ${error.message}`)
                );
              }
              resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );

    const completeTripData = {
      _id: new ObjectId(),
      id: parseInt(tripData.id),
      tripName: tripData.tripName,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      activities: tripData.activities,
      expenses: tripData.expenses,
      totalExpenses: tripData.totalExpenses,
      journalEntries: tripData.journalEntries,
      images: imageUrls,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.collection("trips").insertOne(completeTripData);
    } catch (dbError) {
      console.error("Database insertion error:", dbError);
      return res.status(500).json({ error: "Failed to save trip to database" });
    }

    res.status(201).json({
      message: "✅ Trip created successfully",
      trip: completeTripData,
    });
  } catch (error) {
    console.error("❌ Error creating trip:", error);
    res.status(500).json({
      error: "Failed to create trip",
      details: error.message,
    });
  }
});

app.put("/api/trips/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const tripId = parseInt(req.params.id);
    const updatedData = req.body;

    const result = await db
      .collection("trips")
      .updateOne(
        { id: tripId },
        { $set: { ...updatedData, updatedAt: new Date().toISOString() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json({ message: "✅ Trip updated successfully" });
  } catch (err) {
    console.error("❌ Error updating trip:", err);
    res.status(500).json({ error: "Failed to update trip" });
  }
});

app.delete("/api/trips/:id", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const tripId = parseInt(req.params.id);
    const result = await db.collection("trips").deleteOne({ id: tripId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json({ message: "✅ Trip deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting trip:", err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
