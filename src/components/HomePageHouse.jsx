import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaWifi,
  FaCar,
  FaHotTub,
  FaShieldAlt,
  FaWheelchair,
  FaTv,
  FaDumbbell,
  FaSnowflake,
  FaCoffee,
  FaSearch,
} from "react-icons/fa";
import { BiSolidWasher } from "react-icons/bi";
import { FaElevator, FaKitchenSet } from "react-icons/fa6";
import { MdBalcony, MdOutdoorGrill } from "react-icons/md";
import HomeProperties from "./HomeProperties";
import EarthCanvas from "./Earth";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const HomePage = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showScrollHelp, setShowScrollHelp] = useState(true);
  const filterContainerRef = useRef(null);
  const location = useLocation();
  const controls = useAnimation();

  // Check if scrolling is possible
  const checkScrollability = () => {
    const container = filterContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoaded(true);
    controls.start({ opacity: 1, y: 0 });

    // Initialize scroll check
    checkScrollability();

    // Hide scroll help after 5 seconds
    const timer = setTimeout(() => {
      setShowScrollHelp(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.pathname, controls]);

  useEffect(() => {
    const container = filterContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, []);

  const filterButtons = [
    { icon: <FaWifi className="text-xl" />, text: "WiFi" },
    { icon: <FaKitchenSet className="text-xl" />, text: "Full Kitchen" },
    { icon: <BiSolidWasher className="text-xl" />, text: "Washer & Dryer" },
    { icon: <FaCar className="text-xl" />, text: "Free Parking" },
    { icon: <FaHotTub className="text-xl" />, text: "Hot Tub" },
    { icon: <FaShieldAlt className="text-xl" />, text: "24/7 Security" },
    {
      icon: <FaWheelchair className="text-xl" />,
      text: "Wheelchair Accessible",
    },
    { icon: <FaElevator className="text-xl" />, text: "Elevator Access" },
    { icon: <FaSnowflake className="text-xl" />, text: "Air Conditioning" },
    { icon: <MdBalcony className="text-xl" />, text: "Balcony/Patio" },
    { icon: <FaTv className="text-xl" />, text: "Smart TV" },
    { icon: <FaDumbbell className="text-xl" />, text: "Gym/Fitness Center" },
    { icon: <FaCoffee className="text-xl" />, text: "Coffee Maker" },
    { icon: <MdOutdoorGrill className="text-xl" />, text: "Outdoor Grill/BBQ" },
  ];

  // Updated handleFilterClick to correctly use the event parameter
  const handleFilterClick = (filter, event) => {
    // Update selected filters
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const scrollFilters = (direction) => {
    if (filterContainerRef.current) {
      const scrollAmount = 300;
      filterContainerRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-100/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-amber-100/20 rounded-full filter blur-3xl"></div>
      </div>

      {/* Filter header with animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {/* Filter title and info */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mr-3 p-2 rounded-full bg-black text-white"
                >
                  <FaSearch className="text-lg" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Filter Properties
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedFilters.length > 0
                      ? `${selectedFilters.length} filters applied`
                      : "Select amenities to filter properties"}
                  </p>
                </div>
              </div>

              {selectedFilters.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-sm text-gray-600 hover:text-black font-medium px-3 py-1 rounded-md 
                           hover:bg-gray-100 transition duration-200"
                  onClick={() => setSelectedFilters([])}
                >
                  Clear All
                </motion.button>
              )}
            </div>

            {/* Filter scrollable container */}
            <div className="relative">
              <AnimatePresence>
                {canScrollLeft && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 top-0 bottom-0 z-10 w-12 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                )}
              </AnimatePresence>

              <div className="relative flex items-center w-full">
                <AnimatePresence>
                  {canScrollLeft && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollFilters("prev")}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md
                              hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                    >
                      <FaArrowLeft className="text-gray-600 text-lg" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <div
                  ref={filterContainerRef}
                  className="flex items-center gap-3 overflow-x-auto py-2 px-4 w-full scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {filterButtons.map((filter, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: 0.1 + index * 0.05,
                          duration: 0.3,
                        },
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: selectedFilters.includes(filter.text)
                          ? "0 4px 12px rgba(0,0,0,0.2)"
                          : "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        // Pass the event to handleFilterClick
                        handleFilterClick(filter.text, e);

                        // Animation of icon on selection
                        const icon = e.currentTarget.querySelector("svg");
                        if (icon) {
                          const isSelected = selectedFilters.includes(
                            filter.text
                          );
                          // Toggle animation based on new state (opposite of current)
                          const animation = !isSelected
                            ? { scale: [1, 1.3, 1] }
                            : { rotate: [0, -10, 10, -5, 5, 0] };

                          motion.animate(icon, animation, { duration: 0.4 });
                        }
                      }}
                      className={`filter-btn relative flex items-center justify-center gap-2.5 px-5 py-3 min-w-fit rounded-full border
                               transition-all duration-300 ${
                                 selectedFilters.includes(filter.text)
                                   ? "bg-black text-white border-black shadow-md"
                                   : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow"
                               }`}
                    >
                      <span className="relative z-10">{filter.icon}</span>
                      <span className="whitespace-nowrap relative z-10 text-sm">
                        {filter.text}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {canScrollRight && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollFilters("next")}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md
                              hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                    >
                      <FaArrowRight className="text-gray-600 text-lg" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {canScrollRight && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 top-0 bottom-0 z-10 w-12 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Scroll help tooltip */}
              <AnimatePresence>
                {showScrollHelp && canScrollRight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-8 top-full mt-2 bg-black text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-30"
                  >
                    <div className="absolute -top-2 right-6 w-3 h-3 bg-black transform rotate-45"></div>
                    Scroll to see more filters
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected filters display */}
      <AnimatePresence>
        {selectedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 py-3 border-b border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 mr-1">
                  Active filters:
                </span>
                {selectedFilters.map((filter, index) => (
                  <motion.span
                    key={filter}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-100 border border-gray-300 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    {filter}
                    <button
                      className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={(e) => handleFilterClick(filter, e)}
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties section with staggered animation */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <HomeProperties selectedFilters={selectedFilters} />
      </motion.div>

      {/* Earth canvas with improved loading animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="relative h-lvh"
      >
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10"></div>
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: -70, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 text-3xl font-bold text-gray-800 text-center z-20 w-full px-6"
        >
          Discover Properties Around the World
        </motion.h2>
        <EarthCanvas />
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
