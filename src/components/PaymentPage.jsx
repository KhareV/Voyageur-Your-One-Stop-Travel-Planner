import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUserFriends,
  FaCreditCard,
  FaLock,
  FaHome,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaDollarSign,
  FaTag,
  FaClock,
  FaCheck,
  FaShieldAlt,
  FaStar,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// No more Stripe.js imports or initialization

const PaymentPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Booking details
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [guests, setGuests] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/properties/${propertyId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
        setError(error.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Calculate number of nights between check-in and check-out
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate total price
  const calculatePrice = () => {
    const nights = calculateNights();
    if (!property || !property.rates || nights <= 0) return { total: 0 };

    // Use nightly rate if available, otherwise monthly rate divided by 30
    let ratePerNight = property.rates.nightly || property.rates.monthly / 30;

    // Calculate base price
    let basePrice = ratePerNight * nights;

    // Apply discount if promo code is applied
    const discount = discountApplied ? basePrice * 0.1 : 0; // 10% discount example

    // Cleaning fee
    const cleaningFee = 85;

    // Service fee (example: 12% of base price)
    const serviceFee = basePrice * 0.12;

    return {
      basePrice,
      discount,
      cleaningFee,
      serviceFee,
      total: basePrice + cleaningFee + serviceFee - discount,
    };
  };

  // Handle date changes
  const handleCheckInChange = (date) => {
    setCheckInDate(date);

    // If check-out date is before new check-in date, update it
    if (checkOutDate <= date) {
      setCheckOutDate(new Date(date.getTime() + 24 * 60 * 60 * 1000)); // Set to next day
    }
  };

  // Apply promo code
  const handleApplyPromoCode = () => {
    // Implement promo code validation logic here
    if (promoCode.toLowerCase() === "welcome10") {
      setDiscountApplied(true);
      // Visual feedback for successful promo code application
      const promoButton = document.getElementById("promo-button");
      if (promoButton) {
        promoButton.classList.add("animate-pulse");
        setTimeout(() => {
          promoButton.classList.remove("animate-pulse");
        }, 1000);
      }
    } else {
      alert("Invalid promo code");
    }
  };

  // FIXED: Updated payment submission to redirect directly to Stripe URL
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      console.log("Creating checkout for property:", property._id);

      const response = await fetch(
        "http://localhost:5000/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: property._id,
            propertyName: property.name,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            guests,
            priceDetails: calculatePrice(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create checkout session"
        );
      }

      const data = await response.json();

      // FIXED: Use the direct URL returned from the server without any Stripe.js
      if (data.checkoutUrl) {
        console.log("Redirecting to checkout:", data.checkoutUrl);
        // Using window.location.href instead of replace() for better browser history handling
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(
        error.message || "Payment processing failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl font-medium">
            Loading your booking details...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <motion.div
          className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-500 text-5xl mb-6">
            <FaHome className="h-20 w-20 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error || "We couldn't find the property you're looking for."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-colors shadow-lg text-lg"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const priceDetails = calculatePrice();
  const nights = calculateNights();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Property</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-2">
            Just a few more steps to secure your stay at {property.name}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Booking details form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            {/* Booking Details Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Your Stay Details
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                      <FaCalendarAlt className="text-indigo-500 mr-2" />
                      Check-in Date
                    </label>
                    <DatePicker
                      selected={checkInDate}
                      onChange={handleCheckInChange}
                      minDate={new Date()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                      <FaCalendarAlt className="text-indigo-500 mr-2" />
                      Check-out Date
                    </label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={setCheckOutDate}
                      minDate={
                        new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                    <FaUserFriends className="text-indigo-500 mr-2" />
                    Number of Guests
                  </label>
                  <div className="flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-10 h-10 flex items-center justify-center rounded-l-lg"
                      disabled={guests <= 1}
                    >
                      -
                    </motion.button>
                    <span className="bg-white border-t border-b border-gray-300 w-16 h-10 flex items-center justify-center font-medium">
                      {guests}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setGuests(
                          Math.min(property.maxGuests || 10, guests + 1)
                        )
                      }
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-10 h-10 flex items-center justify-center rounded-r-lg"
                      disabled={guests >= (property.maxGuests || 10)}
                    >
                      +
                    </motion.button>
                    <span className="ml-3 text-gray-600 text-sm">
                      <FaUserFriends className="inline mr-1" />
                      Maximum {property.maxGuests || 10} guests allowed
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <AnimatePresence>
                    {!showPromoInput ? (
                      <motion.button
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPromoInput(true)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        <FaTag className="mr-2" />
                        Have a promo code?
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                          <FaTag className="text-indigo-500 mr-2" />
                          Promo Code
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter promo code (e.g. WELCOME10)"
                            className="flex-grow border border-gray-300 rounded-l-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                          />
                          <motion.button
                            id="promo-button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleApplyPromoCode}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-r-lg transition-all font-medium"
                            disabled={!promoCode}
                          >
                            Apply
                          </motion.button>
                        </div>
                        {discountApplied && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-green-600 text-sm mt-2 flex items-center"
                          >
                            <FaCheck className="mr-1" /> 10% discount applied
                            successfully!
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaCreditCard className="mr-2" />
                  Payment Method
                </h2>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <FaShieldAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">
                        Secure Checkout with Stripe
                      </h4>
                      <p className="text-blue-700 text-sm">
                        Your payment information is encrypted and securely
                        processed by Stripe. You'll be redirected to complete
                        your payment.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-blue-100">
                    <div className="flex space-x-3 mb-2 sm:mb-0">
                      <FaCcVisa className="text-4xl" />
                      <FaCcMastercard className="text-4xl" />
                      <FaCcAmex className="text-4xl" />
                    </div>
                    <div className="flex items-center text-blue-700">
                      <FaLock className="mr-1" />
                      <span className="text-sm font-medium">
                        Bank-level Security
                      </span>
                    </div>
                  </div>
                </div>

                {/* UPDATED PAYMENT BUTTON */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 ${
                    isProcessing
                      ? "bg-indigo-400"
                      : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                  } text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center text-lg`}
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaDollarSign className="mr-2" />
                      Pay ${priceDetails.total.toFixed(2)} Securely
                    </>
                  )}
                </motion.button>

                {/* Display payment errors if any */}
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md"
                  >
                    <p className="text-red-700 text-sm">
                      <strong>Error:</strong> {paymentError}
                    </p>
                  </motion.div>
                )}

                <div className="mt-5 flex items-center justify-center text-gray-500 text-sm">
                  <FaClock className="mr-2" />
                  <p>
                    You won't be charged until after confirming on the next page
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column - Booking summary */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {property.images && property.images[0] && (
                  <div className="relative">
                    <img
                      src={
                        property.images[0].includes("https://")
                          ? property.images[0]
                          : `/properties/${property.images[0]}`
                      }
                      alt={property.name}
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-lg shadow-md flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">4.9</span>
                    </div>
                  </div>
                )}

                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {property.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <FaMapMarkerAlt className="mr-1 text-indigo-500" />
                    <span>
                      {property.location.city}, {property.location.state}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center">
                      <div className="bg-indigo-50 p-1 rounded mr-2">
                        <FaBed className="text-indigo-500" />
                      </div>
                      <span>{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-indigo-50 p-1 rounded mr-2">
                        <FaBath className="text-indigo-500" />
                      </div>
                      <span>{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-indigo-50 p-1 rounded mr-2">
                        <FaRulerCombined className="text-indigo-500" />
                      </div>
                      <span>{property.square_feet} sqft</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <FaDollarSign className="text-indigo-500 mr-2" />
                    Price Details
                  </h4>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        ${(priceDetails.basePrice / nights).toFixed(2)} ×{" "}
                        {nights} nights
                      </span>
                      <span className="font-medium">
                        ${priceDetails.basePrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Cleaning fee</span>
                      <span className="font-medium">
                        ${priceDetails.cleaningFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">
                        ${priceDetails.serviceFee.toFixed(2)}
                      </span>
                    </div>

                    {discountApplied && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center">
                          <FaTag className="mr-1" />
                          Discount (10%)
                        </span>
                        <span className="font-medium">
                          -${priceDetails.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 border-gray-200">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-indigo-600">
                        ${priceDetails.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                  <FaShieldAlt className="mr-2" />
                  Free cancellation
                </h4>
                <p className="text-sm text-blue-700 mb-2">
                  Cancel before{" "}
                  <span className="font-semibold">
                    {new Date(
                      checkInDate.getTime() - 2 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </span>{" "}
                  for a full refund.
                </p>
                <p className="text-xs text-blue-600">
                  Our Stress-Free Booking Policy ensures peace of mind with your
                  reservation
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 bg-white rounded-xl shadow-md p-6 border border-gray-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-50 p-3 rounded-full mb-3">
                <FaShieldAlt className="text-indigo-600 text-xl" />
              </div>
              <h5 className="font-semibold mb-1">Secure Booking</h5>
              <p className="text-xs text-gray-500">
                Industry-leading encryption
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-50 p-3 rounded-full mb-3">
                <FaLock className="text-green-600 text-xl" />
              </div>
              <h5 className="font-semibold mb-1">Privacy Protected</h5>
              <p className="text-xs text-gray-500">Your data stays private</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-yellow-50 p-3 rounded-full mb-3">
                <FaStar className="text-yellow-600 text-xl" />
              </div>
              <h5 className="font-semibold mb-1">Top-rated Properties</h5>
              <p className="text-xs text-gray-500">Verified listings only</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-50 p-3 rounded-full mb-3">
                <FaHome className="text-red-600 text-xl" />
              </div>
              <h5 className="font-semibold mb-1">24/7 Support</h5>
              <p className="text-xs text-gray-500">Help whenever you need it</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
