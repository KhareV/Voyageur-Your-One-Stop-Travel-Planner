require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Stripe = require("stripe");
const app = express();

// Debug Stripe keys (truncated for security)
console.log(
  "STRIPE_SECRET_KEY prefix:",
  process.env.VITE_STRIPE_SECRET_KEY?.substring(0, 7) + "..."
);
console.log(
  "STRIPE_PUBLISHABLE_KEY prefix:",
  process.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) + "..."
);

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.VITE_STRIPE_SECRET_KEY);

// Middleware configuration
// Standard middleware first EXCEPT for the webhook route
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: Webhook route needs raw body parser before JSON parser
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;

    try {
      // Verify the event came from Stripe
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.VITE_STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Webhook received:", event.type);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    try {
      const db = client.db("propertydhundo");

      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;

          await db.collection("bookings").updateOne(
            { sessionId: session.id },
            {
              $set: {
                status: "confirmed",
                paymentDate: new Date().toISOString(),
                bookingId: `BK${Math.floor(100000 + Math.random() * 900000)}`,
              },
            }
          );
          console.log("✅ Booking confirmed:", session.id);
          break;

        case "payment_intent.payment_failed":
          const paymentIntent = event.data.object;
          const session_id = paymentIntent.metadata?.session_id;

          if (session_id) {
            await db
              .collection("bookings")
              .updateOne(
                { sessionId: session_id },
                { $set: { status: "failed" } }
              );
            console.log("❌ Payment failed for session:", session_id);
          }
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error(`❌ Error processing webhook: ${error.message}`);
      res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }
);

// Apply JSON parser AFTER webhook route
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
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

// API to expose Stripe publishable key
app.get("/api/config/stripe-key", (req, res) => {
  if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({
      error: "Stripe publishable key not configured",
    });
  }

  res.json({
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  });
});

// Properties endpoints
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

// Trips endpoints
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

// ===== STRIPE PAYMENT ENDPOINTS =====

// Simple test endpoint to verify Stripe credentials
app.get("/api/test-stripe", async (req, res) => {
  try {
    // Just check if we can connect to Stripe API
    await stripe.paymentMethods.list({ limit: 1 });
    res.json({
      success: true,
      message: "Stripe connection is working",
      publishableKey:
        process.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) + "...",
    });
  } catch (error) {
    console.error("❌ Stripe connection test failed:", error);
    res.status(500).json({
      success: false,
      message: "Stripe connection failed",
      error: error.message,
    });
  }
});

// FIXED: Updated create-checkout-session endpoint to use session.url directly
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    console.log("Creating checkout session with data:", req.body);

    const {
      propertyId,
      propertyName,
      checkIn,
      checkOut,
      guests,
      priceDetails,
    } = req.body;

    // Basic validation
    if (!propertyId || !propertyName) {
      return res.status(400).json({ error: "Missing required booking data" });
    }

    // Format currency properly
    const amountInCents = Math.round((priceDetails?.total || 100) * 100);

    // Get frontend domain for URLs
    const frontendDomain = process.env.FRONTEND_URL || "http://localhost:5173";

    // Create the session with proper parameters for direct checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking: ${propertyName}`,
              description: `${guests} guests, Check-in: ${new Date(
                checkIn
              ).toLocaleDateString()}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendDomain}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendDomain}/payment/${propertyId}`,
      metadata: {
        propertyId: propertyId.toString(),
        propertyName,
        checkIn,
        checkOut,
        guests: String(guests),
      },
    });

    console.log("✅ Session created:", session.id);
    console.log("  → Payment Link:", session.url);

    // Store booking info
    try {
      const db = client.db("propertydhundo");
      await db.collection("bookings").insertOne({
        sessionId: session.id,
        propertyId,
        propertyName,
        checkIn,
        checkOut,
        guests,
        totalAmount: priceDetails?.total || 100,
        status: "pending",
        createdAt: new Date().toISOString(),
        paymentUrl: session.url,
      });
    } catch (dbError) {
      console.warn(
        "Warning: Could not save booking to database",
        dbError.message
      );
      // Continue with payment flow even if DB storage fails
    }

    // Return the actual session URL provided by Stripe - this is the key fix
    res.json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("❌ Error creating checkout session:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    res.status(500).json({
      error: "Failed to create checkout session",
      message: error.message,
      code: error.code || "unknown_error",
    });
  }
});

// Retrieve booking details after successful payment
app.get("/api/booking/details", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const db = client.db("propertydhundo");
    let booking = await db
      .collection("bookings")
      .findOne({ sessionId: session_id });

    if (!booking) {
      // If not in our DB, fetch from Stripe
      try {
        console.log("Fetching session from Stripe:", session_id);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Create a booking object from Stripe data
        booking = {
          sessionId: session.id,
          propertyId: session.metadata?.propertyId || "unknown",
          propertyName: session.metadata?.propertyName || "Property",
          checkIn: session.metadata?.checkIn || new Date().toISOString(),
          checkOut: session.metadata?.checkOut || new Date().toISOString(),
          guests: session.metadata?.guests || 2,
          total: session.amount_total / 100, // Convert from cents
          status: session.payment_status === "paid" ? "confirmed" : "pending",
          paymentMethod: "card",
          paymentDate: new Date().toISOString(),
          bookingId: `BK${Math.floor(100000 + Math.random() * 900000)}`,
        };

        // Save this booking to our database
        await db.collection("bookings").insertOne(booking);
        console.log("Created booking from Stripe session:", booking.bookingId);
      } catch (stripeError) {
        console.error("Error fetching from Stripe:", stripeError);
        return res.status(404).json({ error: "Booking not found" });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Error retrieving booking details:", error);
    res.status(500).json({ error: "Failed to retrieve booking details" });
  }
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const { userId } = req.query;
    const db = client.db("propertydhundo");

    let query = {};
    if (userId) {
      query.userId = userId;
    }

    const bookings = await db
      .collection("bookings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Travel booking payment intent creation
app.post("/api/create-travel-payment-intent", async (req, res) => {
  try {
    console.log("Creating travel payment intent with data:", req.body);

    const {
      transportType,
      origin,
      destination,
      departureDate,
      travelers,
      customerEmail,
      customerName,
      priceDetails,
    } = req.body;

    // Basic validation
    if (!origin || !destination || !departureDate) {
      return res
        .status(400)
        .json({ error: "Missing required travel booking data" });
    }

    // Format currency properly
    const amountInCents = Math.round((priceDetails?.total || 100) * 100);

    // Get frontend domain for URLs
    const frontendDomain = process.env.FRONTEND_URL || "http://localhost:5173";

    // Create the session with proper parameters for direct checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Travel Booking: ${origin} to ${destination}`,
              description: `Departure: ${new Date(
                departureDate
              ).toLocaleDateString()}, Travelers: ${travelers}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendDomain}/travel-booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendDomain}/travel-booking/cancel`,
      metadata: {
        transportType,
        origin,
        destination,
        departureDate,
        travelers: String(travelers),
        customerEmail,
        customerName,
      },
    });

    console.log("✅ Travel session created:", session.id);
    console.log("  → Payment Link:", session.url);

    // Store travel booking info
    try {
      const db = client.db("propertydhundo");
      await db.collection("travel_bookings").insertOne({
        sessionId: session.id,
        transportType,
        origin,
        destination,
        departureDate,
        travelers,
        customerEmail,
        customerName,
        totalAmount: priceDetails?.total || 100,
        status: "pending",
        createdAt: new Date().toISOString(),
        paymentUrl: session.url,
      });
    } catch (dbError) {
      console.warn(
        "Warning: Could not save travel booking to database",
        dbError.message
      );
      // Continue with payment flow even if DB storage fails
    }

    // Return the actual session URL provided by Stripe
    res.json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("❌ Error creating travel payment intent:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    res.status(500).json({
      error: "Failed to create travel payment intent",
      message: error.message,
      code: error.code || "unknown_error",
    });
  }
});

// Confirm travel booking after successful payment
app.post("/api/confirm-travel-booking", async (req, res) => {
  try {
    const { paymentIntentId, travelDetails } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    // Verify payment intent is successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not completed",
        status: paymentIntent.status,
      });
    }

    // Generate booking reference
    const bookingReference =
      "VOY-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Update travel booking status in database
    const db = client.db("propertydhundo");
    await db.collection("travel_bookings").updateOne(
      { paymentIntentId },
      {
        $set: {
          status: "confirmed",
          bookingReference,
          confirmedAt: new Date().toISOString(),
          ...travelDetails,
        },
      }
    );

    res.json({
      success: true,
      bookingReference,
      message: "Travel booking confirmed successfully",
    });
  } catch (error) {
    console.error("❌ Error confirming travel booking:", error);
    res.status(500).json({ error: "Failed to confirm travel booking" });
  }
});

// Retrieve travel booking by payment intent ID
app.get("/api/travel-booking/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const db = client.db("propertydhundo");
    const booking = await db
      .collection("travel_bookings")
      .findOne({ paymentIntentId });

    if (!booking) {
      return res.status(404).json({ error: "Travel booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Error fetching travel booking:", error);
    res.status(500).json({ error: "Failed to fetch travel booking" });
  }
});

// Get all travel bookings for a user
app.get("/api/travel-bookings", async (req, res) => {
  try {
    const { email, userId } = req.query;

    const db = client.db("propertydhundo");

    let query = { status: "confirmed" };
    if (email) {
      query.customerEmail = email;
    }
    if (userId) {
      query.userId = userId;
    }

    const bookings = await db
      .collection("travel_bookings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching travel bookings:", error);
    res.status(500).json({ error: "Failed to fetch travel bookings" });
  }
});

// Save a property to favorites
app.post("/api/favorites", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      return res
        .status(400)
        .json({ error: "User ID and property ID are required" });
    }

    // Check if the favorite already exists
    const existingFavorite = await db.collection("favorites").findOne({
      userId,
      propertyId: parseInt(propertyId),
    });

    if (existingFavorite) {
      return res.status(200).json({ message: "Property already in favorites" });
    }

    // Add to favorites
    await db.collection("favorites").insertOne({
      userId,
      propertyId: parseInt(propertyId),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Property added to favorites" });
  } catch (err) {
    console.error("❌ Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add to favorites" });
  }
});

// Remove a property from favorites
app.delete("/api/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const { userId, propertyId } = req.params;

    await db.collection("favorites").deleteOne({
      userId,
      propertyId: parseInt(propertyId),
    });

    res.status(200).json({ message: "Property removed from favorites" });
  } catch (err) {
    console.error("❌ Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
});

// Get all favorites for a user
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const { userId } = req.params;

    // Get favorite property IDs for this user
    const favorites = await db
      .collection("favorites")
      .find({ userId })
      .toArray();

    // Get the actual property data for each favorite
    const propertyIds = favorites.map((fav) => parseInt(fav.propertyId));

    if (propertyIds.length === 0) {
      return res.json([]);
    }

    const favoriteProperties = await db
      .collection("properties")
      .find({ _id: { $in: propertyIds } })
      .toArray();

    // Add a field to indicate these are favorites
    const enhancedProperties = favoriteProperties.map((prop) => ({
      ...prop,
      isFavorite: true,
      favoriteId: favorites.find((f) => f.propertyId === prop._id)?._id,
    }));

    res.json(enhancedProperties);
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Check if a property is in user's favorites
app.get("/api/favorites/:userId/:propertyId", async (req, res) => {
  try {
    const db = client.db("propertydhundo");
    const { userId, propertyId } = req.params;

    const favorite = await db.collection("favorites").findOne({
      userId,
      propertyId: parseInt(propertyId),
    });

    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error("❌ Error checking favorite status:", err);
    res.status(500).json({ error: "Failed to check favorite status" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} - ${new Date().toISOString()}`)
);
