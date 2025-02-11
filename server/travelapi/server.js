const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Amadeus = require("amadeus");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transportData = {
  trains: [
    {
      name: "Rajdhani Express",
      departure: "10:00",
      arrival: "22:00",
      duration: "12h",
      price: 1200,
    },
    {
      name: "Shatabdi Express",
      departure: "06:30",
      arrival: "12:30",
      duration: "6h",
      price: 900,
    },
    {
      name: "Duronto Express",
      departure: "14:00",
      arrival: "02:00",
      duration: "12h",
      price: 1100,
    },
    {
      name: "Garib Rath Express",
      departure: "20:00",
      arrival: "08:00",
      duration: "12h",
      price: 750,
    },
    {
      name: "Vande Bharat Express",
      departure: "07:00",
      arrival: "13:00",
      duration: "6h",
      price: 1500,
    },
  ],
  buses: [
    {
      operator: "VRL Travels",
      departure: "21:00",
      arrival: "06:00",
      duration: "9h",
      price: 800,
    },
    {
      operator: "SRS Travels",
      departure: "18:00",
      arrival: "05:00",
      duration: "11h",
      price: 700,
    },
    {
      operator: "RedBus Deluxe",
      departure: "23:30",
      arrival: "08:30",
      duration: "9h",
      price: 950,
    },
    {
      operator: "KSRTC",
      departure: "17:00",
      arrival: "03:30",
      duration: "10h 30m",
      price: 650,
    },
    {
      operator: "National Express",
      departure: "20:45",
      arrival: "06:15",
      duration: "9h 30m",
      price: 850,
    },
  ],
};

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

app.post("/api/search", async (req, res) => {
  const { from, to, departureDate, passengers, class: travelClass } = req.body;

  try {
    const flightOffers = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: from,
      destinationLocationCode: to,
      departureDate,
      adults: passengers,
      travelClass: (travelClass || "ECONOMY").toUpperCase(),
    });

    const flights = flightOffers.data
      ? flightOffers.data.map((offer) => ({
          carrierCode: offer.validatingAirlineCodes?.[0] || "Unknown",
          departure:
            offer.itineraries?.[0]?.segments?.[0]?.departure?.at || "N/A",
          arrival: offer.itineraries?.[0]?.segments?.[0]?.arrival?.at || "N/A",
          duration: offer.itineraries?.[0]?.duration || "Unknown",
          price: offer.price?.total || "N/A",
        }))
      : [];

    res.json({
      flights,
      trains: transportData.trains,
      buses: transportData.buses,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
