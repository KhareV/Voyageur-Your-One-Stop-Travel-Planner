import { useState, useRef } from "react";
import FilterButton from "./Filter";
import Stars from "./Stars";
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

const HomePage = () => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const filterContainerRef = useRef(null);

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
    <div className="bg-gray-50">
      <div className="px-6 py-4 border-b">
        <div className="flex flex-col items-center justify-between">
          <div className="relative flex items-center w-full">
            <button
              onClick={() => scrollFilters("prev")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-300"
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </button>

            <div
              ref={filterContainerRef}
              className="flex items-center space-x-4 overflow-x-auto pb-2 px-8 w-full scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filterButtons.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterClick(filter.text)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-full border transition-all duration-300 ${
                    selectedFilters.includes(filter.text)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-800 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {filter.icon}
                  <span className="whitespace-nowrap">{filter.text}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollFilters("next")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-400 shadow-md transition-all duration-300"
            >
              <FaArrowRight className="text-gray-600 text-lg" />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <FilterButton />
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <HomeProperties selectedFilters={selectedFilters} />
      </div>
      <div className="relative h-lvh ">
        <EarthCanvas />
        <Stars />
      </div>
    </div>
  );
};

export default HomePage;
