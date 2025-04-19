import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMoneyBill,
  FaMapMarker,
  FaRegHeart,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useUser } from "@clerk/clerk-react";

const PropertyCard = ({ property }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageSliderRef = useRef(null);
  const { user, isSignedIn } = useUser();

  // Handle image carousel functionality
  const hasMultipleImages = property.images && property.images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const getRateDisplay = () => {
    const { rates } = property;
    if (rates.monthly) {
      return `$${rates.monthly.toLocaleString()}/mo`;
    }
    let priceString = "";
    if (rates.weekly) {
      priceString += `$${rates.weekly.toLocaleString()}/wk`;
    }
    if (rates.nightly) {
      priceString += priceString
        ? ` | $${rates.nightly.toLocaleString()}/night`
        : `$${rates.nightly.toLocaleString()}/night`;
    }
    return priceString || "Contact for pricing";
  };

  // Function to determine image source
  const getImageUrl = (image) => {
    // Check if the image is a full URL (Cloudinary)
    if (image && image.startsWith("http")) {
      return image;
    }
    // If not, assume it's a local image
    return `/properties/${image}`;
  };

  useEffect(() => {
    // Reset loaded state when image changes
    setIsImageLoaded(false);
  }, [currentImageIndex]);

  // Check if property is favorited on component load
  useEffect(() => {
    if (isSignedIn && user?.id && property?._id) {
      checkFavoriteStatus();
    }
  }, [isSignedIn, user, property]);

  // Function to check if property is in user's favorites
  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${user.id}/${property._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (!isSignedIn || !user?.id) {
      // If not signed in, redirect to sign in page or show a message
      alert("Please sign in to save properties");
      return;
    }

    setIsSaving(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(
          `http://localhost:5000/api/favorites/${user.id}/${property._id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        // Add to favorites
        const response = await fetch("http://localhost:5000/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            propertyId: property._id,
          }),
        });

        if (response.ok) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="property-card rounded-xl shadow-md bg-white overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Carousel */}
      <div
        className="relative h-64 overflow-hidden bg-gray-100"
        ref={imageSliderRef}
      >
        {/* Skeleton Loader */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Main Image */}
        <motion.img
          key={currentImageIndex}
          src={
            property.images && property.images.length > 0
              ? getImageUrl(property.images[currentImageIndex])
              : "/properties/default.jpg"
          }
          alt={property.name}
          className={`w-full h-64 object-cover transition-transform duration-700 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/properties/default.jpg";
            setIsImageLoaded(true);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Image Navigation Arrows - Only show when hovered and has multiple images */}
        <AnimatePresence>
          {isHovered && hasMultipleImages && (
            <>
              <motion.button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10"
                onClick={prevImage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronLeft className="text-gray-800" />
              </motion.button>
              <motion.button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10"
                onClick={nextImage}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronRight className="text-gray-800" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Image Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-white w-4"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Pricing Badge */}
        <motion.div
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-red-500 font-bold shadow-md text-sm"
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgb(239, 68, 68)",
            color: "white",
          }}
          transition={{ duration: 0.2 }}
        >
          {getRateDisplay()}
        </motion.div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded text-xs font-medium backdrop-blur-sm">
          {property.type}
        </div>

        {/* Save and Favorite Buttons */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <motion.button
            onClick={toggleFavorite}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`rounded-full w-9 h-9 flex items-center justify-center shadow-md ${
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-500 hover:text-red-500"
            }`}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : isFavorited ? (
              <FaHeart className="text-lg" />
            ) : (
              <FaRegHeart className="text-lg" />
            )}
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`rounded-full w-9 h-9 flex items-center justify-center shadow-md ${
              isSaved
                ? "bg-blue-500 text-white"
                : "bg-white/90 text-gray-500 hover:text-blue-500"
            }`}
          >
            {isSaved ? (
              <FaBookmark className="text-lg" />
            ) : (
              <FaRegBookmark className="text-lg" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800 line-clamp-1 hover:text-red-500 transition-colors duration-200">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <FaMapMarker className="text-red-400" />
              <span className="line-clamp-1">
                {property.location.city}, {property.location.state}
              </span>
            </div>
          </div>

          {property.is_featured && (
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              <MdVerified className="mr-1" />
              Featured
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="flex justify-between items-center text-gray-700 text-sm my-4 px-2">
          <div className="flex flex-col items-center">
            <div className="bg-red-50 text-red-500 p-2 rounded-full mb-1">
              <FaBed className="text-lg" />
            </div>
            <p>
              {property.beds}{" "}
              <span className="text-xs text-gray-500">Beds</span>
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-blue-50 text-blue-500 p-2 rounded-full mb-1">
              <FaBath className="text-lg" />
            </div>
            <p>
              {property.baths}{" "}
              <span className="text-xs text-gray-500">Baths</span>
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-green-50 text-green-500 p-2 rounded-full mb-1">
              <FaRulerCombined className="text-lg" />
            </div>
            <p>
              {property.square_feet}{" "}
              <span className="text-xs text-gray-500">sqft</span>
            </p>
          </div>
        </div>

        {/* Top Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-4">
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 3).map((amenity, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-2">
          <motion.a
            href={`/property/${property._id}`}
            className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg text-center font-medium tracking-wide"
            whileHover={{
              scale: 1.02,
              boxShadow:
                "0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            View Details
          </motion.a>
        </div>
      </div>

      {/* Hover Overlay with Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default PropertyCard;
