import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowLeft,
  Shield,
  Calendar,
  Clock,
} from "lucide-react";

// Load Stripe outside of component render to avoid recreating Stripe object on each render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Add this near the top of your component as default values
const defaultOption = {
  type: "flight",
  origin: "Unknown Origin",
  destination: "Unknown Destination",
  departureTime: new Date().toISOString(),
  price: 100, // Default price
};

// Default traveler details to prevent null checks from failing
const defaultTravelerDetails = {
  email: "",
  name: "",
  phone: "",
};

const TravelPayment = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [travelerDetails, setTravelerDetails] = useState(
    defaultTravelerDetails
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [paymentError, setPaymentError] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [travelersCount, setTravelersCount] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Modify your useEffect to populate travelerDetails as well and ensure valid data
  useEffect(() => {
    const loadTravelDetails = () => {
      try {
        // Get state from location if available
        const travelOptionString = localStorage.getItem("selectedTravelOption");
        const travelerDetailsString = localStorage.getItem("travelerDetails");

        if (travelOptionString) {
          try {
            const parsedOption = JSON.parse(travelOptionString);
            // Validate required fields
            if (!parsedOption.origin) parsedOption.origin = "Unknown Origin";
            if (!parsedOption.destination)
              parsedOption.destination = "Unknown Destination";
            if (!parsedOption.departureTime)
              parsedOption.departureTime = new Date().toISOString();
            if (!parsedOption.price) parsedOption.price = 100;

            setSelectedOption(parsedOption);
            console.log("Loaded travel option:", parsedOption);
          } catch (parseError) {
            console.error("Error parsing travel option:", parseError);
            setSelectedOption(defaultOption);
          }
        } else {
          console.log("No travel option found in storage, using default");
          setSelectedOption(defaultOption);
        }

        if (travelerDetailsString) {
          try {
            const parsedTraveler = JSON.parse(travelerDetailsString);
            setTravelerDetails(parsedTraveler);
            // Also set the form fields
            setName(parsedTraveler.name || "");
            setEmail(parsedTraveler.email || "");
            console.log("Loaded traveler details:", parsedTraveler);
          } catch (parseError) {
            console.error("Error parsing traveler details:", parseError);
            setTravelerDetails(defaultTravelerDetails);
          }
        } else {
          console.log("No traveler details found in storage, using default");
          setTravelerDetails(defaultTravelerDetails);
        }
      } catch (error) {
        console.error("Error loading travel details:", error);
        setSelectedOption(defaultOption);
        setTravelerDetails(defaultTravelerDetails);
      }
    };

    loadTravelDetails();
  }, []);

  // Modify the createPaymentIntent function to add debugging
  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setPaymentError(null);

      console.log("Creating payment intent with options:", {
        selectedOption,
        name,
        email,
        travelersCount,
      });

      // Use default values if selectedOption is null
      const option = selectedOption || defaultOption;

      // Enhanced validation with better error messages
      if (!name || name.trim() === "") {
        throw new Error("Please enter your name");
      }

      if (!email || email.trim() === "" || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      // Fix the URL to use the correct server endpoint
      const response = await fetch(
        "http://localhost:5000/api/create-travel-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transportType: option.type || "flight",
            origin: option.origin || "Unknown Origin",
            destination: option.destination || "Unknown Destination",
            departureDate: option.departureTime || new Date().toISOString(),
            travelers: travelersCount || 1,
            customerEmail: email,
            customerName: name,
            priceDetails: {
              total: calculateTotalPrice(),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server returned ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Payment intent created successfully:", data);

      if (!data.checkoutUrl) {
        throw new Error(
          "Invalid response from payment server: missing checkout URL"
        );
      }

      console.log("Redirecting to:", data.checkoutUrl);
      // Redirect to Stripe checkout with a small delay to ensure state updates
      setTimeout(() => {
        window.location.href = data.checkoutUrl;
      }, 100);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setPaymentError(
        error.message ||
          "Failed to create payment intent. Please try again later."
      );
      setLoading(false); // Make sure to set loading to false on error
    }
  };

  // Update the calculateTotalPrice function to handle null selectedOption
  const calculateTotalPrice = () => {
    if (!selectedOption) return 100; // Default price if no option selected
    const basePrice = selectedOption.price || 100;
    return (
      basePrice * (travelersCount || 1) +
      (selectedAddons || []).reduce(
        (total, addon) => total + (addon.price || 0),
        0
      )
    );
  };

  const handlePaymentSuccess = (paymentIntentResult) => {
    // Generate a booking reference
    const reference =
      "VOY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBookingReference(reference);
    setPaymentSuccess(true);

    // Save booking details to database (in a real app, this would be done on the server)
    console.log("Booking completed!", {
      reference,
      paymentIntent: paymentIntentResult,
      option: selectedOption,
      traveler: travelerDetails,
    });

    // Clear session storage
    setTimeout(() => {
      sessionStorage.removeItem("selectedTravelOption");
      sessionStorage.removeItem("travelerDetails");
    }, 1000);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Fix the loading condition to only depend on the loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Processing your payment request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        {!paymentSuccess && (
          <button
            onClick={() => navigate("/booking-confirmation")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to booking details
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold">
              {paymentSuccess ? "Payment Successful" : "Complete Your Payment"}
            </h1>
            <p className="text-indigo-100">
              {paymentSuccess
                ? "Your booking has been confirmed"
                : "Secure payment processing with Stripe"}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {paymentSuccess ? (
              // Payment Success View
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Thank you for your booking!
                </h2>

                <p className="text-gray-600 mb-6">
                  Your payment has been successfully processed and your booking
                  is confirmed.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="text-lg font-medium mb-4">Booking Details</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Booking Reference:</span>
                      <span className="font-medium">{bookingReference}</span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Transport:</span>
                      <span className="font-medium">
                        {selectedOption.transportType === "flights"
                          ? "Flight"
                          : selectedOption.transportType === "trains"
                          ? "Train"
                          : "Bus"}
                      </span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">
                        {selectedOption.origin} → {selectedOption.destination}
                      </span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Departure Date:</span>
                      <span className="font-medium">
                        {formatDate(selectedOption.departureTime)}
                      </span>
                    </div>

                    <div className="flex justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">
                        ${calculateTotalPrice()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-8">
                  A confirmation email has been sent to {travelerDetails.email}
                </p>

                <button
                  onClick={() => navigate("/user-dashboard")}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                >
                  View in Dashboard
                </button>
              </div>
            ) : (
              // Payment Form View
              <div>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left - Booking Summary */}
                  <div className="md:w-2/5">
                    <div className="bg-gray-50 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Order Summary
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 rounded-md p-2">
                            {selectedOption.transportType === "flights" ? (
                              <CreditCard className="h-5 w-5 text-indigo-700" />
                            ) : selectedOption.transportType === "trains" ? (
                              <Calendar className="h-5 w-5 text-indigo-700" />
                            ) : (
                              <Clock className="h-5 w-5 text-indigo-700" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">
                              {selectedOption.airline}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedOption.origin} →{" "}
                              {selectedOption.destination}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(selectedOption.departureTime)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Base fare</span>
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

                          <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span className="text-indigo-600">
                              ${calculateTotalPrice()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 bg-green-50 rounded-lg p-4 text-green-700 flex items-center text-sm">
                      <Shield className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p>Your payment is secured with SSL encryption</p>
                    </div>
                  </div>

                  {/* Right - Payment Form */}
                  <div className="md:w-3/5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-5">
                      Payment Details
                    </h3>

                    {paymentError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start">
                        <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm">{paymentError}</p>
                      </div>
                    )}

                    {/* Add input fields for name and email */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {clientSecret && (
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret }}
                      >
                        <PaymentForm
                          onSuccess={handlePaymentSuccess}
                          onError={(msg) => setError(msg)}
                        />
                      </Elements>
                    )}

                    <button
                      onClick={createPaymentIntent}
                      disabled={loading}
                      className="w-full py-3 mt-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    >
                      {loading ? "Processing..." : "Proceed to Payment"}
                    </button>

                    <div className="mt-6 flex items-center justify-center text-xs text-gray-500 space-x-2">
                      <Lock className="h-4 w-4" />
                      <p>Secured payment by Stripe</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TravelPayment;
