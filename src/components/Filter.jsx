import React, { useState } from "react";
import {
  FaFilter,
  FaPlus,
  FaWifi,
  FaHome,
  FaSnowflake,
  FaThermometerHalf,
} from "react-icons/fa";
import { MdKitchen, MdLocalLaundryService } from "react-icons/md";
import { GiWashingMachine } from "react-icons/gi";
import { IoIosBook } from "react-icons/io";
import { FaPaw } from "react-icons/fa6";

const FilterModal = ({ isOpen, onClose }) => {
  const [minPrice, setMinPrice] = useState(870);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [typeOfPlace, setTypeOfPlace] = useState("Any type");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState([]);

  const amenities = [
    { icon: <FaWifi />, name: "Wifi" },
    { icon: <MdKitchen />, name: "Kitchen" },
    { icon: <GiWashingMachine />, name: "Washing machine" },
    { icon: <MdLocalLaundryService />, name: "Dryer" },
    { icon: <FaSnowflake />, name: "Air conditioning" },
    { icon: <FaThermometerHalf />, name: "Heating" },
  ];

  const bookingOptions = [
    { icon: <IoIosBook />, name: "Instant Book" },
    { icon: <FaHome />, name: "Self check-in" },
    { icon: <FaPaw />, name: "Allows pets" },
  ];

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleBookingOption = (option) => {
    setSelectedBookingOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-70 z-50 flex justify-center items-center p-4 transform transition all duration-300"
      onClick={onClose}
    >
      <div
        className="w-[500px] bg-white rounded-xl h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className="text-2xl font-light">
            ×
          </button>
          <h2 className="text-xl font-semibold">Filters</h2>
          <button className="text-gray-500">Clear all</button>
        </div>

        {/* Type of Place */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Type of place</h3>
          <div className="flex space-x-2">
            {["Any type", "Room", "Entire home"].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full border ${
                  typeOfPlace === type
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300 hover:border-black"
                }`}
                onClick={() => setTypeOfPlace(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Price range</h3>
          <p className="text-sm text-gray-500">
            Nightly prices before fees and taxes
          </p>
          <div className="flex justify-between mb-4">
            <div>
              <label className="text-sm">Minimum</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>
            <div>
              <label className="text-sm">Maximum</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border rounded-lg px-2 py-1"
              />
            </div>
          </div>
        </div>

        {/* Rooms and Beds */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Rooms and beds</h3>
          <div className="flex justify-between items-center">
            <span>Bedrooms</span>
            <button className="border rounded-full p-1 hover:bg-gray-100">
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Amenities</h3>
          <div className="grid grid-cols-3 gap-2">
            {amenities.map((amenity) => (
              <button
                key={amenity.name}
                className={`flex items-center space-x-2 p-2 border rounded-lg 
                  ${
                    selectedAmenities.includes(amenity.name)
                      ? "bg-black text-white"
                      : "hover:border-black hover:bg-gray-100"
                  }`}
                onClick={() => toggleAmenity(amenity.name)}
              >
                {amenity.icon}
                <span>{amenity.name}</span>
              </button>
            ))}
          </div>
          <button className="text-blue-600 mt-2">Show more</button>
        </div>

        {/* Booking Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Booking options</h3>
          <div className="grid grid-cols-3 gap-2">
            {bookingOptions.map((option) => (
              <button
                key={option.name}
                className={`flex items-center space-x-2 p-2 border rounded-lg 
                  ${
                    selectedBookingOptions.includes(option.name)
                      ? "bg-black text-white"
                      : "hover:border-black hover:bg-gray-100"
                  }`}
                onClick={() => toggleBookingOption(option.name)}
              >
                {option.icon}
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <span>Standout stays</span>
            <span>▶</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span>Property type</span>
            <span>▶</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span>Accessibility features</span>
            <span>▶</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Host language</span>
            <span>▶</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-4 flex justify-between items-center border-t">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox" />
            <span>Display total before taxes</span>
          </label>
          <button
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
            onClick={onClose}
          >
            Show 1,000+ places
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterButton = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <button
        className="flex items-center space-x-2 px-4 py-2 border rounded-full 
        hover:border-black hover:shadow-lg transition-all duration-300 
        hover:scale-105 group"
        onClick={() => setIsFilterOpen(true)}
      >
        <FaFilter className="text-lg group-hover:text-black" />
        <span className="group-hover:text-black">Filters</span>
      </button>
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
};

export default FilterButton;
