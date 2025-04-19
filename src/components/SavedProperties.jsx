import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner, FaHeart, FaSadTear, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // If Clerk is loaded and user is not signed in, redirect to sign in
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
      return;
    }

    // If user is signed in, fetch their saved properties
    if (isSignedIn && user?.id) {
      fetchSavedProperties();
    }
  }, [isSignedIn, user, isLoaded, navigate]);

  const fetchSavedProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${user.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSavedProperties(data);
    } catch (error) {
      console.error("Error fetching saved properties:", error);
      setError(error.message || "Failed to load saved properties");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      scale: 0.96,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading your saved properties...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <FaSadTear className="mx-auto h-16 w-16" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Properties
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => fetchSavedProperties()}
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

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaHeart className="text-red-500 mr-3" />
              Your Saved Properties
            </h1>
            <p className="text-gray-600 mt-2">
              View all your favorite listings in one place
            </p>
          </div>
        </div>

        {/* No saved properties state */}
        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FaHeart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No saved properties yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring and save properties you like to see them here
            </p>
            <Link
              to="/"
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors inline-block"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {savedProperties.map((property) => (
                <motion.div
                  key={property._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="property-card-container"
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
