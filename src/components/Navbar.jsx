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
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [isTabChanging, setIsTabChanging] = useState(false);
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

  const handleTabClick = (tab) => {
    if (tab !== selectedTab) {
      setIsTabChanging(true);
      setSelectedTab(tab);
      setTimeout(() => {
        setIsTabChanging(false);
        if (tab === "travel") {
          navigate("/travel");
        } else if (tab === "property") {
          navigate("/add-property");
        } else {
          navigate("/");
        }
      }, 300);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col">
      <nav
        className={`flex justify-between items-center px-6 bg-white fixed top-0 left-0 w-full z-40 shadow-lg transition-all duration-500 ease-in-out ${
          isScrolled ? "py-1" : "py-1"
        }`}
      >
        <div className="flex items-center space-x-4">
          <a
            href="/"
            className="transform transition-transform duration-300 hover:scale-105"
          >
            <img
              src={airbnbLogo}
              alt="Airbnb Logo"
              className={`transition-all duration-500 ease-in-out ${
                isScrolled ? "h-20" : "h-40"
              }`}
            />
          </a>
          <div className="flex space-x-6">
            <button
              onClick={() => handleTabClick("homes")}
              className={`group px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out relative overflow-hidden
                ${
                  selectedTab === "homes"
                    ? "text-red-500 bg-red-50 scale-105"
                    : "text-gray-800 hover:bg-gray-100"
                }
                ${isTabChanging ? "animate-pulse" : ""}
              `}
            >
              <span className="relative z-10">Homes</span>
              {selectedTab === "homes" && (
                <>
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-red-500 animate-slideIn" />
                  <span className="absolute inset-0 bg-red-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </>
              )}
            </button>
            <button
              onClick={() => handleTabClick("travel")}
              className={`group px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out relative overflow-hidden
                ${
                  selectedTab === "travel"
                    ? "text-red-500 bg-red-50 scale-105"
                    : "text-gray-800 hover:bg-gray-100"
                }
                ${isTabChanging ? "animate-pulse" : ""}
              `}
            >
              <span className="relative z-10">Travel</span>
              {selectedTab === "travel" && (
                <>
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-red-500 animate-slideIn" />
                  <span className="absolute inset-0 bg-red-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </>
              )}
            </button>
          </div>
        </div>

        <div
          className={`flex items-center rounded-full shadow-sm transition-all duration-500 ease-in-out ${
            isSearchActive
              ? "bg-gray-100 scale-105 shadow-md ring-2 ring-red-100"
              : "bg-gray-50 hover:shadow-md"
          } px-6 py-2 space-x-4 w-full max-w-xl`}
        >
          <input
            type="text"
            placeholder="Where"
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ease-in-out ${
              activeInput === "where"
                ? "bg-white shadow-md scale-105"
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
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ease-in-out ${
              activeInput === "checkin"
                ? "bg-white shadow-md scale-105"
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
            className={`w-full px-4 py-2 outline-none rounded-full text-sm transition-all duration-300 ease-in-out ${
              activeInput === "checkout"
                ? "bg-white shadow-md scale-105"
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
          <button className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-all duration-300 ease-in-out group flex items-center transform hover:scale-105 hover:shadow-md">
            <FaSearch className="text-lg transition-transform duration-300 group-hover:scale-110" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-[60px] transition-all duration-300 font-semibold ml-0 group-hover:ml-2 opacity-0 group-hover:opacity-100">
              Search
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
          <button
            onClick={() => handleTabClick("property")}
            className={`group px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out relative overflow-hidden
              ${
                selectedTab === "property"
                  ? "text-red-500 bg-red-50 scale-105"
                  : "text-gray-800 hover:bg-gray-100"
              }
              ${isTabChanging ? "animate-pulse" : ""}
            `}
          >
            <span className="relative z-10">Voyageur your home</span>
            {selectedTab === "property" && (
              <>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-red-500 animate-slideIn" />
                <span className="absolute inset-0 bg-red-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </>
            )}
          </button>
          <FaGlobe className="text-gray-700 text-xl cursor-pointer hover:text-red-500 transition-all duration-300 ease-in-out transform hover:scale-110" />

          <div
            className="flex items-center border rounded-full px-4 py-2 space-x-2 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <SignedOut>
              <div className="flex items-center space-x-2">
                <FaBars className="text-gray-600" />
                <FaUserCircle className="text-gray-500 text-2xl" />
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center ">
                {/* User Profile Section */}
                <div className="border-r-2 border-gray-300 pr-2">
                  <UserButton afterSignOutUrl="/" />
                </div>

                {/* View Dashboard Button */}
                <div>
                  <button
                    className=" text-black rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:text-white"
                    onClick={() => {
                      navigate("/user-dashboard");
                    }}
                  >
                    View Your Dashboard
                  </button>
                </div>
              </div>
            </SignedIn>
          </div>

          {!user && isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 transform transition-all duration-300 ease-in-out animate-fadeIn">
              <div className="p-4">
                <SignInButton mode="modal">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer">
                    Log in
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="w-full text-left py-2 hover:bg-gray-100 rounded-lg mt-2 transition-colors duration-300 ease-in-out cursor-pointer">
                    Sign up
                  </button>
                </SignInButton>
                <button
                  class="w-full text-left hover:bg-gray-100 rounded-lg mt-2 transition-colors duration-300 ease-in-out cursor-pointer"
                  onClick={() => {
                    navigate("/user-dashboard");
                  }}
                >
                  View Your Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

const style = `
@keyframes slideIn {
  0% {
    transform: translateX(-100%) translateY(0);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`;

export default AirbnbNavbar;
