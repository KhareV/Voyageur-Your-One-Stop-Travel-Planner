import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "./PropertyCard";
import {
  FaSpinner,
  FaHome,
  FaSadTear,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const HomeProperties = ({ selectedFilters = [] }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Listen for search events from navbar
  useEffect(() => {
    const handleSearch = (event) => {
      const { query } = event.detail;
      setSearchQuery(query);
      // Reset visible count when search changes
      setVisibleCount(6);
    };

    // Listen for custom event from navbar search
    window.addEventListener("property:search", handleSearch);

    // Clean up event listener
    return () => {
      window.removeEventListener("property:search", handleSearch);
    };
  }, []);

  // Fetch all properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // Fetch all properties without any search parameter
        const response = await fetch("http://localhost:5000/api/properties");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} properties from API`);

        setAllProperties(data);
        setFilteredProperties(data);
        setHasError(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle search query changes AND filter application in ONE effect
  useEffect(() => {
    const filterProperties = () => {
      setIsSearching(true);

      // Start with all properties
      let results = [...allProperties];

      // First apply search if query exists - searching only by name field
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        results = results.filter((property) => {
          // Only filter by name field
          return property.name && property.name.toLowerCase().includes(query);
        });

        console.log(
          `Search for "${searchQuery}" found ${results.length} matching properties by name`
        );
      }

      // Then apply amenity filters if they exist
      if (Array.isArray(selectedFilters) && selectedFilters.length > 0) {
        results = results.filter((property) =>
          selectedFilters.every(
            (filter) =>
              property.amenities && property.amenities.includes(filter)
          )
        );
      }

      // Reset visible count whenever filters change
      setVisibleCount(6);

      // Update filtered properties
      setFilteredProperties(results);

      // Short delay to simulate search processing
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    };

    // Short delay to avoid excessive processing while typing
    const timer = setTimeout(() => {
      filterProperties();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilters, allProperties]);

  const loadMoreProperties = async () => {
    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    setVisibleCount((prev) => prev + 3);
    setIsLoadingMore(false);
  };

  // Clear search and filters
  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    window.dispatchEvent(new CustomEvent("clearSearch"));
  };

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search is already handled by the useEffect that watches searchQuery
    // Focus the search input again for better UX
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Variants for framer-motion animations
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

  const propertyVariants = {
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

  const searchBarVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const loadMoreVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow:
        "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    },
    tap: { scale: 0.98 },
  };

  // Skeleton loader for properties
  const PropertySkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-500 hover:scale-105">
      <div className="animate-pulse">
        <div className="bg-gray-300 h-48 w-full"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
            <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 w-24 bg-gray-300 rounded"></div>
            <div className="h-8 w-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      // Showing skeleton loaders while loading
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {Array(6)
            .fill()
            .map((_, index) => (
              <motion.div key={index} variants={propertyVariants}>
                <PropertySkeleton />
              </motion.div>
            ))}
        </motion.div>
      );
    }

    if (hasError) {
      // Error state
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-8 rounded-xl text-center shadow-md"
        >
          <div className="text-red-500 mb-4 flex justify-center">
            <svg
              className="w-12 h-12"
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
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Failed to load properties
          </h3>
          <p className="text-gray-600 mb-4">
            There was a problem fetching property data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      );
    }

    if (filteredProperties.length === 0) {
      // No results state - could be from search or filters
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 p-10 rounded-xl text-center max-w-xl mx-auto shadow-sm"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FaSadTear className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? `No properties with name matching "${searchQuery}"${
                  selectedFilters.length > 0 ? " and selected filters" : ""
                }.`
              : "No properties match your selected filters. Try removing some filters or check back later for new listings."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClearSearch}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                <FaSearch className="w-4 h-4 mr-2" />
                Clear Search
              </motion.button>
            )}

            {selectedFilters.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("clearFilters"))
                }
                className="bg-white border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Filters
              </motion.button>
            )}
          </div>
        </motion.div>
      );
    }

    // Properties grid
    return (
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProperties.slice(0, visibleCount).map((property) => (
            <motion.div
              layout
              key={property._id}
              variants={propertyVariants}
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
    );
  };

  return (
    <>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <motion.div
            variants={searchBarVariants}
            initial="hidden"
            animate="visible"
            className="mb-12 max-w-3xl mx-auto"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center pl-4 pointer-events-none">
                  <FaSearch className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  id="property-search"
                  className="block w-full p-4 pl-12 pr-16 text-sm text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-300 outline-none transition-all duration-200 shadow-sm"
                  placeholder="Search properties by name (e.g., 'Seaside Retreat')"
                  value={searchQuery}
                  onChange={handleSearchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-14 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className={`absolute right-2.5 bottom-2.5 top-2.5 px-4 rounded-full text-white font-medium text-sm transition-colors duration-200
                  ${
                    searchQuery ? "bg-red-500 hover:bg-red-600" : "bg-gray-400"
                  }`}
                disabled={!searchQuery}
              >
                Search
              </button>
            </form>
            {isSearching && (
              <div className="mt-2 text-center text-sm text-gray-500">
                <FaSpinner className="animate-spin inline mr-2" />
                Searching properties by name...
              </div>
            )}
          </motion.div>

          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-3">
              <FaHome className="text-red-500 mr-2 text-2xl" />
              <h2 className="text-3xl font-bold text-gray-800">
                {searchQuery ? (
                  <>
                    Properties Named{" "}
                    <span className="text-red-500">"{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-500">Featured</span> Properties
                  </>
                )}
              </h2>
            </div>

            {!isLoading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 max-w-xl mx-auto"
              >
                {filteredProperties.length > 0
                  ? `Displaying ${Math.min(
                      visibleCount,
                      filteredProperties.length
                    )} of ${filteredProperties.length} ${
                      searchQuery ? "matching" : "amazing"
                    } properties`
                  : searchQuery
                  ? "No properties match your search query"
                  : selectedFilters.length > 0
                  ? "No properties match your current filters"
                  : "No properties found in our database"}
              </motion.p>
            )}

            {/* Active filters display */}
            <AnimatePresence>
              {(selectedFilters.length > 0 || searchQuery) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchQuery && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 flex items-center"
                      >
                        <FaSearch className="mr-1" size={10} />
                        Name: {searchQuery}
                        <button
                          onClick={handleClearSearch}
                          className="ml-1 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </motion.span>
                    )}

                    {selectedFilters.map((filter) => (
                      <span
                        key={filter}
                        className="bg-red-50 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>

                  {/* Clear all button when multiple filters or search */}
                  {selectedFilters.length > 0 && searchQuery && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleClearSearch();
                        window.dispatchEvent(new CustomEvent("clearFilters"));
                      }}
                      className="mt-3 text-xs text-gray-600 hover:text-red-600 underline"
                    >
                      Clear all filters and search
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Properties content - skeletons, error, or property grid */}
          {isSearching ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-3xl text-red-500" />
              <span className="ml-2 text-gray-600">
                Searching properties...
              </span>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </section>

      {/* Load more button */}
      {!isLoading &&
        !hasError &&
        !isSearching &&
        filteredProperties.length > 0 &&
        visibleCount < filteredProperties.length && (
          <section className="my-12 text-center">
            <motion.button
              variants={loadMoreVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={loadMoreProperties}
              disabled={isLoadingMore}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform focus:outline-none disabled:opacity-70 font-medium"
            >
              <span className="flex items-center">
                {isLoadingMore ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Loading...
                  </>
                ) : (
                  <>
                    Load More Properties
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </span>
            </motion.button>
            <p className="text-gray-500 text-sm mt-3">
              Showing {Math.min(visibleCount, filteredProperties.length)} of{" "}
              {filteredProperties.length} properties
            </p>
          </section>
        )}
    </>
  );
};

export default HomeProperties;
