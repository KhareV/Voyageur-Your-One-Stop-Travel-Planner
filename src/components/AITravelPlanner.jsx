import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiMapPin,
  FiSend,
  FiLoader,
  FiImage,
  FiX,
  FiArrowRight,
  FiCoffee,
  FiHome,
  FiClock,
  FiStar,
  FiTrendingUp,
  FiSunrise,
  FiDownload,
  FiShare2,
} from "react-icons/fi";
import {
  processDestinationQuery,
  analyzeDestinationImage,
} from "../../lib/travel-ai";
import html2pdf from "html2pdf.js";

export default function AITravelPlannerPage() {
  // States
  const [activeTab, setActiveTab] = useState("text");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [tripDuration, setTripDuration] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("purple"); // Default theme
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shareableLink, setShareableLink] = useState("");
  const [showShareToast, setShowShareToast] = useState(false);

  const fileInputRef = useRef(null);
  const itineraryRef = useRef(null);

  // Mouse movement effect for mesh background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Theme color mapping
  const themeColors = {
    purple: {
      primary: "bg-gradient-to-r from-purple-600 to-indigo-600",
      secondary: "bg-purple-50",
      accent: "bg-purple-200",
      text: "text-purple-700",
      border: "border-purple-500",
      hover: "hover:bg-purple-700",
      lightHover: "hover:bg-purple-100",
      focus: "focus:ring-purple-500 focus:border-purple-500",
      button: "bg-gradient-to-r from-purple-600 to-indigo-600",
    },
    teal: {
      primary: "bg-gradient-to-r from-teal-500 to-emerald-500",
      secondary: "bg-teal-50",
      accent: "bg-teal-200",
      text: "text-teal-700",
      border: "border-teal-500",
      hover: "hover:bg-teal-700",
      lightHover: "hover:bg-teal-100",
      focus: "focus:ring-teal-500 focus:border-teal-500",
      button: "bg-gradient-to-r from-teal-500 to-emerald-500",
    },
    amber: {
      primary: "bg-gradient-to-r from-amber-500 to-orange-500",
      secondary: "bg-amber-50",
      accent: "bg-amber-200",
      text: "text-amber-700",
      border: "border-amber-500",
      hover: "hover:bg-amber-600",
      lightHover: "hover:bg-amber-100",
      focus: "focus:ring-amber-500 focus:border-amber-500",
      button: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
  };

  const theme = themeColors[selectedTheme];

  // Handle text query submission
  const handleTextSubmit = async (e) => {
    e.preventDefault();

    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const fullQuery = `Destination: ${destination}, Duration: ${
        tripDuration || "flexible"
      }, Travel Style: ${travelStyle || "balanced"}, Additional Info: ${query}`;
      const response = await processDestinationQuery(fullQuery);
      setResult(response);

      // Generate a shareable link based on query parameters
      const queryParams = new URLSearchParams({
        destination,
        duration: tripDuration || "",
        style: travelStyle || "",
        query: query || "",
      }).toString();

      setShareableLink(
        `${window.location.origin}${window.location.pathname}?${queryParams}`
      );
    } catch (err) {
      setError(
        "Sorry, there was an error creating your itinerary. Please try again later."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image analysis submission
  const handleImageSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError("Please upload an image to analyze");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);
      const base64Data = base64Image.split(",")[1];

      const response = await analyzeDestinationImage(base64Data);
      setResult(response);
    } catch (err) {
      setError(
        "Sorry, there was an error analyzing your image. Please try again later."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to PDF functionality
  const exportToPdf = () => {
    if (!itineraryRef.current) return;

    const opt = {
      margin: 10,
      filename: `${destination || "Travel"}_Itinerary.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Clone the itinerary element to modify it for PDF
    const element = itineraryRef.current.cloneNode(true);

    // Add a header with the logo and title
    const header = document.createElement("div");
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; padding: 10px;">
        <h1 style="color: #6d28d9; font-size: 24px; margin-bottom: 5px;">Voyageur AI Travel Planner</h1>
        <h2 style="color: #4c1d95; font-size: 20px;">${destination} Itinerary</h2>
        <p style="color: #6b7280; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    `;

    element.prepend(header);

    // Convert element to PDF
    html2pdf().from(element).set(opt).save();
  };

  // Share itinerary functionality
  const shareItinerary = async () => {
    const title = `${destination} Travel Itinerary`;
    const text = `Check out my travel itinerary for ${destination}!`;

    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareableLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  // Fallback sharing method (copy to clipboard)
  const fallbackShare = () => {
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size exceeds 5MB limit");
        return;
      }

      if (!file.type.includes("image/")) {
        setError("Please upload an image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Clear the selected image
  const clearSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format the AI output for display
  const formatAiOutput = (text) => {
    if (!text) return "";

    return text
      .replace(/\n/g, "<br />")
      .replace(/•/g, "&bull;")
      .replace(
        /\*\*(.*?)\*\*/g,
        `<span class="font-semibold ${theme.text}">$1</span>`
      )
      .replace(/\*(.*?)\*/g, `<span class="italic">$1</span>`);
  };

  // Extract days from the AI response for visual representation
  const extractDays = (text) => {
    if (!text) return [];

    // Extract day sections using regex or simple string matching
    const dayMatches = text.match(/Day \d+:[\s\S]*?(?=Day \d+:|$)/g) || [];

    return dayMatches.map((day) => {
      const dayNumber = day.match(/Day (\d+):/)?.[1] || "";

      // Extract activities for the day
      const activities = day
        .replace(/Day \d+:/, "")
        .trim()
        .split("\n")
        .filter((item) => item.trim().length > 0)
        .map((item) => item.replace(/^[•\-]\s*/, "").trim())
        .map((item) =>
          item.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")
        );

      return {
        dayNumber,
        activities,
      };
    });
  };

  const itineraryDays = result ? extractDays(result) : [];
  const isApiKeyConfigured = true;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="relative min-h-screen pt-20 pb-16 overflow-hidden">
      {/* Animated mesh background */}
      <div
        className="absolute inset-0 opacity-30 -z-10 overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${
            mousePosition.y
          }px, rgba(139, 92, 246, 0.3), transparent 30%),
                      radial-gradient(circle at ${mousePosition.x - 400}px ${
            mousePosition.y + 200
          }px, rgba(79, 70, 229, 0.4), transparent 40%),
                      radial-gradient(circle at ${mousePosition.x + 200}px ${
            mousePosition.y - 300
          }px, rgba(224, 231, 255, 0.5), transparent 35%),
                      radial-gradient(circle at ${mousePosition.x - 100}px ${
            mousePosition.y - 100
          }px, rgba(249, 168, 212, 0.3), transparent 25%)`,
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[100px] bg-gradient-to-br from-white/30 via-white/60 to-white/30"></div>
      </div>

      {/* Share link toast notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              delay: 0.2,
              duration: 0.8,
            }}
          >
            <h1 className="text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600">
              Voyageur AI Itinerary Planner
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-3xl mx-auto text-lg text-gray-700"
          >
            Get personalized travel itineraries for your next adventure, powered
            by AI
          </motion.p>

          {/* Theme selector */}
          <motion.div
            className="flex justify-center mt-4 gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setSelectedTheme("purple")}
              className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md transition-all duration-200 ${
                selectedTheme === "purple"
                  ? "ring-2 ring-offset-2 ring-purple-500 scale-110"
                  : "opacity-70 hover:scale-105"
              }`}
            ></button>
            <button
              onClick={() => setSelectedTheme("teal")}
              className={`w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md transition-all duration-200 ${
                selectedTheme === "teal"
                  ? "ring-2 ring-offset-2 ring-teal-500 scale-110"
                  : "opacity-70 hover:scale-105"
              }`}
            ></button>
            <button
              onClick={() => setSelectedTheme("amber")}
              className={`w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-md transition-all duration-200 ${
                selectedTheme === "amber"
                  ? "ring-2 ring-offset-2 ring-amber-500 scale-110"
                  : "opacity-70 hover:scale-105"
              }`}
            ></button>
          </motion.div>
        </motion.div>

        {!isApiKeyConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">
              Gemini API Key Not Configured
            </h3>
            <p>
              To use the AI Travel Planner, you need to set up your Google
              Gemini API key. See documentation for details.
            </p>
          </motion.div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Input section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-white/50">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-300 ${
                    activeTab === "text"
                      ? `${theme.text} border-b-2 ${theme.border}`
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("text")}
                >
                  <FiCalendar
                    className={`inline mr-2 ${
                      activeTab === "text" ? "animate-bounce" : ""
                    }`}
                  />
                  Plan a Trip
                </button>
                <button
                  className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-300 ${
                    activeTab === "image"
                      ? `${theme.text} border-b-2 ${theme.border}`
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("image")}
                >
                  <FiImage
                    className={`inline mr-2 ${
                      activeTab === "image" ? "animate-bounce" : ""
                    }`}
                  />
                  Identify Location
                </button>
              </div>

              {/* Text input form */}
              <AnimatePresence mode="wait">
                {activeTab === "text" && (
                  <motion.div
                    key="text-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="p-6"
                  >
                    <form onSubmit={handleTextSubmit}>
                      <motion.div className="mb-4" variants={itemVariants}>
                        <label
                          htmlFor="destination"
                          className={`block text-sm font-medium ${theme.text} mb-2`}
                        >
                          Where do you want to go?
                        </label>
                        <div className="relative group">
                          <FiMapPin className="absolute top-3 left-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                          <input
                            id="destination"
                            type="text"
                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${theme.focus} transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white`}
                            placeholder="Paris, Tokyo, New York..."
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </motion.div>

                      <motion.div className="mb-4" variants={itemVariants}>
                        <label
                          htmlFor="duration"
                          className={`block text-sm font-medium ${theme.text} mb-2`}
                        >
                          Trip Duration
                        </label>
                        <div className="relative group">
                          <FiClock className="absolute top-3 left-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                          <select
                            id="duration"
                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${theme.focus} transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white`}
                            value={tripDuration}
                            onChange={(e) => setTripDuration(e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">Select trip duration</option>
                            <option value="weekend">Weekend (2-3 days)</option>
                            <option value="short">Short trip (4-5 days)</option>
                            <option value="week">One week</option>
                            <option value="twoWeeks">Two weeks</option>
                            <option value="long">Long trip (3+ weeks)</option>
                          </select>
                        </div>
                      </motion.div>

                      <motion.div className="mb-4" variants={itemVariants}>
                        <label
                          htmlFor="travelStyle"
                          className={`block text-sm font-medium ${theme.text} mb-2`}
                        >
                          Travel Style
                        </label>
                        <div className="relative group">
                          <FiCoffee className="absolute top-3 left-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                          <select
                            id="travelStyle"
                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${theme.focus} transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white`}
                            value={travelStyle}
                            onChange={(e) => setTravelStyle(e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">Select travel style</option>
                            <option value="budget">Budget-friendly</option>
                            <option value="luxury">Luxury</option>
                            <option value="culture">
                              Cultural exploration
                            </option>
                            <option value="adventure">Adventure</option>
                            <option value="family">Family-friendly</option>
                            <option value="relaxation">Relaxation</option>
                            <option value="foodie">Foodie experience</option>
                          </select>
                        </div>
                      </motion.div>

                      <motion.div className="mb-4" variants={itemVariants}>
                        <label
                          htmlFor="preferences"
                          className={`block text-sm font-medium ${theme.text} mb-2`}
                        >
                          Additional preferences or information
                        </label>
                        <textarea
                          id="preferences"
                          rows={5}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${theme.focus} transition-all duration-300 bg-white/70 backdrop-blur-sm hover:bg-white`}
                          placeholder="Tell us about your interests, special requirements, or must-see attractions..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          disabled={isLoading}
                        ></textarea>
                      </motion.div>

                      <motion.button
                        whileHover={{
                          scale: 1.03,
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isLoading || !destination.trim()}
                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-lg text-base font-medium text-white ${theme.button} hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.focus} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
                      >
                        {isLoading ? (
                          <>
                            <FiLoader className="animate-spin mr-2" />
                            Creating Itinerary...
                          </>
                        ) : (
                          <>
                            <FiSend className="mr-2" />
                            Generate Itinerary
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* Image upload form */}
                {activeTab === "image" && (
                  <motion.div
                    key="image-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="p-6"
                  >
                    <form onSubmit={handleImageSubmit}>
                      <div className="mb-4">
                        <label
                          className={`block text-sm font-medium ${theme.text} mb-2`}
                        >
                          Upload an image of a location or landmark
                        </label>

                        {!imagePreview ? (
                          <motion.div
                            whileHover={{
                              scale: 1.02,
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            }}
                            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:${theme.border} transition-colors duration-300 bg-white/50 hover:bg-white/80`}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0.5 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                            >
                              <FiImage
                                className={`h-16 w-16 ${theme.text} opacity-50`}
                              />
                            </motion.div>
                            <p className="mt-2 text-gray-600">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg border-2 border-white/50">
                              <img
                                src={imagePreview}
                                alt="Location preview"
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <motion.button
                              whileHover={{
                                scale: 1.1,
                                backgroundColor: "#f43f5e",
                              }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={clearSelectedImage}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors duration-300"
                            >
                              <FiX className="h-5 w-5 text-gray-600" />
                            </motion.button>
                          </motion.div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{
                          scale: 1.03,
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isLoading || !imageFile}
                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-lg text-base font-medium text-white ${theme.button} hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.focus} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
                      >
                        {isLoading ? (
                          <>
                            <FiLoader className="animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <FiSend className="mr-2" />
                            Identify Location
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm shadow-inner"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="px-6 py-4 bg-gray-50/70 backdrop-blur-sm border-t border-gray-200 text-xs text-gray-500">
                <p>
                  <strong>Note:</strong> This AI assistant creates personalized
                  travel suggestions based on your inputs. Results may vary, and
                  we recommend verifying details before finalizing your plans.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right panel - Results */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-white/50"
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="relative w-24 h-24"
                  >
                    <div
                      className={`absolute inset-0 rounded-full ${theme.border} border-t-4 border-b-4 border-r-4 border-l-transparent opacity-75`}
                    ></div>
                    <div className="absolute inset-2 rounded-full border-2 border-white"></div>
                    <div
                      className={`absolute inset-4 rounded-full ${theme.accent}`}
                    ></div>
                    <FiStar className="absolute inset-0 m-auto text-white text-xl" />
                  </motion.div>

                  <motion.p
                    className={`mt-6 text-xl font-medium ${theme.text}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Creating your perfect itinerary...
                  </motion.p>
                  <motion.p
                    className="mt-2 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5 }}
                  >
                    This may take a few moments
                  </motion.p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                  ref={itineraryRef}
                >
                  {/* Itinerary Overview Card */}
                  <motion.div
                    className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 lg:p-8 border border-white/50 hover:shadow-2xl transition-all duration-500"
                    whileHover={{ y: -5 }}
                  >
                    <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
                      Your Travel Itinerary
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatAiOutput(result),
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Visual Day-by-Day Itinerary */}
                  {itineraryDays.length > 0 && (
                    <motion.div
                      className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 lg:p-8 border border-white/50 hover:shadow-2xl transition-all duration-500"
                      whileHover={{ y: -5 }}
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>
                        Day-by-Day Schedule
                      </h2>
                      <div className="space-y-6">
                        {itineraryDays.map((day, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`border-l-4 ${theme.border} pl-4 py-2 hover:bg-white/40 rounded-r-lg transition-all duration-300`}
                            whileHover={{
                              x: 5,
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                          >
                            <motion.h3
                              className={`text-lg font-bold ${theme.text} mb-3 flex items-center`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                            >
                              <FiSunrise className="mr-2" />
                              Day {day.dayNumber}
                            </motion.h3>
                            <ul className="space-y-2">
                              {day.activities.map((activity, actIndex) => (
                                <motion.li
                                  key={actIndex}
                                  className="flex items-start group"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: index * 0.1 + actIndex * 0.05 + 0.3,
                                  }}
                                >
                                  <span
                                    className={`h-5 w-5 min-w-[1.25rem] rounded-full ${theme.secondary} ${theme.text} text-xs flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-all duration-300`}
                                  >
                                    {actIndex + 1}
                                  </span>
                                  <span className="group-hover:text-gray-900 transition-colors duration-300">
                                    {activity}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </div>

                      {/* Export and Share Buttons */}
                      <motion.div
                        className="mt-8 flex flex-wrap gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.button
                          onClick={exportToPdf}
                          whileHover={{
                            scale: 1.05,
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 ${theme.button} text-white rounded-lg transition-all duration-300 flex items-center shadow-lg`}
                        >
                          <FiDownload className="mr-2" />
                          Export to PDF
                        </motion.button>

                        <motion.button
                          onClick={shareItinerary}
                          whileHover={{
                            scale: 1.05,
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center shadow-md"
                        >
                          <FiShare2 className="mr-2" />
                          Share Itinerary
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Destination Tips */}
                  <motion.div
                    className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 lg:p-8 border border-white/50 hover:shadow-2xl transition-all duration-500"
                    whileHover={{ y: -5 }}
                  >
                    <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
                      Travel Tips & Notes
                    </h2>
                    <motion.div
                      className={`${theme.secondary} p-6 rounded-lg border ${theme.border} shadow-inner`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3
                        className={`${theme.text} font-medium mb-3 text-lg flex items-center`}
                      >
                        <FiStar className="mr-2" />
                        Helpful Travel Tips
                      </h3>
                      <motion.ul
                        className="space-y-4 text-gray-700"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <motion.li
                          className="flex items-start group"
                          variants={itemVariants}
                        >
                          <div
                            className={`p-2 rounded-full ${theme.accent} mr-3 group-hover:scale-110 transition-all duration-300`}
                          >
                            <FiHome className={`${theme.text}`} />
                          </div>
                          <span className="group-hover:text-gray-900 transition-colors duration-300">
                            Always book accommodations in advance, especially
                            during peak seasons
                          </span>
                        </motion.li>
                        <motion.li
                          className="flex items-start group"
                          variants={itemVariants}
                        >
                          <div
                            className={`p-2 rounded-full ${theme.accent} mr-3 group-hover:scale-110 transition-all duration-300`}
                          >
                            <FiClock className={`${theme.text}`} />
                          </div>
                          <span className="group-hover:text-gray-900 transition-colors duration-300">
                            Check opening hours for attractions as they may vary
                            by season
                          </span>
                        </motion.li>
                        <motion.li
                          className="flex items-start group"
                          variants={itemVariants}
                        >
                          <div
                            className={`p-2 rounded-full ${theme.accent} mr-3 group-hover:scale-110 transition-all duration-300`}
                          >
                            <FiMapPin className={`${theme.text}`} />
                          </div>
                          <span className="group-hover:text-gray-900 transition-colors duration-300">
                            Download offline maps for your destination before
                            traveling
                          </span>
                        </motion.li>
                      </motion.ul>
                    </motion.div>

                    <motion.div
                      className="text-center mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <motion.a
                        href="/trip-planning"
                        className={`inline-flex items-center ${theme.text} hover:underline font-medium text-lg relative group`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue planning with detailed options
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        <span
                          className={`absolute bottom-0 left-0 w-0 h-0.5 ${theme.primary} group-hover:w-full transition-all duration-300`}
                        ></span>
                      </motion.a>
                    </motion.div>
                  </motion.div>

                  {/* Disclaimer */}
                  <motion.div
                    className="text-sm text-gray-500 italic bg-white/50 backdrop-blur-sm p-4 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <p>
                      Note: This itinerary is generated based on AI suggestions.
                      Opening hours, ticket prices, and availability may change.
                      We recommend verifying details before finalizing your
                      plans.
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center border border-white/50 hover:shadow-2xl transition-all duration-500"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      delay: 0.3,
                    }}
                    className={`relative h-40 w-40 mb-6 rounded-full ${theme.secondary} flex items-center justify-center`}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    >
                      <FiTrendingUp className={`text-6xl ${theme.text}`} />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Voyageur AI Travel Planner
                  </motion.h2>

                  <motion.p
                    className="text-gray-600 max-w-lg mx-auto text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Tell us where you want to go, and we'll create a
                    personalized itinerary just for you. Add details about your
                    preferences for even better results.
                  </motion.p>

                  <motion.div
                    className="mt-6 flex flex-wrap justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    {["Tokyo", "Paris", "New York", "Bali"].map(
                      (place, idx) => (
                        <motion.button
                          key={place}
                          onClick={() => {
                            setDestination(place);
                            setActiveTab("text");
                          }}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: 1 + idx * 0.1 },
                          }}
                          className={`px-4 py-2 rounded-full ${theme.secondary} ${theme.text} text-sm font-medium border ${theme.border} hover:shadow-md transition-all duration-300`}
                        >
                          Try "{place}"
                        </motion.button>
                      )
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
