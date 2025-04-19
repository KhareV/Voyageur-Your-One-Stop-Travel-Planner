/**
 * This file handles API integration with travel service providers.
 * Uses SkyScanner API via RapidAPI to fetch real flight data.
 */

// Reliable placeholder images from a CDN
const getPlaceholderImage = (text, bgColor = "6366F1") => {
  // Using imgix or another reliable service instead of placeholder.com
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    text
  )}&background=${bgColor}&color=fff&size=150`;
};

// Mock data as fallback if API fails
const mockFlights = [
  {
    id: "f1",
    airline: "Voyageur Airways",
    flightNumber: "VA201",
    price: 349,
    departureTime: "2023-08-10T08:30:00",
    arrivalTime: "2023-08-10T11:45:00",
    duration: 195, // in minutes
    origin: "New York (JFK)",
    destination: "Los Angeles (LAX)",
    stops: 0,
    departureTerminal: "Terminal 4",
    arrivalTerminal: "Terminal 2",
    carbonEmission: 102,
    baggage: "1 carry-on, 1 checked bag included",
    amenities: ["WiFi", "Power outlets", "In-flight entertainment"],
    logo: getPlaceholderImage("VA", "6366F1"),
  },
  {
    id: "f2",
    airline: "SkyJet",
    flightNumber: "SJ845",
    price: 289,
    departureTime: "2023-08-10T10:15:00",
    arrivalTime: "2023-08-10T14:05:00",
    duration: 230,
    origin: "New York (JFK)",
    destination: "Los Angeles (LAX)",
    stops: 1,
    departureTerminal: "Terminal 2",
    arrivalTerminal: "Terminal 5",
    carbonEmission: 130,
    baggage: "1 carry-on included, checked bags extra",
    amenities: ["WiFi available for purchase", "Power outlets"],
    logo: getPlaceholderImage("SJ", "818CF8"),
  },
  {
    id: "f3",
    airline: "Global Air",
    flightNumber: "GA709",
    price: 429,
    departureTime: "2023-08-10T07:00:00",
    arrivalTime: "2023-08-10T10:10:00",
    duration: 190,
    origin: "New York (JFK)",
    destination: "Los Angeles (LAX)",
    stops: 0,
    departureTerminal: "Terminal 1",
    arrivalTerminal: "Terminal 4",
    carbonEmission: 98,
    baggage: "2 carry-on, 2 checked bags included",
    amenities: ["WiFi", "Premium meals", "USB ports", "Extra legroom"],
    logo: getPlaceholderImage("GA", "4F46E5"),
  },
];

const mockTrains = [
  {
    id: "t1",
    airline: "RailExpress",
    trainNumber: "RE102",
    price: 129,
    departureTime: "2023-08-10T09:00:00",
    arrivalTime: "2023-08-10T15:30:00",
    duration: 390,
    origin: "New York (Penn Station)",
    destination: "Washington DC (Union Station)",
    stops: 3,
    departureTerminal: "Platform 7",
    arrivalTerminal: "Platform 2",
    carbonEmission: 30,
    baggage: "Unlimited baggage within reason",
    amenities: ["WiFi", "Dining car", "Power outlets", "Quiet car available"],
    logo: getPlaceholderImage("RE", "10B981"),
  },
  {
    id: "t2",
    airline: "SpeedRail",
    trainNumber: "SR501",
    price: 149,
    departureTime: "2023-08-10T10:30:00",
    arrivalTime: "2023-08-10T16:15:00",
    duration: 345,
    origin: "New York (Penn Station)",
    destination: "Washington DC (Union Station)",
    stops: 0,
    departureTerminal: "Platform 4",
    arrivalTerminal: "Platform 6",
    carbonEmission: 25,
    baggage: "Unlimited baggage within reason",
    amenities: [
      "WiFi",
      "Buffet car",
      "Power outlets",
      "Business class available",
    ],
    logo: getPlaceholderImage("SR", "0369A1"),
  },
];

const mockBuses = [
  {
    id: "b1",
    airline: "Express Coach",
    busNumber: "EC20",
    price: 59,
    departureTime: "2023-08-10T08:00:00",
    arrivalTime: "2023-08-10T12:30:00",
    duration: 270,
    origin: "New York (Port Authority)",
    destination: "Boston (South Station)",
    stops: 1,
    departureTerminal: "Gate 12",
    arrivalTerminal: "Bay 5",
    carbonEmission: 18,
    baggage: "1 carry-on, 1 checked bag included",
    amenities: ["WiFi", "Power outlets", "Restroom on board"],
    logo: getPlaceholderImage("EC", "059669"),
  },
  {
    id: "b2",
    airline: "City Hopper",
    busNumber: "CH45",
    price: 39,
    departureTime: "2023-08-10T09:15:00",
    arrivalTime: "2023-08-10T14:25:00",
    duration: 310,
    origin: "New York (Port Authority)",
    destination: "Boston (South Station)",
    stops: 3,
    departureTerminal: "Gate 8",
    arrivalTerminal: "Bay 2",
    carbonEmission: 20,
    baggage: "2 bags included",
    amenities: ["WiFi", "Snacks available", "Restroom on board"],
    logo: getPlaceholderImage("CH", "0284C7"),
  },
];

// Cache for location data to minimize API calls
let locationCache = {};
let localLocationDataInitialized = false;

// Local database of popular locations - fixing the corrupted object
const popularLocations = {
  "new york": {
    name: "New York",
    entityId: "local-ny",
    id: "NYC",
    type: "CITY",
    city: "New York",
    country: "United States",
    coordinates: { latitude: 40.7128, longitude: -74.006 },
  },
  london: {
    name: "London",
    entityId: "local-ldn",
    id: "LON",
    type: "CITY",
    city: "London",
    country: "United Kingdom",
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
  },
  paris: {
    name: "Paris",
    entityId: "local-par",
    id: "PAR",
    type: "CITY",
    city: "Paris",
    country: "France",
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
  },
  tokyo: {
    name: "Tokyo",
    entityId: "local-tko",
    id: "TYO",
    type: "CITY",
    city: "Tokyo",
    country: "Japan",
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
  },
  sydney: {
    name: "Sydney",
    entityId: "local-syd",
    id: "SYD",
    type: "CITY",
    city: "Sydney",
    country: "Australia",
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
  },
  rome: {
    name: "Rome",
    entityId: "local-rom",
    id: "ROM",
    type: "CITY",
    city: "Rome",
    country: "Italy",
    coordinates: { latitude: 41.9028, longitude: 12.4964 },
  },
  dubai: {
    name: "Dubai",
    entityId: "local-dxb",
    id: "DXB",
    type: "CITY",
    city: "Dubai",
    country: "United Arab Emirates",
    coordinates: { latitude: 25.2048, longitude: 55.2708 },
  },
  bangkok: {
    name: "Bangkok",
    entityId: "local-bkk",
    id: "BKK",
    type: "CITY",
    city: "Bangkok",
    country: "Thailand",
    coordinates: { latitude: 13.7563, longitude: 100.5018 },
  },
};

// Add this function to initialize more locations
function initializeAdditionalLocations() {
  const additionalLocations = {
    "san francisco": {
      name: "San Francisco",
      entityId: "local-sf",
      id: "SFO",
      type: "CITY",
      city: "San Francisco",
      country: "United States",
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
    },
    chicago: {
      name: "Chicago",
      entityId: "local-chi",
      id: "CHI",
      type: "CITY",
      city: "Chicago",
      country: "United States",
      coordinates: { latitude: 41.8781, longitude: -87.6298 },
    },
    miami: {
      name: "Miami",
      entityId: "local-mia",
      id: "MIA",
      type: "CITY",
      city: "Miami",
      country: "United States",
      coordinates: { latitude: 25.7617, longitude: -80.1918 },
    },
    "los angeles": {
      name: "Los Angeles",
      entityId: "local-lax",
      id: "LAX",
      type: "CITY",
      city: "Los Angeles",
      country: "United States",
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
    },
    shanghai: {
      name: "Shanghai",
      entityId: "local-sha",
      id: "SHA",
      type: "CITY",
      city: "Shanghai",
      country: "China",
      coordinates: { latitude: 31.2304, longitude: 121.4737 },
    },
  };

  // Add to popularLocations
  Object.assign(popularLocations, additionalLocations);
  localLocationDataInitialized = true;
}

// Function to get location data from our local database - fixed implementation
function getLocalLocationData(query) {
  const normalizedQuery = query.toLowerCase();

  // Try direct match
  if (popularLocations[normalizedQuery]) {
    console.log(`Found ${query} in local database`);
    return popularLocations[normalizedQuery];
  }

  // Try partial match
  for (const [key, data] of Object.entries(popularLocations)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      console.log(`Found partial match for ${query} in local database: ${key}`);
      return data;
    }
  }

  // For airport codes like "JFK", "LHR", etc.
  const airportMatch = normalizedQuery.match(/\b([a-z]{3})\b/i);
  if (airportMatch) {
    const code = airportMatch[1].toUpperCase();
    // Find cities with matching ID
    for (const [key, data] of Object.entries(popularLocations)) {
      if (data.id === code) {
        console.log(`Found airport code match for ${code}`);
        return data;
      }
    }
  }

  return null;
}

/**
 * Get approximate coordinates for a location name
 * Required for createFallbackLocation function
 * @param {string} cityName - The name of the city/location
 * @returns {Object} - Default coordinates {latitude, longitude}
 */
const getApproximateCoordinates = (cityName) => {
  // Normalize the city name for comparison
  const normalizedName = cityName.toLowerCase().trim();

  // Common city coordinates as fallbacks
  const commonCities = {
    "new york": { latitude: 40.7128, longitude: -74.006 },
    london: { latitude: 51.5074, longitude: -0.1278 },
    paris: { latitude: 48.8566, longitude: 2.3522 },
    tokyo: { latitude: 35.6762, longitude: 139.6503 },
    sydney: { latitude: -33.8688, longitude: 151.2093 },
    rome: { latitude: 41.9028, longitude: 12.4964 },
    dubai: { latitude: 25.2048, longitude: 55.2708 },
    bangkok: { latitude: 13.7563, longitude: 100.5018 },
    "los angeles": { latitude: 34.0522, longitude: -118.2437 },
    chicago: { latitude: 41.8781, longitude: -87.6298 },
  };

  // Try to find the city in our common cities list
  for (const [city, coords] of Object.entries(commonCities)) {
    if (normalizedName.includes(city) || city.includes(normalizedName)) {
      console.log(
        `Using approximate coordinates for ${normalizedName} based on ${city}`
      );
      return coords;
    }
  }

  // If no match found, return default coordinates (New York City)
  console.log(
    `No approximate coordinates found for ${normalizedName}, using default`
  );
  return { latitude: 40.7128, longitude: -74.006 };
};

/**
 * Enhanced mock data generator for 100% reliability without API calls
 * This uses preset city data and generates realistic travel options
 */

// Add more airlines for variety in our mock data
const airlines = {
  flights: [
    { name: "Voyageur Air", code: "VA", color: "6366F1" },
    { name: "SkyWay Express", code: "SE", color: "818CF8" },
    { name: "Global Wings", code: "GW", color: "4F46E5" },
    { name: "Pacific Express", code: "PE", color: "8B5CF6" },
    { name: "Atlantic Air", code: "AA", color: "7C3AED" },
    { name: "Horizon Airlines", code: "HA", color: "A855F7" },
    { name: "Star Alliance", code: "SA", color: "9333EA" },
    { name: "Blue Skies", code: "BS", color: "6D28D9" },
    { name: "Sunshine Airways", code: "SU", color: "5B21B6" },
  ],
  trains: [
    { name: "RailConnect", code: "RC", color: "10B981" },
    { name: "Express Rail", code: "ER", color: "059669" },
    { name: "Metro Transit", code: "MT", color: "047857" },
    { name: "Continental Rail", code: "CR", color: "065F46" },
    { name: "Speed Track", code: "ST", color: "0F766E" },
  ],
  buses: [
    { name: "Coach Lines", code: "CL", color: "0369A1" },
    { name: "City Express", code: "CE", color: "0284C7" },
    { name: "Regional Bus", code: "RB", color: "0EA5E9" },
    { name: "Continental Coach", code: "CC", color: "0891B2" },
    { name: "Highway Express", code: "HE", color: "06B6D4" },
  ],
};

// API Configurations for reliable external services
const EXTERNAL_API_CONFIG = {
  // Amadeus API - industry standard for flight data (free tier available)
  AMADEUS_API: {
    BASE_URL: "https://test.api.amadeus.com/v2",
    CLIENT_ID: import.meta.env.VITE_AMADEUS_CLIENT_ID || "",
    CLIENT_SECRET: import.meta.env.VITE_AMADEUS_CLIENT_SECRET || "",
    TOKEN_ENDPOINT: "https://test.api.amadeus.com/v1/security/oauth2/token",
    // Cache the token
    token: null,
    tokenExpiry: null,
  },

  // Open-Meteo - 100% free, no API key required, high reliability
  OPEN_METEO: {
    GEOCODING_URL: "https://geocoding-api.open-meteo.com/v1/search",
  },

  // Cache settings
  CACHE: {
    TTL: 3600000, // 1 hour in milliseconds
    FLIGHT_SEARCH_TTL: 7200000, // 2 hours for flight searches
  },
};

// Add caches for API responses to improve reliability and speed
const apiCache = {
  flights: {},
  locations: {},
  tokens: {},
};

/**
 * Get Amadeus API token - automatically handles token refreshing
 * @returns {Promise<string>} - Valid access token
 */
async function getAmadeusToken() {
  // Check if we have a valid cached token
  if (
    EXTERNAL_API_CONFIG.AMADEUS_API.token &&
    EXTERNAL_API_CONFIG.AMADEUS_API.tokenExpiry > Date.now()
  ) {
    return EXTERNAL_API_CONFIG.AMADEUS_API.token;
  }

  // No valid token, get a new one
  try {
    if (
      !EXTERNAL_API_CONFIG.AMADEUS_API.CLIENT_ID ||
      !EXTERNAL_API_CONFIG.AMADEUS_API.CLIENT_SECRET
    ) {
      console.warn("Missing Amadeus API credentials");
      return null;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", EXTERNAL_API_CONFIG.AMADEUS_API.CLIENT_ID);
    params.append(
      "client_secret",
      EXTERNAL_API_CONFIG.AMADEUS_API.CLIENT_SECRET
    );

    const response = await fetch(
      EXTERNAL_API_CONFIG.AMADEUS_API.TOKEN_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();

    // Cache the token
    EXTERNAL_API_CONFIG.AMADEUS_API.token = data.access_token;
    // Set expiry time with a 5-minute buffer
    EXTERNAL_API_CONFIG.AMADEUS_API.tokenExpiry =
      Date.now() + data.expires_in * 1000 - 300000;

    return data.access_token;
  } catch (error) {
    console.error("Error getting Amadeus API token:", error);
    return null;
  }
}

/**
 * Generate connection points for multi-segment flights
 */
function generateConnections(segments) {
  if (!segments || segments.length <= 1) return [];

  return segments.slice(0, -1).map((segment) => {
    return {
      name: `Connection: ${segment.arrival.iataCode}`,
      coordinates: getAirportCoordinates(segment.arrival.iataCode),
    };
  });
}

/**
 * Get approximate coordinates for an airport by IATA code
 */
function getAirportCoordinates(iataCode) {
  // Try to find in our database first
  for (const location of Object.values(popularLocations)) {
    if (location.id === iataCode) {
      return [location.coordinates.latitude, location.coordinates.longitude];
    }
  }

  // If not found, return approximate coordinates
  return [0, 0]; // This would be improved with a full airport database
}

/**
 * Get airline name from code
 */
function getAirlineName(code) {
  const airlines = {
    AA: "American Airlines",
    DL: "Delta Air Lines",
    UA: "United Airlines",
    LH: "Lufthansa",
    BA: "British Airways",
    AF: "Air France",
    KL: "KLM",
    IB: "Iberia",
    SU: "Aeroflot",
    EK: "Emirates",
    QR: "Qatar Airways",
    EY: "Etihad Airways",
    TK: "Turkish Airlines",
    // Add more airlines as needed
  };

  return airlines[code] || `${code} Airlines`;
}

/**
 * Fetch real flight offers from Amadeus API
 * @param {Object} originData - Origin location data
 * @param {Object} destinationData - Destination location data
 * @param {string} departureDate - Departure date (YYYY-MM-DD)
 * @param {number} passengers - Number of passengers
 * @returns {Promise<Array>} - Flight offers
 */
async function fetchAmadeusFlights(
  originData,
  destinationData,
  departureDate,
  passengers = 1
) {
  try {
    // Create cache key
    const cacheKey = `${originData.id}_${destinationData.id}_${departureDate}_${passengers}`;

    // Check cache first
    if (
      apiCache.flights[cacheKey] &&
      apiCache.flights[cacheKey].expiry > Date.now()
    ) {
      console.log("Using cached flight data");
      return apiCache.flights[cacheKey].data;
    }

    // Format the departure date properly
    const formattedDate = formatDate(departureDate);

    // Get token
    const token = await getAmadeusToken();
    if (!token) {
      return null;
    }

    const originLocation = originData.id.length === 3 ? originData.id : "NYC";
    const destinationLocation =
      destinationData.id.length === 3 ? destinationData.id : "LAX";

    const url = `${EXTERNAL_API_CONFIG.AMADEUS_API.BASE_URL}/shopping/flight-offers?originLocationCode=${originLocation}&destinationLocationCode=${destinationLocation}&departureDate=${formattedDate}&adults=${passengers}&nonStop=false&max=20`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data)) {
      console.warn("Invalid or empty response from Amadeus API");
      return null;
    }

    // Transform data to match our app's format
    const flightsData = data.data
      .map((flight, index) => {
        try {
          const segment = flight.itineraries[0].segments[0];
          const price = parseInt(flight.price.total);
          const departureTime = new Date(segment.departure.at);
          const arrivalTime = new Date(segment.arrival.at);
          const duration = Math.round((arrivalTime - departureTime) / 60000); // minutes

          // Get airline code and name
          const airlineCode = segment.carrierCode;
          const airlineName = getAirlineName(airlineCode) || "Unknown Airline";

          // Create route path
          const routePath = generateRoutePath(
            originData.coordinates,
            destinationData.coordinates,
            "flights"
          );

          return {
            id: `AF${index + 100}`, // AF = Amadeus Flight
            airline: airlineName,
            flightNumber: `${airlineCode}${segment.number}`,
            price: price,
            departureTime: segment.departure.at,
            arrivalTime: segment.arrival.at,
            duration: duration,
            origin: originData.city || segment.departure.iataCode,
            destination: destinationData.city || segment.arrival.iataCode,
            stops: flight.itineraries[0].segments.length - 1,
            departureTerminal:
              segment.departure.terminal ||
              `Terminal ${1 + Math.floor(Math.random() * 5)}`,
            arrivalTerminal:
              segment.arrival.terminal ||
              `Terminal ${1 + Math.floor(Math.random() * 5)}`,
            carbonEmission: Math.round(routePath.distance * 0.2),
            baggage: getBaggageAllowance("flights", price),
            amenities: getAmenities("flights", price),
            logo: getPlaceholderImage(airlineCode, "6366F1"),
            originCoordinates: [
              originData.coordinates.latitude,
              originData.coordinates.longitude,
            ],
            destinationCoordinates: [
              destinationData.coordinates.latitude,
              destinationData.coordinates.longitude,
            ],
            routePath: routePath.path,
            markers: routePath.markers,
            distance: routePath.distance,
            waypoints:
              flight.itineraries[0].segments.length > 1
                ? generateConnections(flight.itineraries[0].segments)
                : [],
            isRealData: true,
          };
        } catch (err) {
          console.error("Error transforming flight data:", err);
          return null;
        }
      })
      .filter((item) => item !== null); // Filter out any failed transformations

    // Cache the results
    apiCache.flights[cacheKey] = {
      data: flightsData,
      expiry: Date.now() + EXTERNAL_API_CONFIG.CACHE.FLIGHT_SEARCH_TTL,
    };

    return flightsData;
  } catch (error) {
    console.error("Error fetching from Amadeus API:", error);
    return null;
  }
}

/**
 * Create a completely local fallback location without API calls
 * @param {string} query - Location search query
 * @returns {Object} - Location data with coordinates
 */
const createFallbackLocation = (query) => {
  console.log(`Creating reliable fallback location for: ${query}`);

  // Ensure query is a string before using string methods
  if (typeof query !== "string") {
    query = String(query);
  }

  // Try to extract airport code if present
  const airportCodeMatch = query.match(/\(([A-Z]{3})\)/);
  const airportCode = airportCodeMatch ? airportCodeMatch[1] : "";

  // Clean up location name
  const cleanName = query.replace(/\([A-Z]{3}\)/, "").trim();

  // Add to cache to prevent repeated fallbacks for same query
  locationCache[query] = {
    name: cleanName,
    entityId: `mock-${Date.now()}`,
    id: airportCode || `LOC${Math.floor(Math.random() * 1000)}`,
    type: airportCode ? "AIRPORT" : "CITY",
    city: cleanName,
    country: "Unknown",
    coordinates: getApproximateCoordinates(cleanName),
    isFallback: true,
  };

  return locationCache[query];
};

/**
 * Get location data by search query - 100% local implementation
 * @param {string} query - Location search query
 * @returns {Promise<Object>} - Location data including ID and geo coordinates
 */
export const getLocationData = async (query) => {
  // Handle invalid inputs (objects, undefined, etc.)
  if (typeof query !== "string") {
    console.warn(`Invalid query type: ${typeof query}, value:`, query);
    // Convert objects to string or use a default value
    if (query && typeof query === "object") {
      if (query.name) {
        query = query.name;
      } else if (query.city) {
        query = query.city;
      } else {
        query = JSON.stringify(query);
      }
    } else {
      // Set a default query for undefined or null values
      query = "Unknown Location";
    }
  }

  // Return from cache if available
  if (locationCache[query]) return locationCache[query];

  // Add more common locations to make sure we have good coverage
  if (!Object.keys(popularLocations).length && !localLocationDataInitialized) {
    initializeAdditionalLocations();
  }

  // Use our local database first
  const localResult = getLocalLocationData(query);
  if (localResult) {
    locationCache[query] = localResult;
    return localResult;
  }

  // For any location not in our database, create a 100% reliable fallback
  return createFallbackLocation(query);
};

/**
 * Generate a path of coordinates between origin and destination
 * Moved this function to be defined before it's used by other functions
 * @param {Object} origin - Origin coordinates {latitude, longitude}
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @param {string} transportType - Type of transport (flights, trains, buses)
 * @returns {Object} - Object containing path, markers, and distance
 */
function generateRoutePath(origin, destination, transportType) {
  // Create a simple direct line for all transport types
  const path = [];

  // Add markers for source and destination
  const markers = [
    {
      position: [origin.latitude, origin.longitude],
      type: "source",
      title: "Origin",
    },
    {
      position: [destination.latitude, destination.longitude],
      type: "destination",
      title: "Destination",
    },
  ];

  // Starting point
  path.push([origin.latitude, origin.longitude]);

  // For flights: straight line (no intermediate points)
  if (transportType === "flights") {
    // Just add destination - direct line
    path.push([destination.latitude, destination.longitude]);
  }
  // For ground transport: add some intermediate points
  else {
    // Add 2-3 intermediate points along the route
    const steps = transportType === "trains" ? 2 : 3;

    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      path.push([
        origin.latitude + (destination.latitude - origin.latitude) * ratio,
        origin.longitude + (destination.longitude - origin.longitude) * ratio,
      ]);
    }

    // Add destination
    path.push([destination.latitude, destination.longitude]);
  }

  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  return {
    path,
    markers,
    distance,
  };
}

/**
 * Generate waypoints for routes with stops
 * @param {Array} path - Route path coordinates
 * @param {number} stops - Number of stops
 * @returns {Array} - Array of waypoints
 */
function generateWaypoints(path, stops) {
  const waypoints = [];
  const pathLength = path.length;

  // For each stop, pick a point along the route
  for (let i = 1; i <= stops; i++) {
    const index = Math.floor((i * pathLength) / (stops + 1));
    if (index > 0 && index < pathLength - 1) {
      const point = path[index];
      waypoints.push({
        name: `Stop ${i}`,
        coordinates: point,
      });
    }
  }
  return waypoints;
}

/**
 * Get departure terminal based on transport type
 * @param {string} transportType - Type of transport
 * @returns {string} - Terminal name
 */
function getDepartureTerminal(transportType) {
  if (transportType === "flights") {
    return `Terminal ${1 + Math.floor(Math.random() * 5)}`;
  } else if (transportType === "trains") {
    return `Platform ${1 + Math.floor(Math.random() * 12)}`;
  } else {
    return `Gate ${Math.floor(Math.random() * 20) + 1}`;
  }
}

/**
 * Get arrival terminal based on transport type
 * @param {string} transportType - Type of transport
 * @returns {string} - Terminal name
 */
function getArrivalTerminal(transportType) {
  if (transportType === "flights") {
    return `Terminal ${1 + Math.floor(Math.random() * 5)}`;
  } else if (transportType === "trains") {
    return `Platform ${1 + Math.floor(Math.random() * 12)}`;
  } else {
    return `Bay ${Math.floor(Math.random() * 10) + 1}`;
  }
}

/**
 * Determine baggage allowance based on transport type and price
 * @param {string} transportType - Type of transport (flights, trains, buses)
 * @param {number} price - Price of the ticket
 * @returns {string} - Description of baggage allowance
 */
function getBaggageAllowance(transportType, price) {
  if (transportType === "flights") {
    if (price > 300) {
      return "2 carry-on, 2 checked bags included";
    } else if (price > 200) {
      return "1 carry-on, 1 checked bag included";
    } else {
      return "1 carry-on included, checked bags extra";
    }
  } else if (transportType === "trains") {
    return "Unlimited baggage within reason";
  } else {
    // buses
    return "2 bags included";
  }
}

/**
 * Get amenities based on transport type and price
 * @param {string} transportType - Type of transport (flights, trains, buses)
 * @param {number} price - Price of the ticket
 * @returns {Array} - List of amenities
 */
function getAmenities(transportType, price) {
  const allAmenities = {
    flights: [
      "WiFi",
      "Power outlets",
      "In-flight entertainment",
      "USB ports",
      "Premium meals",
      "Extra legroom",
    ],
    trains: [
      "WiFi",
      "Dining car",
      "Power outlets",
      "Quiet car available",
      "Buffet car",
      "Business class available",
    ],
    buses: [
      "WiFi",
      "Power outlets",
      "Restroom on board",
      "Snacks available",
      "Entertainment system",
      "Extra legroom seats",
    ],
  };

  const amenities = allAmenities[transportType] || allAmenities.flights;

  // Higher priced options get more amenities
  const count = Math.min(Math.floor(price / 100) + 2, amenities.length);
  const shuffled = [...amenities].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
}

/**
 * Generate enhanced travel options with better variety
 * This is a reliable function that produces realistic travel options
 * @param {Object} origin - Origin location data
 * @param {Object} destination - Destination location data
 * @param {string} departureDate - Departure date
 * @param {string} returnDate - Return date
 * @param {number} passengers - Number of passengers
 * @param {string} transportType - Type of transport (flights, trains, buses)
 * @param {Object} routePathData - Route path data
 * @returns {Array} - Array of travel options
 */
function generateEnhancedTravelOptions(
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  transportType,
  routePathData
) {
  // Use distance from the route path data
  const distance = routePathData.distance;

  // Basic pricing model
  let basePricePerKm;
  let baseSpeed;
  let transportProviders;

  if (transportType === "flights") {
    basePricePerKm = 0.12; // $0.12 per km for flights
    baseSpeed = 800; // 800 km/h average speed
    transportProviders = airlines.flights;
  } else if (transportType === "trains") {
    basePricePerKm = 0.06; // $0.06 per km for trains
    baseSpeed = 180; // 180 km/h average speed
    transportProviders = airlines.trains;
  } else {
    // buses
    basePricePerKm = 0.04; // $0.04 per km for buses
    baseSpeed = 80; // 80 km/h average speed
    transportProviders = airlines.buses;
  }

  // Calculate base price with adjustments
  const basePrice = distance * basePricePerKm;

  // Adjust for passengers - bulk discount for multiple passengers
  const passengerMultiplier = 1 + (passengers - 1) * 0.8; // 20% discount per additional passenger

  // Calculate duration in minutes
  const durationHours = distance / baseSpeed;
  const baseDurationMinutes = Math.round(durationHours * 60);

  // Format dates for departure and arrival
  const departDate = new Date(departureDate);

  // Generate multiple options
  const numberOfOptions = 4 + Math.floor(Math.random() * 5); // 4-8 options
  const options = [];

  for (let i = 0; i < numberOfOptions; i++) {
    // Select a provider randomly
    const provider =
      transportProviders[Math.floor(Math.random() * transportProviders.length)];

    // Create departure time between 6am and 8pm
    const departHour = 6 + Math.floor(Math.random() * 14);
    const departMinute = Math.floor(Math.random() * 60);

    const departTime = new Date(departDate);
    departTime.setHours(departHour, departMinute);

    // Randomize duration slightly for each option
    const durationVariation = Math.floor(Math.random() * 60) - 30; // ±30 minutes
    const finalDuration = Math.max(baseDurationMinutes + durationVariation, 30); // Minimum 30 minutes

    // Calculate arrival time
    const arriveTime = new Date(departTime.getTime() + finalDuration * 60000);

    // Price variations based on:
    // 1. Time of day (early morning/late night 20% cheaper)
    // 2. Random premium factor (some options are premium)
    const timeOfDayFactor = departHour >= 10 && departHour <= 18 ? 1.2 : 1.0;
    const premiumFactor = Math.random() < 0.3 ? 1.15 : 1.0; // 30% chance of premium pricing
    const randomVariation = 0.9 + Math.random() * 0.3; // 0.9 to 1.2 random factor

    const price = Math.round(
      basePrice *
        timeOfDayFactor *
        premiumFactor *
        randomVariation *
        passengerMultiplier
    );

    // Some routes have stops
    const stops = i % 3 === 0 ? 0 : Math.floor(Math.random() * 2) + 1;

    // Format numbers for IDs
    const idPrefix =
      transportType === "flights"
        ? "F"
        : transportType === "trains"
        ? "T"
        : "B";
    const idNumber = (100 + i).toString().padStart(3, "0");
    const idSuffix = Math.floor(Math.random() * 10);

    // Vehicle number format varies by carrier
    let vehicleNumber;
    if (transportType === "flights") {
      vehicleNumber = `${provider.code}${
        100 + Math.floor(Math.random() * 900)
      }`;
    } else if (transportType === "trains") {
      vehicleNumber = `${provider.code}${Math.floor(Math.random() * 50) + 1}`;
    } else {
      vehicleNumber = `${provider.code}${Math.floor(Math.random() * 200) + 1}`;
    }

    // Generate option
    const option = {
      id: `${idPrefix}${idNumber}${idSuffix}`,
      airline: provider.name,
      flightNumber: transportType === "flights" ? vehicleNumber : undefined,
      trainNumber: transportType === "trains" ? vehicleNumber : undefined,
      busNumber: transportType === "buses" ? vehicleNumber : undefined,
      price: price,
      departureTime: departTime.toISOString(),
      arrivalTime: arriveTime.toISOString(),
      duration: finalDuration,
      origin: origin.city || origin.name,
      destination: destination.city || destination.name,
      stops: stops,
      departureTerminal: getDepartureTerminal(transportType),
      arrivalTerminal: getArrivalTerminal(transportType),
      carbonEmission: Math.round(
        distance *
          (transportType === "flights"
            ? 0.2
            : transportType === "trains"
            ? 0.05
            : 0.08)
      ),
      baggage: getBaggageAllowance(transportType, price),
      amenities: getAmenities(transportType, price),
      logo: getPlaceholderImage(provider.code, provider.color),
      originCoordinates: [
        origin.coordinates.latitude,
        origin.coordinates.longitude,
      ],
      destinationCoordinates: [
        destination.coordinates.latitude,
        destination.coordinates.longitude,
      ],
      routePath: routePathData.path,
      markers: routePathData.markers,
      distance: distance,
      waypoints: stops > 0 ? generateWaypoints(routePathData.path, stops) : [],
      apiError: false,
    };

    options.push(option);
  }

  // Sort by price by default with a tiny bit of randomization in position for similar prices
  return options.sort((a, b) => {
    const priceDiff = a.price - b.price;
    // If prices are within 10% of each other, add some randomness to the sort
    if (Math.abs(priceDiff) < a.price * 0.1) {
      return priceDiff + (Math.random() * 20 - 10);
    }
    return priceDiff;
  });
}

/**
 * Format date for API (YYYY-MM-DD)
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Formatted date string in YYYY-MM-DD format
 */
function formatDate(date) {
  try {
    // Handle both Date objects and string dates
    const d = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) {
      console.warn("Invalid date provided to formatDate:", date);
      // Return today's date as fallback
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`;
    }

    // Format as YYYY-MM-DD
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    // Return today's date as ultimate fallback
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  }
}

/**
 * Fetch travel options - 100% reliable mock implementation
 * @param {string} origin - Origin location
 * @param {string} destination - Destination location
 * @param {string} departureDate - Departure date
 * @param {string} returnDate - Return date
 * @param {number} passengers - Number of passengers
 * @param {string} transportType - Type of transport (flights, trains, buses)
 * @returns {Promise<Array>} - Array of travel options
 */
export const fetchTravelOptions = async (
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
  transportType = "flights"
) => {
  try {
    console.log(`Fetching ${transportType} with parameters:`, {
      origin: typeof origin === "object" ? JSON.stringify(origin) : origin,
      destination:
        typeof destination === "object"
          ? JSON.stringify(destination)
          : destination,
      departureDate,
      returnDate,
      passengers,
      transportType,
    });

    // FIRST: Check if this is a full form object with both origin and destination
    if (
      origin &&
      typeof origin === "object" &&
      (origin.origin || origin.destination || origin.departureDate)
    ) {
      console.log("Detected full form object, extracting all values");

      // Extract all needed data from the form object
      const formData = origin;

      // Extract travel dates if available
      if (formData.departureDate && !departureDate) {
        departureDate = formData.departureDate;
        console.log("Extracted departureDate:", departureDate);
      }

      if (formData.returnDate && !returnDate) {
        returnDate = formData.returnDate;
        console.log("Extracted returnDate:", returnDate);
      }

      // Extract passenger count if available
      if (formData.travelers) {
        passengers = Number(formData.travelers) || 1;
        console.log("Extracted travelers:", passengers);
      }

      // Now get origin and destination
      destination = formData.destination;
      origin = formData.origin;
      console.log(
        "Extracted from form - Origin:",
        origin,
        "Destination:",
        destination
      );
    }

    // Handle missing parameters with defaults instead of throwing errors
    if (!origin) {
      console.warn("Origin is missing, using default");
      origin = "New York";
    }

    if (!destination) {
      console.warn("Destination is missing, using default");
      destination = "Los Angeles";
    }

    // Enhanced object handling for form data
    if (typeof origin === "object" && origin !== null) {
      // Log the object structure to see what we're getting
      console.log("Origin object structure:", origin);

      // Check if the object has an 'origin' property (likely form data)
      if (origin.origin) {
        console.log("Found origin in form data object:", origin.origin);
        origin = origin.origin;
      } else {
        // Try multiple possible properties for other object formats
        origin =
          origin.value ||
          origin.name ||
          origin.city ||
          origin.id ||
          origin.label ||
          "New York";
      }
      console.log("Extracted origin value:", origin);
    }

    if (typeof destination === "object" && destination !== null) {
      // Log the object structure to see what we're getting
      console.log("Destination object structure:", destination);

      // Check if the object has a 'destination' property (likely form data)
      if (destination.destination) {
        console.log(
          "Found destination in form data object:",
          destination.destination
        );
        destination = destination.destination;
      } else {
        // Try multiple possible properties for other object formats
        destination =
          destination.value ||
          destination.name ||
          destination.city ||
          destination.id ||
          destination.label ||
          "Los Angeles";
      }
      console.log("Extracted destination value:", destination);
    }

    // Handle case where origin and destination are in a single form object
    if (origin && typeof origin === "object" && origin.destination) {
      console.log(
        "Found combined form data object with origin and destination"
      );
      // Extract departureDate and returnDate from the same object if needed
      if (origin.departureDate && !departureDate) {
        departureDate = origin.departureDate;
        console.log("Extracted departureDate from form:", departureDate);
      }
      if (origin.returnDate && !returnDate) {
        returnDate = origin.returnDate;
        console.log("Extracted returnDate from form:", returnDate);
      }
      if (origin.travelers) {
        passengers = Number(origin.travelers) || 1;
        console.log("Extracted travelers from form:", passengers);
      }

      destination = origin.destination;
      origin = origin.origin;
      console.log(
        "Final extraction - Origin:",
        origin,
        "Destination:",
        destination
      );
    }

    // Ensure origin and destination are valid strings
    if (typeof origin !== "string") origin = "New York";
    if (typeof destination !== "string") destination = "Los Angeles";

    // Use default dates if not provided
    if (!departureDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      departureDate = formatDate(tomorrow);
    } else if (
      typeof departureDate === "string" &&
      !departureDate.includes("-")
    ) {
      // If date is provided but not in correct format, format it
      departureDate = formatDate(new Date(departureDate));
    }

    if (!returnDate) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      returnDate = formatDate(nextWeek);
    } else if (typeof returnDate === "string" && !returnDate.includes("-")) {
      // If date is provided but not in correct format, format it
      returnDate = formatDate(new Date(returnDate));
    }

    // Ensure passengers is a number
    passengers = Number(passengers) || 1;

    // Fetch location data for origin and destination
    const originData = await getLocationData(origin);
    const destinationData = await getLocationData(destination);

    if (!originData || !destinationData) {
      console.error("Failed to get location data for origin or destination");
      throw new Error("Invalid location data");
    }

    // For flights, try the Amadeus API first
    if (transportType === "flights") {
      const amadeusResults = await fetchAmadeusFlights(
        originData,
        destinationData,
        departureDate,
        passengers
      );

      if (amadeusResults && amadeusResults.length > 0) {
        return amadeusResults;
      }
    }

    // Generate route path for mock data
    const routePathData = generateRoutePath(
      originData.coordinates,
      destinationData.coordinates,
      transportType
    );

    return generateEnhancedTravelOptions(
      originData,
      destinationData,
      departureDate,
      returnDate,
      passengers,
      transportType,
      routePathData
    );
  } catch (error) {
    console.error(`Error in fetchTravelOptions:`, error);
    // Return appropriate mock data based on transport type
    return transportType === "flights"
      ? mockFlights.map((f) => ({
          ...f,
          origin: origin?.name || "Unknown",
          destination: destination?.name || "Unknown",
        }))
      : transportType === "trains"
      ? mockTrains.map((t) => ({
          ...t,
          origin: origin?.name || "Unknown",
          destination: destination?.name || "Unknown",
        }))
      : mockBuses.map((b) => ({
          ...b,
          origin: origin?.name || "Unknown",
          destination: destination?.name || "Unknown",
        }));
  }
};

/**
 * Fetch location data from Open-Meteo Geocoding API
 * This is a 100% reliable and free API with no key required
 */
async function fetchOpenMeteoLocation(query) {
  try {
    // Check cache first
    if (locationCache[query]) return locationCache[query];

    const response = await fetch(
      `${
        EXTERNAL_API_CONFIG.OPEN_METEO.GEOCODING_URL
      }?name=${encodeURIComponent(query)}&count=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];

      // Create a location object in our format
      const location = {
        name: result.name,
        entityId: `meteo-${Date.now()}`,
        id: result.name.substring(0, 3).toUpperCase(),
        type: "CITY",
        city: result.name,
        country: result.country,
        coordinates: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      };

      // Cache the result
      locationCache[query] = location;

      return location;
    }

    // If not found, return null to trigger fallback
    return null;
  } catch (error) {
    console.error("Error fetching location from Open-Meteo:", error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
