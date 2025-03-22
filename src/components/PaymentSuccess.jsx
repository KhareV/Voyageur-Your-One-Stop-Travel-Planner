import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaHome,
  FaDownload,
  FaEnvelope,
} from "react-icons/fa";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Get session ID from URL query params
        const params = new URLSearchParams(location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          throw new Error("No session ID found");
        }

        // Call your API to get booking details using the session ID
        const response = await fetch(
          `http://localhost:5000/api/booking/details?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setBookingDetails(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError(error.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [location]);

  // For demo purposes, let's create some mock data
  const mockBookingDetails = {
    bookingId: "BK" + Math.floor(100000 + Math.random() * 900000),
    propertyName: "Luxury Downtown Apartment",
    checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    guests: 2,
    total: 1249.5,
    paymentMethod: "Visa •••• 4242",
    paymentDate: new Date(),
  };

  // Use mock data for now
  const details = bookingDetails || mockBookingDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-teal-500 py-8 px-6 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto bg-white rounded-full w-20 h-20 flex items-center justify-center mb-4"
            >
              <FaCheckCircle className="text-green-500 text-4xl" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p>Thank you for your payment. Your booking has been confirmed.</p>
          </div>

          <div className="p-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Booking Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Booking ID</p>
                  <p className="font-medium">{details.bookingId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Date</p>
                  <p className="font-medium">
                    {details.paymentDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Property</p>
                  <p className="font-medium">{details.propertyName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Method</p>
                  <p className="font-medium">{details.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Check-in</p>
                  <p className="font-medium">
                    {details.checkIn.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Check-out</p>
                  <p className="font-medium">
                    {details.checkOut.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Guests</p>
                  <p className="font-medium">{details.guests}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="font-semibold">${details.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                What's Next?
              </h3>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <FaCalendarAlt className="text-green-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">
                      Check-in Instructions
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Check-in details and property access instructions will be
                      emailed to you 24 hours before your arrival.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <FaDownload className="mr-2" />
                  Download Receipt
                </button>
                <button className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <FaEnvelope className="mr-2" />
                  Email Details
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => navigate("/user-dashboard")}
                className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-md transition-all"
              >
                Browse More Properties <FaArrowRight className="ml-2 inline" />
              </button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-500 text-sm mt-8">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
