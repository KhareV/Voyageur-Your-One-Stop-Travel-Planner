import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Train,
  Bus,
  Clock,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Users,
  Star,
  Map,
} from "lucide-react";

const TransportCard = ({
  option,
  onSelect,
  onViewRoute,
  selected = false,
  type = "flights",
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Format time from date string
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  // Calculate duration between two date strings
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = (endDate - startDate) / (1000 * 60); // difference in minutes

    const hours = Math.floor(diff / 60);
    const minutes = Math.floor(diff % 60);

    return `${hours}h ${minutes}m`;
  };

  // Get icon based on transport type
  const getTransportIcon = () => {
    switch (type) {
      case "flights":
        return <Plane className="h-5 w-5" />;
      case "trains":
        return <Train className="h-5 w-5" />;
      case "buses":
        return <Bus className="h-5 w-5" />;
      default:
        return <Plane className="h-5 w-5" />;
    }
  };

  // Calculate duration if not provided
  const duration =
    option.duration ||
    (option.departureTime && option.arrivalTime
      ? calculateDuration(option.departureTime, option.arrivalTime)
      : null);

  // Handle click to view route on map
  const handleViewRoute = (e) => {
    e.stopPropagation();
    if (onViewRoute && typeof onViewRoute === "function") {
      onViewRoute(option);
    }
  };

  // Handle selection of this transport option
  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect && typeof onSelect === "function") {
      onSelect(option);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white rounded-xl border ${
          selected
            ? "border-indigo-500 ring-2 ring-indigo-200"
            : isHovered
            ? "border-indigo-300 shadow-md transform -translate-y-1"
            : "border-gray-200 shadow-sm"
        } 
        overflow-hidden cursor-pointer transition-all duration-300
      `}
    >
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 right-0 bg-indigo-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg"
        >
          Selected
        </motion.div>
      )}

      <div className="p-4">
        {/* Header with provider and price */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
              {option.logo ? (
                <img
                  src={option.logo}
                  alt={option.airline || option.provider}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <div className="text-indigo-600 font-bold text-lg">
                  {(option.airline || option.provider || "").charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {option.airline || option.provider}
              </p>
              <p className="text-xs text-gray-500">
                {type === "flights"
                  ? `Flight ${option.flightNumber}`
                  : type === "trains"
                  ? `Train ${option.trainNumber}`
                  : `Bus ${option.busNumber}`}
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} className="text-right">
            <p className="text-lg font-bold text-indigo-600">${option.price}</p>
            <p className="text-xs text-gray-500">per passenger</p>
          </motion.div>
        </div>

        {/* Journey visualization */}
        <div className="flex items-center my-4">
          {/* Origin */}
          <div className="text-center flex-1">
            <p className="text-lg font-semibold">
              {formatTime(option.departureTime)}
            </p>
            <p
              className="text-sm text-gray-500 truncate max-w-[100px] mx-auto"
              title={option.origin}
            >
              {option.origin}
            </p>
          </div>

          {/* Journey path visualization */}
          <div className="flex-grow px-2 relative">
            <div className="h-0.5 bg-gray-300 w-full absolute top-1/2 transform -translate-y-1/2"></div>

            <div className="flex justify-between items-center relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-indigo-600 z-10"
              />

              {getTransportIcon()}

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                className="w-2 h-2 rounded-full bg-indigo-600 z-10"
              />
            </div>

            {duration && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 -mt-6">
                <p className="text-xs font-medium text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {duration}
                </p>
              </div>
            )}
          </div>

          {/* Destination */}
          <div className="text-center flex-1">
            <p className="text-lg font-semibold">
              {formatTime(option.arrivalTime)}
            </p>
            <p
              className="text-sm text-gray-500 truncate max-w-[100px] mx-auto"
              title={option.destination}
            >
              {option.destination}
            </p>
          </div>
        </div>

        {/* Tags and features */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(option.departureTime)}
          </span>

          {option.amenities?.wifi && (
            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
              WiFi
            </span>
          )}

          {option.rating && (
            <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {option.rating}
            </span>
          )}

          {option.seats && (
            <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {option.seats} left
            </span>
          )}
        </div>

        {/* Expandable details */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-800 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  View details
                </>
              )}
            </button>

            {/* View on map button */}
            {onViewRoute && (
              <motion.button
                onClick={handleViewRoute}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-emerald-600 font-medium flex items-center hover:text-emerald-800 transition-colors"
              >
                <Map className="h-4 w-4 mr-1" />
                View on map
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {/* Amenities */}
                  {option.amenities && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(option.amenities).map(
                          ([key, value]) =>
                            value && (
                              <span
                                key={key}
                                className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                              >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </span>
                            )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Baggage */}
                  {option.baggage && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Baggage Allowance
                      </h4>
                      <p className="text-sm text-gray-600">{option.baggage}</p>
                    </div>
                  )}

                  {/* Cancellation */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Cancellation Policy
                    </h4>
                    <p className="text-sm text-gray-600">
                      {option.refundable
                        ? "Refundable (Fee may apply)"
                        : "Non-refundable"}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium flex items-center justify-center"
                  onClick={handleSelect}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {selected ? "Selected" : "Select this option"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TransportCard;
