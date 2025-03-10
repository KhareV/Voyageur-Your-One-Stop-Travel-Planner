import { useState, useRef, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { FaSearch, FaUserCircle, FaBars, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import airbnbLogo from "/logo.png";

const AirbnbNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`flex justify-between items-center px-6 py-3 bg-white fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-500 ease-in-out ${
        isScrolled ? "py-2 shadow-lg" : "py-8"
      }`}
    >
      <div className="flex items-center space-x-6">
        <a
          href="/"
          className="transform transition-transform duration-300 hover:scale-105"
        >
          <img
            src={airbnbLogo}
            alt="Airbnb Logo"
            className={`transition-all duration-500 ease-in-out ${
              isScrolled ? "h-12" : "h-24"
            }`}
          />
        </a>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-100 rounded-full font-medium transition-all duration-300 ease-in-out"
          >
            Homes
          </button>
          <button
            onClick={() => navigate("/travel")}
            className="px-4 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-100 rounded-full font-medium transition-all duration-300 ease-in-out"
          >
            Travel
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        <button
          onClick={() => navigate("/add-property")}
          className="px-4 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-100 rounded-full font-medium transition-all duration-300 ease-in-out"
        >
          Voyageur Your Home
        </button>
        <FaGlobe className="text-gray-600 h-5 w-5 cursor-pointer hover:text-red-500 transition-all duration-300 ease-in-out transform hover:rotate-12 hover:scale-110" />
        <div
          className="flex items-center border border-gray-200 rounded-full px-4 py-2 space-x-3 bg-white hover:bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <SignedOut>
            <div className="flex items-center space-x-2">
              <FaBars className="text-gray-600 h-5 w-5" />
              <FaUserCircle className="text-gray-500 h-6 w-6" />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 pr-2 border-r border-gray-200">
                <UserButton afterSignOutUrl="/" />
              </div>
              <button
                className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-md shadow-sm hover:shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/user-dashboard");
                }}
              >
                Dashboard
              </button>
            </div>
          </SignedIn>
        </div>
        {!user && isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transition-all duration-300 ease-in-out animate-fadeIn">
            <div className="p-3">
              <SignInButton mode="modal">
                <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 rounded-md transition-all duration-200 ease-in-out text-sm font-medium">
                  Log In
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 rounded-md mt-1 transition-all duration-200 ease-in-out text-sm font-medium">
                  Sign Up
                </button>
              </SignInButton>
              <button
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-500 rounded-md mt-1 transition-all duration-200 ease-in-out text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/user-dashboard");
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const style = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

export default AirbnbNavbar;
