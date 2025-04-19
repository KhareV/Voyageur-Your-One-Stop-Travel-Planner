import { useState, useRef, useEffect } from "react";
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
  FaRegHeart,
  FaHome,
  FaPlane,
  FaSmile,
  FaHeart,
} from "react-icons/fa";
import { RiDashboardLine, RiLogoutCircleLine } from "react-icons/ri";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import airbnbLogo from "/logo.png";

const AirbnbNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search submission

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 0, damping: 100 }}
        className={`flex justify-between items-center px-6 py-3 bg-white fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "py-2 shadow-lg backdrop-blur-md bg-white/95"
            : "py-4 sm:py-6 bg-white"
        }`}
      >
        <div className="flex items-center space-x-4 md:space-x-6">
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="transform transition-transform duration-300"
          >
            <motion.img
              src={airbnbLogo}
              alt="Voyageur Logo"
              animate={{
                height: isScrolled ? "5rem" : "7rem",
              }}
              transition={{ duration: 0.3 }}
              className="object-contain"
            />
          </motion.a>

          <div className="hidden md:flex space-x-1">
            <NavButton
              text="Homes"
              icon={<FaHome className="mr-1.5" />}
              onClick={() => navigate("/")}
              isActive={isActiveRoute("/")}
            />
            <NavButton
              text="Travel"
              icon={<FaPlane className="mr-1.5" />}
              onClick={() => navigate("/travel")}
              isActive={isActiveRoute("/travel")}
            />
            <SignedIn>
              <NavButton
                text="AI Travel Planner"
                icon={<FaSmile className="mr-1.5" />}
                onClick={() => navigate("/user-dashboard/itinerary")}
                isActive={isActiveRoute("/user-dashboard/itinerary")}
              />
            </SignedIn>
            <Link
              to="/saved-properties"
              className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-md transition-colors text-gray-700 hover:text-indigo-700"
            >
              <FaHeart className="text-red-500" />
              <span>Saved Properties</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/add-property")}
            className="hidden sm:flex items-center px-4 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-full font-medium transition-all duration-300 ease-in-out"
          >
            <span className="relative">
              Voyageur Your Home
              <motion.span
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500"
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </span>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer p-2.5 rounded-full hover:bg-gray-50"
          >
            <FaGlobe className="text-gray-600 h-5 w-5 transition-all duration-300 ease-in-out" />
          </motion.div>

          {/* User Menu Button */}
          <motion.div ref={dropdownRef} className="relative z-50">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center border rounded-full px-3 py-1.5 space-x-3 bg-white hover:shadow-md transition-all duration-200 ease-in-out
                ${
                  isDropdownOpen
                    ? "border-red-300 shadow-md"
                    : "border-gray-200"
                }
              `}
            >
              <FaBars className="text-gray-600 h-4 w-4" />

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    },
                  }}
                />
              </SignedIn>

              <SignedOut>
                <FaUserCircle className="text-gray-500 h-6 w-6" />
              </SignedOut>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 z-500 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  style={{ transformOrigin: "top right" }}
                >
                  <div className="p-2">
                    <div className="py-1">
                      {isSignedIn ? (
                        <>
                          <DropdownItem
                            icon={<RiDashboardLine />}
                            label="Dashboard"
                            onClick={() => {
                              navigate("/user-dashboard");
                              setIsDropdownOpen(false);
                            }}
                          />
                          <DropdownItem
                            icon={<FaRegHeart />}
                            label="Saved Properties"
                            onClick={() => {
                              navigate("/saved-properties");
                              setIsDropdownOpen(false);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <SignInButton mode="modal">
                            <DropdownItem
                              icon={<FaUserCircle />}
                              label="Log In"
                            />
                          </SignInButton>
                          <SignInButton mode="modal">
                            <DropdownItem
                              icon={<FaUserCircle />}
                              label="Sign Up"
                            />
                          </SignInButton>
                          <DropdownItem
                            icon={<RiDashboardLine />}
                            label="View Dashboard"
                            onClick={() => {
                              navigate("/user-dashboard");
                              setIsDropdownOpen(false);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden transition-all duration-500 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="flex justify-around items-center py-2">
          <MobileNavButton
            icon={<FaHome className="text-lg" />}
            text="Home"
            onClick={() => navigate("/")}
            isActive={isActiveRoute("/")}
          />
          <MobileNavButton
            icon={<FaPlane className="text-lg" />}
            text="Travel"
            onClick={() => navigate("/travel")}
            isActive={isActiveRoute("/travel")}
          />

          <MobileNavButton
            icon={<FaUserCircle className="text-lg" />}
            text="Account"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            isActive={isDropdownOpen}
          />
        </div>
      </div>
    </>
  );
};

// Navigation button component
const NavButton = ({ text, icon, onClick, isActive }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-200
        ${
          isActive
            ? "bg-gray-50 text-red-500"
            : "text-gray-700 hover:text-red-500 hover:bg-gray-50"
        }`}
    >
      {icon}
      {text}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 mx-4"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

// Mobile navigation button
const MobileNavButton = ({ icon, text, onClick, isActive }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-1 transition-colors
        ${isActive ? "text-red-500" : "text-gray-600"}`}
    >
      {icon}
      <span className="text-xs mt-0.5">{text}</span>
      {isActive && (
        <motion.div
          layoutId="mobileActiveIndicator"
          className="absolute bottom-0 h-0.5 w-10 bg-red-500"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

// Dropdown item component
const DropdownItem = ({ icon, label, onClick, className = "" }) => {
  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2.5 rounded-lg text-left text-gray-700 transition-colors ${className}`}
    >
      <span className="mr-2 text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

// Add the custom styles
const style = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  /* Glass effect */
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  
  /* Custom scrollbar for webkit */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

export default AirbnbNavbar;
