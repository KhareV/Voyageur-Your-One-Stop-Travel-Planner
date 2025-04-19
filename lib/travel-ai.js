import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_PUBLIC_GEMINI_API_KEY;

// Check if API key is available
if (!API_KEY) {
  console.warn(
    "Warning: Gemini API key is not set. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables."
  );
}

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Safety settings to ensure appropriate responses
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function processDestinationQuery(query) {
  // Verify API key is available
  if (!API_KEY) {
    return "API key not configured. Please set up your NEXT_PUBLIC_GEMINI_API_KEY environment variable.";
  }

  try {
    // Use the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are Voyageur's Travel Planning Assistant, designed to create personalized travel itineraries.
      
      FORMAT YOUR RESPONSE AS:
      1. Start with a brief introduction to the destination (2-3 sentences)
      2. Create a day-by-day itinerary with specific recommendations:
         - Use "Day 1:", "Day 2:" format
         - Include morning, afternoon, and evening activities
         - Suggest specific attractions, restaurants, and experiences
         - Include realistic travel times between attractions
      3. Include practical tips at the end (best time to visit, local transportation, etc.)
      
      Make the itinerary realistic in terms of:
      - Travel times between attractions
      - Opening hours (don't suggest visiting places when they're likely closed)
      - Geographic clustering (group nearby attractions on the same day)
      
      The itinerary should reflect the traveler's preferences, trip duration, and travel style.
      
      USER QUERY: ${query}
      
      Please create a detailed travel itinerary based on this information.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating travel itinerary:", error);

    if (error instanceof Error) {
      return `I'm sorry, there was an error creating your travel itinerary: ${error.message}`;
    }

    return "I'm sorry, there was an error creating your travel itinerary. Please try again later.";
  }
}

export async function analyzeDestinationImage(imageData) {
  // Verify API key is available
  if (!API_KEY) {
    return "API key not configured. Please set up your NEXT_PUBLIC_GEMINI_API_KEY environment variable.";
  }

  try {
    // Use Gemini model with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert base64 image data to a GoogleGenerativeAI-compatible format
    const imageParts = [
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg", // Assuming JPEG; adjust if needed
        },
      },
    ];

    const prompt = `
      You are Voyageur's Travel Image Analyzer, designed to identify travel destinations and landmarks.
      
      Please analyze this image and provide:
      
      1. Location identification: What place/landmark is shown in the image?
      2. Brief description: What makes this place special or interesting?
      3. Travel recommendations: What should travelers know about visiting this place?
      4. Nearby attractions: What other places are worth visiting in the area?
      5. Best time to visit: When is the ideal time to visit this location?
      
      If you cannot identify the specific location with confidence, describe what you can see 
      and provide general information about what appears to be the type of destination.
      
      Please analyze the following image:
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...imageParts],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
      safetySettings,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing destination image:", error);

    if (error instanceof Error) {
      return `I'm sorry, there was an error analyzing the uploaded image: ${error.message}`;
    }

    return "I'm sorry, there was an error analyzing the uploaded image. Please try again later.";
  }
}
