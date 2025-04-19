import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Train,
  Bus,
  Calendar,
  MapPin,
  Filter,
  Users,
  Search,
  Clock,
  ArrowRight,
  Info,
  RefreshCcw,
  Leaf,
  ChevronDown,
  X,
  Award,
  Sparkles,
} from "lucide-react";
import TransportCard from "./TransportCard";
import { fetchTravelOptions } from "../services/travelApi";
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const TravelPage = () => {
  // Add navigate for redirection
  const navigate = useNavigate();
  const controls = useAnimation();

  // State variables
  const [activeTab, setActiveTab] = useState("flights");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [travelClass, setTravelClass] = useState("economy");
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [travelOptions, setTravelOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    maxDuration: 48, // hours
    maxStops: 2,
    airlines: [],
    departureTime: "anytime",
    arrivalTime: "anytime",
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(1);
  const heroRef = useRef(null);
  const resultsRef = useRef(null);
  const mapRef = useRef(null);

  // Popular city suggestions for quick selection
  const popularOrigins = [
    "New York (JFK)",
    "London (LHR)",
    "Paris (CDG)",
    "Tokyo (HND)",
    "Dubai (DXB)",
    "Los Angeles (LAX)",
  ];

  const popularDestinations = [
    "Paris (CDG)",
    "Tokyo (HND)",
    "Bali (DPS)",
    "Sydney (SYD)",
    "Rome (FCO)",
    "Cancun (CUN)",
  ];

  // Handle mouse movement for background effect with enhanced responsiveness
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Subtle parallax effect for background gradient
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

      // Apply subtle movement to background gradients
      if (heroRef.current) {
        const bg = heroRef.current.querySelector(".bg-gradient-elements");
        if (bg) {
          bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Enhanced GSAP animations with better timing
  useEffect(() => {
    // Hero section parallax effect with more sophisticated animation
    if (heroRef.current) {
      const heroElements =
        heroRef.current.querySelectorAll(".animate-on-scroll");

      heroElements.forEach((element, index) => {
        gsap.fromTo(
          element,
          {
            y: 100 + index * 20,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Add floating animation to decorative elements
      const decorElements = heroRef.current.querySelectorAll(".decor-element");
      decorElements.forEach((elem) => {
        gsap.to(elem, {
          y: "random(-10, 10)",
          x: "random(-5, 5)",
          rotation: "random(-5, 5)",
          duration: "random(3, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    // Results animation when they appear with staggered reveal
    if (resultsRef.current && searchPerformed) {
      const resultItems = resultsRef.current.querySelectorAll(".result-item");
      gsap.fromTo(
        resultItems,
        {
          y: 50,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.2)",
          clearProps: "all",
        }
      );
    }

    return () => {
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [searchPerformed]);

  // Handler for viewing route on map with enhanced animation
  const handleViewRoute = (option) => {
    setSelectedRoute(option);

    if (option.coordinates) {
      const originCoords = [
        option.coordinates.origin.latitude,
        option.coordinates.origin.longitude,
      ];

      const destCoords = [
        option.coordinates.destination.latitude,
        option.coordinates.destination.longitude,
      ];

      // Calculate center position between origin and destination
      const centerLat = (originCoords[0] + destCoords[0]) / 2;
      const centerLng = (originCoords[1] + destCoords[1]) / 2;

      // Animate the map view change
      controls.start({
        opacity: [0.5, 1],
        scale: [0.9, 1],
        transition: { duration: 0.5 },
      });

      setMapCenter([centerLat, centerLng]);

      // Calculate appropriate zoom level
      const distance = calculateDistance(
        originCoords[0],
        originCoords[1],
        destCoords[0],
        destCoords[1]
      );

      // Adjust zoom based on distance with smoother transition
      if (distance > 8000) setMapZoom(2);
      else if (distance > 4000) setMapZoom(3);
      else if (distance > 2000) setMapZoom(4);
      else if (distance > 1000) setMapZoom(5);
      else setMapZoom(6);

      // Scroll to map section with enhanced smooth scrolling
      const mapSection = document.getElementById("map-section");
      if (mapSection) {
        mapSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Add highlight effect to map container
        gsap.fromTo(
          mapSection,
          { boxShadow: "0 0 0 rgba(99, 102, 241, 0)" },
          {
            boxShadow:
              "0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)",
            duration: 0.8,
            yoyo: true,
            repeat: 1,
          }
        );
      }
    }
  };

  // Handler for selecting a transport option
  const handleSelectTransport = (option) => {
    // Create a base transport option with all required common properties
    const baseOption = {
      transportType: activeTab || "unknown", // Use activeTab to ensure transportType matches current tab
      origin: option.origin || "",
      destination: option.destination || "",
      departureTime: option.departureTime || new Date().toISOString(),
      arrivalTime: option.arrivalTime || new Date().toISOString(),
      price: option.price || 0,
      airline: option.airline || option.provider || "Unknown Provider",
      logo: option.logo || null,
      isRoundTrip: option.isRoundTrip || isRoundTrip || false,
      passengers: option.passengers || travelers || 1,
      duration: option.duration || null,
    };

    // Add transport-specific properties based on the actual transport type
    let validatedOption;
    switch (activeTab) {
      case "flights":
        validatedOption = {
          ...baseOption,
          flightNumber:
            option.flightNumber || `FL${Math.floor(Math.random() * 1000)}`,
          // Flight-specific fields
          aircraft: option.aircraft || null,
          terminal: option.terminal || null,
          gate: option.gate || null,
          // Set other types' properties to null
          trainNumber: null,
          busNumber: null,
        };
        break;
      case "trains":
        validatedOption = {
          ...baseOption,
          trainNumber:
            option.trainNumber || `TR${Math.floor(Math.random() * 1000)}`,
          // Train-specific fields
          platform: option.platform || null,
          trainClass: option.trainClass || null,
          // Set other types' properties to null
          flightNumber: null,
          busNumber: null,
        };
        break;
      case "buses":
        validatedOption = {
          ...baseOption,
          busNumber:
            option.busNumber || `BU${Math.floor(Math.random() * 1000)}`,
          // Bus-specific fields
          busStand: option.busStand || null,
          // Set other types' properties to null
          flightNumber: null,
          trainNumber: null,
        };
        break;
      default:
        // For unknown type, provide values for all possible properties
        validatedOption = {
          ...baseOption,
          flightNumber: option.flightNumber || null,
          trainNumber: option.trainNumber || null,
          busNumber: option.busNumber || null,
        };
    }

    // Include any amenities and other remaining properties from original option
    if (option.amenities) {
      validatedOption.amenities = option.amenities;
    }

    if (option.coordinates) {
      validatedOption.coordinates = option.coordinates;
    }

    if (option.stops !== undefined) {
      validatedOption.stops = option.stops;
    }

    // Store the fully validated/sanitized option
    sessionStorage.setItem(
      "selectedTravelOption",
      JSON.stringify(validatedOption)
    );

    // Navigate to booking confirmation page
    navigate("/booking-confirmation");
  };

  // Handle search submission with loading animation
  const handleSearch = async (e) => {
    e.preventDefault();

    // Start button loading animation
    const searchButton = e.currentTarget.querySelector("button[type='submit']");
    if (searchButton) {
      gsap.to(searchButton, {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    }

    setIsLoading(true);
    setSearchPerformed(false);

    try {
      // Add subtle pulse animation to form during search
      const form = e.currentTarget;
      gsap.to(form, {
        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.3)",
        duration: 0.5,
        yoyo: true,
        repeat: 3,
      });

      const options = await fetchTravelOptions({
        origin,
        destination,
        departureDate,
        returnDate: isRoundTrip ? returnDate : null,
        travelers,
        travelClass,
        transportType: activeTab,
      });

      setTravelOptions(options);
      setSearchPerformed(true);

      // Scroll to results section with enhanced animation
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Add highlight animation to results container
          gsap.fromTo(
            resultsRef.current,
            { backgroundColor: "rgba(219, 234, 254, 0.7)" },
            {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              duration: 1.5,
              ease: "power2.out",
            }
          );

          // Confetti effect for successful search
          if (options && options.length > 0) {
            createConfettiEffect(resultsRef.current);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error fetching travel options:", error);
      // TODO: Add error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  // Create confetti effect for successful search
  const createConfettiEffect = (container) => {
    const confettiCount = 50;
    const colors = ["#6366F1", "#818CF8", "#4F46E5", "#4338CA"];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-particle";

      // Randomize confetti properties
      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = color;
      confetti.style.position = "absolute";
      confetti.style.top = "-20px";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(confetti);

      // Animate the confetti
      gsap.to(confetti, {
        y: `${Math.random() * 200 + 100}`,
        x: `${(Math.random() - 0.5) * 200}`,
        rotation: `${Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)}`,
        duration: Math.random() * 2 + 1,
        ease: "power1.out",
        opacity: 0,
        onComplete: () => confetti.remove(),
      });
    }
  };

  // Helper function to calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Filter the results based on selected filters
  const filteredOptions = travelOptions.filter((option) => {
    return (
      option.price >= filters.minPrice &&
      option.price <= filters.maxPrice &&
      option.duration <= filters.maxDuration * 60 && // convert hours to minutes
      option.stops <= filters.maxStops &&
      (filters.airlines.length === 0 ||
        filters.airlines.includes(option.airline))
    );
  });

  // Tab animation variants with enhanced transitions
  const tabVariants = {
    active: {
      color: "#6366F1",
      borderBottom: "3px solid #6366F1",
      scale: 1.03,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    inactive: {
      color: "#6B7280",
      borderBottom: "3px solid transparent",
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2 },
    },
  };

  // Get the right icon for transportation mode
  const getTabIcon = (tab) => {
    switch (tab) {
      case "flights":
        return <Plane className="mr-2 h-5 w-5" />;
      case "trains":
        return <Train className="mr-2 h-5 w-5" />;
      case "buses":
        return <Bus className="mr-2 h-5 w-5" />;
      default:
        return <Plane className="mr-2 h-5 w-5" />;
    }
  };

  // Generate flight path for map
  const generateCurvedPath = (start, end) => {
    if (!start || !end) return [];

    const latlngs = [];
    const offsetX = end[1] - start[1];
    const offsetY = end[0] - start[0];
    const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const numPoints = 100;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = start[0] + offsetY * t;
      const lng = start[1] + offsetX * t;

      // Add curvature
      const offset = (Math.sin(Math.PI * t) * r) / 5;

      // Get perpendicular unit vector
      const perpX = -offsetY / r;
      const perpY = offsetX / r;

      latlngs.push([lat + offset * perpX, lng + offset * perpY]);
    }

    return latlngs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dynamic background effect with responsive gradients */}
      <div
        className="absolute inset-0 opacity-40 -z-10 overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${
            mousePosition.y
          }px, rgba(99, 102, 241, 0.3), transparent 30%),
                      radial-gradient(circle at ${mousePosition.x - 400}px ${
            mousePosition.y + 200
          }px, rgba(139, 92, 246, 0.4), transparent 40%),
                      radial-gradient(circle at ${mousePosition.x + 200}px ${
            mousePosition.y - 300
          }px, rgba(236, 72, 153, 0.3), transparent 35%)`,
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[100px] bg-gradient-to-br from-white/30 via-white/60 to-white/30 bg-gradient-elements"></div>
      </div>

      {/* Hero Section with enhanced visuals */}
      <div
        ref={heroRef}
        className="relative pt-28 pb-20 px-6 md:px-10 lg:px-20 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-12 h-12 rounded-full bg-indigo-500/20 backdrop-blur-xl decor-element"></div>
        <div className="absolute top-60 right-20 w-16 h-16 rounded-full bg-purple-500/20 backdrop-blur-xl decor-element"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-pink-500/20 backdrop-blur-xl decor-element"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto text-center animate-on-scroll"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow-lg shadow-indigo-500/20">
              <Sparkles className="inline-block mr-1 h-3.5 w-3.5" /> Discover
              Amazing Journeys
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 mb-6">
            Discover Your Perfect Journey
          </h1>
          <motion.p
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Search across hundreds of travel options to find the best deals on
            flights, trains, and buses.
          </motion.p>
        </motion.div>

        {/* Search Form Card with enhanced animations */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          whileHover={{
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
          }}
          className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden animate-on-scroll hover:border-indigo-200 transition-all duration-500"
        >
          {/* Transport Type Tabs with hover effects */}
          <div className="flex border-b border-gray-200">
            {["flights", "trains", "buses"].map((tab) => (
              <motion.button
                key={tab}
                variants={tabVariants}
                animate={activeTab === tab ? "active" : "inactive"}
                whileHover="hover"
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-4 px-4 text-center font-medium flex items-center justify-center capitalize transition-all duration-300"
              >
                {getTabIcon(tab)}
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Search Form with enhanced interactions */}
          <form onSubmit={handleSearch} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin Input with animation */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Enter origin city or airport"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 hover:bg-white group-hover:border-indigo-300"
                    required
                  />
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "95%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Popular origins suggestions */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularOrigins.slice(0, 3).map((city) => (
                    <motion.button
                      key={city}
                      type="button"
                      onClick={() => setOrigin(city)}
                      whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:shadow transition-all duration-300"
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Destination Input with animation */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination city or airport"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 hover:bg-white group-hover:border-indigo-300"
                    required
                  />
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "95%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Popular destinations suggestions */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularDestinations.slice(0, 3).map((city) => (
                    <motion.button
                      key={city}
                      type="button"
                      onClick={() => setDestination(city)}
                      whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:shadow transition-all duration-300"
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Selection Row with enhanced animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Departure Date */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <DatePicker
                    selected={departureDate}
                    onChange={(date) => setDepartureDate(date)}
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 hover:bg-white group-hover:border-indigo-300"
                  />
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "95%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Return Date - Only show if round trip */}
              <AnimatePresence>
                {isRoundTrip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                      <DatePicker
                        selected={returnDate}
                        onChange={(date) => setReturnDate(date)}
                        dateFormat="MMMM d, yyyy"
                        minDate={departureDate}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 hover:bg-white group-hover:border-indigo-300"
                      />
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "95%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trip Type toggle with enhanced animation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Type
                </label>
                <div className="flex p-1 bg-gray-100 rounded-xl">
                  <motion.button
                    type="button"
                    onClick={() => setIsRoundTrip(true)}
                    className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all duration-300`}
                    initial={false}
                    animate={{
                      backgroundColor: isRoundTrip ? "white" : "transparent",
                      color: isRoundTrip ? "#4F46E5" : "#6B7280",
                      boxShadow: isRoundTrip
                        ? "0 2px 5px rgba(79, 70, 229, 0.2)"
                        : "none",
                    }}
                    whileHover={{
                      backgroundColor: isRoundTrip
                        ? "white"
                        : "rgba(255,255,255,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Round Trip
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setIsRoundTrip(false)}
                    className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all duration-300`}
                    initial={false}
                    animate={{
                      backgroundColor: !isRoundTrip ? "white" : "transparent",
                      color: !isRoundTrip ? "#4F46E5" : "#6B7280",
                      boxShadow: !isRoundTrip
                        ? "0 2px 5px rgba(79, 70, 229, 0.2)"
                        : "none",
                    }}
                    whileHover={{
                      backgroundColor: !isRoundTrip
                        ? "white"
                        : "rgba(255,255,255,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    One Way
                  </motion.button>
                </div>
              </div>

              {/* Travelers and Class */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travelers & Class
                </label>
                <div className="relative flex">
                  <div className="relative flex-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white/80 hover:bg-white group-hover:border-indigo-300 transition-all duration-300"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Passenger" : "Passengers"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1">
                    <select
                      value={travelClass}
                      onChange={(e) => setTravelClass(e.target.value)}
                      className="w-full px-3 py-3 border border-l-0 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white/80 hover:bg-white group-hover:border-indigo-300 transition-all duration-300"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium">Premium</option>
                      <option value="business">Business</option>
                      <option value="first">First Class</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "95%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 items-center">
              {/* Filter Button with animation */}
              <motion.button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.02, backgroundColor: "#EEF2FF" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-4 py-2 text-indigo-700 bg-indigo-50 rounded-lg transition-all duration-300 border border-transparent hover:border-indigo-200 hover:shadow-md"
              >
                <Filter className="mr-2 h-5 w-5" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </motion.button>

              {/* Search Button with animation */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 disabled:opacity-70 overflow-hidden group"
              >
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></span>

                {isLoading ? (
                  <>
                    <RefreshCcw className="animate-spin mr-2 h-5 w-5" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </>
                )}
              </motion.button>
            </div>

            {/* Advanced Filters with enhanced transitions */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Filter className="mr-2 h-5 w-5 text-indigo-500" />
                    Advanced Filters
                    <motion.span
                      className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      }}
                    >
                      Custom
                    </motion.span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">$0</span>
                        <motion.input
                          type="range"
                          min="0"
                          max="5000"
                          step="50"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxPrice: Number(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                        <span className="text-gray-500">
                          ${filters.maxPrice}
                        </span>
                      </div>
                    </div>

                    {/* Maximum Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Duration (hours)
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">0h</span>
                        <motion.input
                          type="range"
                          min="0"
                          max="48"
                          step="1"
                          value={filters.maxDuration}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxDuration: Number(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                        <span className="text-gray-500">
                          {filters.maxDuration}h
                        </span>
                      </div>
                    </div>

                    {/* Stops Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Stops
                      </label>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((num) => (
                          <motion.button
                            key={num}
                            type="button"
                            onClick={() =>
                              setFilters({
                                ...filters,
                                maxStops: num,
                              })
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg flex-1 transition-all duration-300 ${
                              filters.maxStops === num
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {num === 0
                              ? "Non-stop"
                              : num === 1
                              ? "1 Stop"
                              : "2+ Stops"}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* Results Section with enhanced animations */}
      {searchPerformed && (
        <div ref={resultsRef} className="px-6 md:px-10 lg:px-20 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <motion.h2
                className="text-2xl font-bold text-gray-800 result-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="inline-block text-indigo-600"
                >
                  {filteredOptions.length}
                </motion.span>{" "}
                {activeTab} found
              </motion.h2>

              <div className="flex items-center result-item">
                <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                <motion.select
                  className="border border-gray-300 rounded-lg p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/80 hover:bg-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Duration: Shortest</option>
                  <option>Departure: Earliest</option>
                  <option>Arrival: Earliest</option>
                </motion.select>
              </div>
            </div>

            {/* Carbon Footprint Info with enhanced visual appeal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="mb-8 p-4 rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center result-item shadow-sm hover:shadow-md transition-all duration-300"
            >
              <motion.div
                className="mr-4 p-2 bg-green-100 rounded-full"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Leaf className="h-5 w-5 text-green-600" />
              </motion.div>
              <span className="text-sm text-green-700">
                <strong>Eco-friendly options:</strong> Carbon emissions for the
                selected {activeTab} are displayed below. Lower values indicate
                more eco-friendly options.
              </span>
            </motion.div>

            {/* Results Cards with staggered animation */}
            <div className="space-y-6">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div key={index} className="result-item">
                    <TransportCard
                      option={option}
                      type={activeTab}
                      onSelect={handleSelectTransport}
                      onViewRoute={handleViewRoute}
                    />
                  </div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl p-10 text-center shadow-lg border border-gray-100"
                >
                  <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                    <Info className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No {activeTab} found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any {activeTab} matching your criteria. Try
                    adjusting your filters or search for different locations.
                  </p>
                  <motion.button
                    onClick={() => setShowFilters(true)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg inline-flex items-center transition-all duration-300 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Adjust Filters
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Section with enhanced aesthetics */}
      <div id="map-section" className="px-6 md:px-10 lg:px-20 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white/90 backdrop-blur-md hover:shadow-xl transition-all duration-500"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <motion.h3
                  className="font-medium text-indigo-700 flex items-center"
                  animate={controls}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedRoute
                    ? `Route: ${selectedRoute.origin} to ${selectedRoute.destination}`
                    : "Route Preview"}
                </motion.h3>
                {selectedRoute && (
                  <motion.button
                    onClick={() => setSelectedRoute(null)}
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all duration-300"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="h-[60vh] relative group">
              {/* Decorative animated elements */}
              <motion.div
                className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 3,
                }}
              >
                <Award className="h-5 w-5 text-indigo-600" />
              </motion.div>

              {/* Animated pulse indicator for the selected route */}
              {selectedRoute && (
                <motion.div
                  className="absolute z-20 rounded-full bg-indigo-500/30 pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%",
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                  initial={{ width: 0, height: 0 }}
                  animate={{
                    width: [0, 200, 0],
                    height: [0, 200, 0],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              )}

              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                zoomAnimation={true}
                fadeAnimation={true}
                className="z-10 transition-all duration-500 group-hover:brightness-105"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {selectedRoute && (
                  <>
                    {/* Origin marker */}
                    <Marker position={selectedRoute.originCoordinates}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-indigo-600">
                            {selectedRoute.origin}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Departure:{" "}
                            {new Date(
                              selectedRoute.departureTime
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Destination marker */}
                    <Marker position={selectedRoute.destinationCoordinates}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-pink-600">
                            {selectedRoute.destination}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Arrival:{" "}
                            {new Date(
                              selectedRoute.arrivalTime
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Route line with gradient style */}
                    <Polyline
                      positions={[
                        selectedRoute.originCoordinates,
                        selectedRoute.destinationCoordinates,
                      ]}
                      color="#6366F1"
                      weight={3}
                      opacity={0.7}
                      dashArray="5, 10"
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx global>{`
        .confetti-particle {
          z-index: 100;
          pointer-events: none;
        }

        /* Enhanced range input styling */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #4f46e5;
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          background: #4f46e5;
        }

        /* Map marker animations */
        .leaflet-marker-icon {
          transition: all 0.3s ease;
        }

        .leaflet-marker-icon:hover {
          transform: scale(1.2) translateY(-5px);
          filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
        }
      `}</style>
    </div>
  );
};

export default TravelPage;
