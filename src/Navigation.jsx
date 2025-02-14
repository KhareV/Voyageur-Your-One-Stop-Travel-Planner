import { useState, useRef, useEffect } from "react";
import FilterButton from "./Filter.jsx";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import {
  FaSearch,
  FaUserCircle,
  FaBars,
  FaGlobe,
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
import airbnbLogo from "/logo.png";
// import HomeProperties from "./HomeProperties";
import Dashboard from './dashboard.jsx'

const AirbnbNavbar = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filterContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user } = useUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    { icon: <FaGlobe className="text-xl" />, text: "High-Speed Internet" },
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
    <div className="min-h-screen bg-gray-50">
      <nav
        className={`flex justify-between items-center px-6 bg-white sticky top-0 z-50 shadow-lg transition-all duration-300 ${
          isScrolled ? "py-1" : "py-1"
        }`}
      >
        <div className="flex items-center space-x-4">
          <img
            src={airbnbLogo}
            alt="Airbnb Logo"
            className={`transition-all duration-300 ${
              isScrolled ? "h-20" : "h-40"
            } hover:scale-105`}
          />
          <div className="flex space-x-6">
            <button className="px-4 py-2 rounded-full font-medium text-gray-800 hover:bg-gray-100 transition-colors duration-300">
              Homes
            </button>
            <button className="px-4 py-2 rounded-full font-medium text-gray-800 hover:bg-gray-100 transition-colors duration-300">
              Experiences
            </button>
          </div>
        </div>

        <div
          className={`flex items-center rounded-full shadow-sm transition-all duration-300 px-6 py-2 space-x-4 w-full max-w-xl ${
            isSearchActive ? "bg-gray-100 scale-105 shadow-md" : "bg-gray-50"
          }`}
        >
          <input
            type="text"
            placeholder="Where"
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ${
              activeInput === "where"
                ? "bg-white shadow-md"
                : "bg-transparent hover:bg-gray-100"
            }`}
            onFocus={() => {
              setIsSearchActive(true);
              setActiveInput("where");
            }}
            onBlur={() => {
              setIsSearchActive(false);
              setActiveInput(null);
            }}
          />
          <div className="h-6 w-px bg-gray-300" />
          <input
            type="text"
            placeholder="Check in"
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ${
              activeInput === "checkin"
                ? "bg-white shadow-md"
                : "bg-transparent hover:bg-gray-100"
            }`}
            onFocus={() => {
              setIsSearchActive(true);
              setActiveInput("checkin");
            }}
            onBlur={() => {
              setIsSearchActive(false);
              setActiveInput(null);
            }}
          />
          <div className="h-6 w-px bg-gray-300" />
          <input
            type="text"
            placeholder="Check out"
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ${
              activeInput === "checkout"
                ? "bg-white shadow-md"
                : "bg-transparent hover:bg-gray-100"
            }`}
            onFocus={() => {
              setIsSearchActive(true);
              setActiveInput("checkout");
            }}
            onBlur={() => {
              setIsSearchActive(false);
              setActiveInput(null);
            }}
          />
          <button className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-all duration-300 group flex items-center">
            <FaSearch className="text-lg transition-transform duration-300 group-hover:scale-110" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 font-semibold ml-0 group-hover:ml-2">
              Search
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
          <button className="px-4 py-2 rounded-full font-medium text-gray-800 hover:bg-gray-100 transition-colors duration-300">
            Voyageur your home
          </button>
          <FaGlobe className="text-gray-700 text-xl cursor-pointer hover:text-red-500 transition-colors duration-300" />

          <div
            className="flex items-center border rounded-full px-4 py-2 space-x-2 cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <SignedOut>
              <div className="flex items-center space-x-2">
                <FaBars className="text-gray-600" />
                <FaUserCircle className="text-gray-500 text-2xl" />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {!user && isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50">
              <div className="p-4">
                <SignInButton mode="modal">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">
                    Log in
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg mt-2">
                    Sign up
                  </button>
                </SignInButton>
              </div>
            </div>
          )}
        </div>
      </nav>

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
        {/* <HomeProperties selectedFilters={selectedFilters} /> */}
        <Dashboard/>
      </div>
    </div>
  );
};

export default AirbnbNavbar;
