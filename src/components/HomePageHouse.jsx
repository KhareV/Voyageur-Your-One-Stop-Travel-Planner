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
} from "react-icons/fa";
import { BiSolidWasher } from "react-icons/bi";
import { FaElevator, FaKitchenSet } from "react-icons/fa6";
import { MdBalcony, MdOutdoorGrill } from "react-icons/md";
import HomeProperties from "./HomeProperties";
import EarthCanvas from "./Earth";
import { motion } from "framer-motion";

const HomePage = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const filterContainerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoaded(true);
  }, [location.pathname]);

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

  const handleFilterClick = (filter) => {
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
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="z-50 bg-white/80 backdrop-blur-md px-6 border-b shadow-sm"
      >
        <div className="flex flex-col items-center justify-between">
          <div className="relative flex items-center w-full">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollFilters("prev")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-300"
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </motion.button>

            <div
              ref={filterContainerRef}
              className="flex items-center space-x-4 overflow-x-auto pb-2 px-8 w-full scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filterButtons.map((filter, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterClick(filter.text)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-full border transition-all duration-300 ${
                    selectedFilters.includes(filter.text)
                      ? "bg-black text-white border-black shadow-lg"
                      : "bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  {filter.icon}
                  <span className="whitespace-nowrap">{filter.text}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollFilters("next")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-300"
            >
              <FaArrowRight className="text-gray-600 text-lg" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="px-6 py-8"
      >
        <HomeProperties selectedFilters={selectedFilters} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative h-lvh"
      >
        <EarthCanvas />
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
