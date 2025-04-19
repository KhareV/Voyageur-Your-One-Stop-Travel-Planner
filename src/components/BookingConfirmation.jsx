import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plane,
  Train,
  Bus,
  Clock,
  User,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedOptionString = sessionStorage.getItem("selectedTravelOption");

    if (!storedOptionString) {
      navigate("/travel");
      return;
    }

    try {
      const parsedOption = JSON.parse(storedOptionString);

      // Common required properties for all transport types
      const commonProps = [
        "transportType",
        "origin",
        "destination",
        "departureTime",
        "arrivalTime",
        "price",
        "airline",
      ];

      // Check common properties first
      let missingProp = commonProps.find(
        (prop) =>
          parsedOption[prop] === undefined || parsedOption[prop] === null
      );

      if (missingProp) {
        console.error(
          `Booking Confirmation Error: Invalid data structure in sessionStorage. Missing: ${missingProp}`,
          parsedOption
        );
        setError(
          `Invalid booking data (missing: ${missingProp}). Please try again.`
        );
        return;
      }

      // Only check for transport-specific properties for the matching transport type
      const transportType = parsedOption.transportType;
      if (transportType === "flights" && !parsedOption.flightNumber) {
        missingProp = "flightNumber";
      } else if (transportType === "trains" && !parsedOption.trainNumber) {
        missingProp = "trainNumber";
      } else if (transportType === "buses" && !parsedOption.busNumber) {
        missingProp = "busNumber";
      }

      if (missingProp) {
        console.error(
          `Booking Confirmation Error: Invalid data structure in sessionStorage. Missing: ${missingProp}`,
          parsedOption
        );
        setError(
          `Invalid booking data (missing: ${missingProp}). Please try again.`
        );
        return;
      }

      // If validation passes, set the state
      setSelectedOption(parsedOption);
    } catch (parseError) {
      console.error(
        "Booking Confirmation Error: Failed to parse data from sessionStorage",
        parseError
      );
      setError("Failed to load booking data. Please try again.");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to payment page with booking and traveler details
    sessionStorage.setItem("travelerDetails", JSON.stringify(formData));
    navigate("/travel-payment");
  };

  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Render error state if validation failed in useEffect
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Booking
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/travel")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Go Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle null/undefined input
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get icon based on transport type
  const getTransportIcon = (type) => {
    switch (type) {
      case "flights":
        return <Plane className="h-6 w-6" />;
      case "trains":
        return <Train className="h-6 w-6" />;
      case "buses":
        return <Bus className="h-6 w-6" />;
      default:
        return <Plane className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/travel")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to search
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            <p className="text-indigo-100">
              Please review your itinerary and provide traveler details
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Summary (Left Side) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    {/* Extra check before accessing selectedOption */}
                    {/* Extra check before accessing selectedOption */}
                    {typeof selectedOption === "object" &&
                      selectedOption !== null &&
                      getTransportIcon(
                        selectedOption.transportType ?? "flights"
                      )}
                    <span className="ml-2">Itinerary Summary</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Trip type */}
                    {/* Extra check before accessing selectedOption */}
                    {typeof selectedOption === "object" &&
                      selectedOption !== null && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-800">
                            {selectedOption.isRoundTrip
                              ? "Round Trip"
                              : "One Way"}{" "}
                            •{" "}
                            {typeof selectedOption.transportType === "string"
                              ? selectedOption.transportType // Simplified display
                              : "N/A"}
                          </span>
                        </div>
                      )}
                    {/* Corrected structure: Removed misplaced div below */}

                    {/* Provider */}
                    {/* Extra check before accessing selectedOption */}
                    {typeof selectedOption === "object" &&
                      selectedOption !== null && (
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                            {selectedOption.logo ? (
                              <img
                                src={selectedOption.logo}
                                alt={selectedOption.airline ?? "Provider logo"}
                                className="h-6 w-6"
                              />
                            ) : (
                              <span className="font-bold text-indigo-500">
                                {typeof selectedOption.airline === "string"
                                  ? selectedOption.airline.charAt(0)
                                  : "?"}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">
                              {selectedOption.airline ?? "Unknown Provider"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedOption.transportType === "flights"
                                ? `Flight ${
                                    selectedOption.flightNumber ?? "N/A"
                                  }`
                                : selectedOption.transportType === "trains"
                                ? `Train ${selectedOption.trainNumber ?? "N/A"}`
                                : `Bus ${selectedOption.busNumber ?? "N/A"}`}
                            </p>
                          </div>
                        </div>
                      )}
                    {/* Corrected structure: Removed misplaced div below */}

                    {/* Route */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-800">
                            {selectedOption.origin}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(selectedOption.departureTime)}
                          </p>
                        </div>
                      </div>

                      <div className="h-10 border-l-2 border-dashed border-gray-300 ml-2.5 my-1"></div>

                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-800">
                            {selectedOption.destination}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(selectedOption.arrivalTime)}
                          </p>
                        </div>
                      </div>

                      {/* Display return journey if round trip */}
                      {selectedOption.isRoundTrip &&
                        selectedOption.returnDate && (
                          <>
                            <div className="h-6 border-l-2 border-gray-300 ml-2.5 my-1"></div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm font-medium mb-2 flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                                Return Journey
                              </p>
                              {selectedOption.returnDepartureTime ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  {/* Return flight info */}
                                  <div className="mb-3 flex items-center text-xs text-gray-500 bg-indigo-50 px-2 py-1 rounded">
                                    {getTransportIcon(
                                      selectedOption.transportType ?? "flights"
                                    )}
                                    <span className="ml-1 font-medium">
                                      {selectedOption.returnFlightNumber ||
                                        selectedOption.returnTrainNumber ||
                                        selectedOption.returnBusNumber ||
                                        `Return ${
                                          typeof selectedOption.transportType ===
                                          "string"
                                            ? selectedOption.transportType
                                            : "Trip"
                                        }`}
                                    </span>
                                    {selectedOption.returnDuration && (
                                      <span className="ml-auto flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {selectedOption.returnDuration}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="ml-2">
                                      <p className="text-sm font-medium text-gray-800">
                                        {selectedOption.destination}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(
                                          selectedOption.returnDepartureTime
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="relative">
                                    <div className="h-10 border-l-2 border-dashed border-gray-300 ml-2.5 my-1"></div>
                                    {selectedOption.returnDuration && (
                                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 bg-white px-1">
                                        <span className="text-xs text-indigo-600 font-medium">
                                          {selectedOption.returnDuration}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-start">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="ml-2">
                                      <p className="text-sm font-medium text-gray-800">
                                        {selectedOption.origin}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(
                                          selectedOption.returnArrivalTime
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  Details will be selected separately
                                </p>
                              )}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Price details */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-800 mb-2">
                        Price Details
                      </h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Base fare ({selectedOption.passengers || 1}{" "}
                            {(selectedOption.passengers || 1) > 1
                              ? "travelers"
                              : "traveler"}
                            )
                          </span>
                          <span>
                            $
                            {selectedOption.price *
                              (selectedOption.passengers || 1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Taxes & fees</span>
                          <span>
                            $
                            {Math.round(
                              selectedOption.price *
                                0.15 *
                                (selectedOption.passengers || 1)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-indigo-600">
                            $
                            {Math.round(
                              selectedOption.price *
                                1.15 *
                                (selectedOption.passengers || 1)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler Form (Right Side) */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Traveler Information
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="John"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Any special requirements or preferences"
                    />
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
                      <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center text-sm text-gray-500">
                    <Shield className="h-5 w-5 text-gray-400 mr-2" />
                    <p>
                      Your personal data will be used to process your booking,
                      support your experience, and for other purposes described
                      in our privacy policy.
                    </p>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm disabled:opacity-70 transition-colors flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <CreditCard className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
