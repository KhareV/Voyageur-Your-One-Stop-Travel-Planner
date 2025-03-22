import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gallery, Item } from "react-photoswipe-gallery";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "photoswipe/dist/photoswipe.css";
import "leaflet/dist/leaflet.css";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
// Import icons
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaTimes,
  FaCheck,
  FaMapMarker,
  FaArrowLeft,
  FaArrowRight,
  FaRegHeart,
  FaHeart,
  FaShare,
  FaPhoneAlt,
  FaEnvelope,
  FaStar,
  FaDollarSign,
  FaRegCalendarAlt,
  FaPrint,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  MdVerified,
  MdOutlineBedroomParent,
  MdBathroom,
  MdOutlineSquareFoot,
  MdLocationPin,
  MdOutlineAttachMoney,
} from "react-icons/md";

// Fix for default marker icon in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Fix for default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Refs for scroll animations
  const headerRef = useRef(null);
  const detailsRef = useRef(null);
  const amenitiesRef = useRef(null);
  const mapRef = useRef(null);
  const galleryRef = useRef(null);

  // Gallery element ref for photoswipe
  const galleryElementRef = useRef(null);

  // Function to load marker data
  const customIcon = L.divIcon({
    className: "custom-marker-icon",
    html: `<div class="marker-pin"></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });

  useEffect(() => {
    // Fetch property data
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/properties`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Find property by ID (handling cases where it might not be array index - 1)
        const foundProperty = data.find((p) => p._id === id) || data[id - 1];

        if (!foundProperty) {
          throw new Error("Property not found");
        }

        setProperty(foundProperty);

        // Fetch coordinates for the map
        if (foundProperty.location) {
          fetchCoordinates(foundProperty.location);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(err.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    // Fetch map coordinates
    const fetchCoordinates = async (location) => {
      try {
        setMapLoading(true);
        const address = `${location.street}, ${location.city}, ${location.state} ${location.zipcode}`;
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location data");
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setMapCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          console.warn("Location not found");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setMapLoading(false);
      }
    };

    fetchProperty();

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Initialize GSAP animations
    const initAnimations = () => {
      // Animation for sections as they come into view
      const sections = [detailsRef, amenitiesRef, mapRef, galleryRef];

      sections.forEach((sectionRef, index) => {
        if (sectionRef.current) {
          gsap.fromTo(
            sectionRef.current,
            {
              y: 50,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      });
    };

    // Initialize animations after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initAnimations();
    }, 500);

    return () => {
      clearTimeout(timer);
      // Clear any ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [id]);

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/properties/default.jpg";
    return image.includes("https://") ? image : `/properties/${image}`;
  };

  // Navigate between images
  const goToNextImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const goToPrevImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  // Open fullscreen gallery at specific index
  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    if (galleryElementRef.current) {
      const items = galleryElementRef.current.querySelectorAll(
        ".pswp-gallery__item"
      );
      if (items[index]) {
        items[index].click();
      }
    }
  };

  // Handle share click
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property?.name || "Property Details",
          text:
            property?.description?.substring(0, 100) ||
            "Check out this property!",
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((error) => {
          console.error("Failed to copy:", error);
        });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Property
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors shadow-md"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Property not found</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-16">
      {/* Back Button - Fixed */}
      <motion.div
        className="fixed top-4 left-4 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => navigate("/")}
          className="bg-white/80 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <FaArrowLeft className="text-gray-800" />
        </button>
      </motion.div>

      {/* Header Image Section */}
      <motion.section
        className="relative h-[50vh] sm:h-[70vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        ref={headerRef}
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {property.images && property.images.length > 0 ? (
          <motion.img
            key={currentImageIndex}
            src={getImageUrl(property.images[currentImageIndex])}
            alt={property.name}
            className="object-cover w-full h-full absolute inset-0"
            initial={{ opacity: 0.5, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
        ) : (
          <div className="bg-gray-300 w-full h-full flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}

        {/* Image Navigation Arrows */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <FaArrowLeft className="text-gray-800" />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <FaArrowRight className="text-gray-800" />
            </button>
          </>
        )}

        {/* Image Count Indicator */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 px-3 py-1.5 rounded-full text-white text-sm font-medium">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        )}

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Property type badge */}
            <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-2 inline-block">
              {property.type}
            </span>

            {/* Property name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {property.name}
            </h1>

            {/* Location */}
            <div className="flex items-center text-white/90 mb-4">
              <MdLocationPin className="text-xl mr-2" />
              <p>
                {property.location.street}, {property.location.city},{" "}
                {property.location.state} {property.location.zipcode}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center">
                <MdOutlineBedroomParent className="mr-1.5 text-xl" />
                <span>
                  {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
                </span>
              </div>
              <div className="flex items-center">
                <MdBathroom className="mr-1.5 text-xl" />
                <span>
                  {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineSquareFoot className="mr-1.5 text-xl" />
                <span>{property.square_feet.toLocaleString()} sq ft</span>
              </div>
              {property.rates.monthly && (
                <div className="flex items-center">
                  <MdOutlineAttachMoney className="mr-1.5 text-xl" />
                  <span>${property.rates.monthly.toLocaleString()}/mo</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <motion.button
            onClick={() => setIsFavorite(!isFavorite)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full shadow-lg ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800"
            }`}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </motion.button>
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg text-gray-800"
          >
            <FaShare />
          </motion.button>
          <motion.button
            onClick={() => openGallery(0)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/80 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </motion.button>
        </div>
      </motion.section>

      {/* Pricing Card - Sticky */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 z-20 mb-8">
        <motion.div
          className="bg-white rounded-xl shadow-xl p-6 mx-auto max-w-4xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-between items-center">
            {/* Rates */}
            <div className="mb-4 md:mb-0 flex-1">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FaDollarSign className="mr-2 text-blue-600" /> Pricing Options
              </h3>
              <div className="flex flex-wrap gap-4">
                {property.rates.nightly && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 min-w-[100px] relative group">
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 transition-opacity"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <p className="text-gray-600 text-sm mb-1 relative z-10">
                      Nightly
                    </p>
                    <p className="text-2xl font-bold text-blue-600 relative z-10">
                      ${property.rates.nightly.toLocaleString()}
                    </p>
                  </div>
                )}
                {property.rates.weekly && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 min-w-[100px] relative group">
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 transition-opacity"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <p className="text-gray-600 text-sm mb-1 relative z-10">
                      Weekly
                    </p>
                    <p className="text-2xl font-bold text-blue-600 relative z-10">
                      ${property.rates.weekly.toLocaleString()}
                    </p>
                  </div>
                )}
                {property.rates.monthly && (
                  <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 min-w-[100px] relative group">
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 transition-opacity"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <p className="text-gray-600 text-sm mb-1 relative z-10">
                      Monthly
                    </p>
                    <p className="text-2xl font-bold text-blue-600 relative z-10">
                      ${property.rates.monthly.toLocaleString()}
                    </p>
                  </div>
                )}
                {!property.rates.nightly &&
                  !property.rates.weekly &&
                  !property.rates.monthly && (
                    <div className="text-gray-600">Contact for pricing</div>
                  )}
              </div>
            </div>

            <SignedIn>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 mb-2 py-3 px-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                onClick={() => navigate(`/payment/${property._id}`)}
              >
                <FaDollarSign className="mr-2" />
                Book Now & Pay
              </motion.button>
            </SignedIn>
            <SignedOut>
              <button
                className="m-10 px-10 py-5 bg-red-500/10 text-md font-bold rounded-2xl transform transition-all duration-200 hover:scale-105 hover:bg-red-500 hover:border-red-600 hover:text-white ease-in-out border-2 border-red-200"
                onClick={() => {
                  navigate("/sign-in");
                }}
              >
                Login to continue
              </button>
            </SignedOut>
            <SignedIn>
              <div className="md:hidden fixed left-0 right-0 bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg z-30">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 px-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg"
                  onClick={() => navigate(`/payment/${property._id}`)}
                >
                  <span className="flex items-center justify-center">
                    <FaDollarSign className="mr-2" />
                    Book Now - $
                    {property.rates.nightly ||
                      property.rates.monthly ||
                      "Contact"}
                    /night
                  </span>
                </motion.button>
              </div>
            </SignedIn>

            {/* Contact buttons */}
            <div className="flex flex-col gap-2 items-center justify-between text-center">
              {property.seller_info?.phone && (
                <motion.a
                  href={`tel:${property.seller_info.phone}`}
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaPhoneAlt className="mr-2" /> Call
                </motion.a>
              )}
              {property.seller_info?.email && (
                <motion.a
                  href={`mailto:${property.seller_info.email}?subject=Regarding ${property.name}`}
                  className="inline-flex items-center justify-center bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-3 rounded-lg font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaEnvelope className="mr-2" /> Email
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === "description"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("amenities")}
              className={`px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === "amenities"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Amenities
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === "location"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Location
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap ${
                activeTab === "gallery"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Gallery
            </button>
          </div>
        </div>

        {/* Description & Details */}
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              ref={detailsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Description & Details
              </h2>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center bg-blue-50 p-3 rounded-lg gap-3">
                  <MdOutlineBedroomParent className="text-3xl text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Bedrooms</p>
                    <p className="text-xl font-bold text-gray-800">
                      {property.beds}
                    </p>
                  </div>
                </div>
                <div className="flex items-center bg-blue-50 p-3 rounded-lg gap-3">
                  <MdBathroom className="text-3xl text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Bathrooms</p>
                    <p className="text-xl font-bold text-gray-800">
                      {property.baths}
                    </p>
                  </div>
                </div>
                <div className="flex items-center bg-blue-50 p-3 rounded-lg gap-3">
                  <MdOutlineSquareFoot className="text-3xl text-blue-600" />
                  <div>
                    <p className="text-gray-500 text-sm">Square Feet</p>
                    <p className="text-xl font-bold text-gray-800">
                      {property.square_feet.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p
                  className={`text-gray-700 leading-relaxed ${
                    !showFullDescription && property.description.length > 300
                      ? "line-clamp-4"
                      : ""
                  }`}
                >
                  {property.description}
                </p>
                {property.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center"
                  >
                    {showFullDescription ? "Read Less" : "Read More"}
                    {showFullDescription ? (
                      <FaChevronUp className="ml-1" />
                    ) : (
                      <FaChevronDown className="ml-1" />
                    )}
                  </button>
                )}
              </div>

              {property.seller_info && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Seller Information
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-4 rounded-full shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        {property.seller_info.name && (
                          <p className="font-semibold text-gray-800">
                            {property.seller_info.name}
                          </p>
                        )}
                        {property.seller_info.email && (
                          <p className="text-gray-600 text-sm flex items-center">
                            <FaEnvelope className="mr-1 text-xs" />
                            {property.seller_info.email}
                          </p>
                        )}
                        {property.seller_info.phone && (
                          <p className="text-gray-600 text-sm flex items-center">
                            <FaPhoneAlt className="mr-1 text-xs" />
                            {property.seller_info.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Amenities Tab */}
          {activeTab === "amenities" && (
            <motion.div
              key="amenities"
              ref={amenitiesRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Property Amenities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.amenities &&
                  property.amenities.map((amenity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.05 },
                      }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(239, 246, 255, 0.7)",
                        transition: { duration: 0.2 },
                      }}
                      className="flex items-center p-3 rounded-lg bg-blue-50"
                    >
                      <span className="bg-green-500 p-1.5 rounded-full text-white mr-3">
                        <FaCheck className="text-sm" />
                      </span>
                      <span className="text-gray-700">{amenity}</span>
                    </motion.div>
                  ))}

                {(!property.amenities || property.amenities.length === 0) && (
                  <div className="col-span-full text-center py-6 text-gray-500">
                    No amenities listed for this property.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <motion.div
              key="location"
              ref={mapRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                Property Location
              </h2>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <MdLocationPin className="text-2xl text-blue-600 mt-1 mr-2" />
                  <div>
                    <p className="font-medium text-gray-800">Address</p>
                    <p className="text-gray-600">
                      {property.location.street}, {property.location.city},{" "}
                      {property.location.state} {property.location.zipcode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-96 rounded-lg overflow-hidden border border-gray-200 shadow-md">
                {mapLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-500">Loading map...</p>
                    </div>
                  </div>
                ) : mapCoordinates ? (
                  <div className="w-full h-full">
                    <MapContainer
                      center={mapCoordinates}
                      zoom={14}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCoordinates} icon={DefaultIcon}>
                        <Popup>
                          <strong>{property.name}</strong>
                          <br />
                          {property.location.street}
                          <br />
                          {property.location.city}, {property.location.state}{" "}
                          {property.location.zipcode}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-gray-500">
                        Unable to load map location
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              ref={galleryRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                Property Gallery
              </h2>

              {property.images && property.images.length > 0 ? (
                <Gallery ref={galleryElementRef}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          transition: { delay: index * 0.1 },
                        }}
                        className="aspect-square overflow-hidden rounded-lg shadow-md relative group cursor-pointer"
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Item
                          original={getImageUrl(image)}
                          thumbnail={getImageUrl(image)}
                          width="1600"
                          height="1200"
                        >
                          {({ ref, open }) => (
                            <>
                              <img
                                ref={ref}
                                onClick={open}
                                src={getImageUrl(image)}
                                alt={`Property ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-700"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                  />
                                </svg>
                              </div>
                            </>
                          )}
                        </Item>
                      </motion.div>
                    ))}
                  </div>
                </Gallery>
              ) : (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No images available for this property.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Return Home Button - Bottom */}
      <div className="mt-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
};

export default PropertyDetails;
