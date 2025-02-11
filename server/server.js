const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
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

// Fetch all properties
app.get("/api/properties", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const properties = await db.collection("properties").find({}).toArray();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Fetch a single property by ID
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
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

// Create a new property with incremental numeric _id
app.post("/api/properties", upload.array("images", 4), async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const propertyData = JSON.parse(req.body.propertyData);

    // Fetch the last entry to determine the next _id
    const lastProperty = await db
      .collection("properties")
      .find({})
      .sort({ _id: -1 }) // Sort in descending order to get the highest _id
      .limit(1)
      .toArray();

    const nextId = lastProperty.length > 0 ? lastProperty[0]._id + 1 : 1; // Start from 1 if no properties exist

    // Create the complete property object
    const completePropertyData = {
      _id: nextId, // Use incremental numeric ID
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
      images: [], // Will be populated with Cloudinary URLs
      is_featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "properties" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      imageUrls.push(result.secure_url);
    }

    // Add image URLs to property data
    completePropertyData.images = imageUrls;

    // Save property to MongoDB
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

// Update a property by ID
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
    res.status(500).json({ error: "Failed to update property" });
  }
});

// Delete a property by ID
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
    res.status(500).json({ error: "Failed to delete property" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Initialize database connection
connectDB().catch(console.error);
