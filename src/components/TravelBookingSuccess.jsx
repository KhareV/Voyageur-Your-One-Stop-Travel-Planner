import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Calendar, MapPin } from "lucide-react";

const TravelBookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!sessionId) {
        setError("No booking session found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/travel-booking/${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err.message || "Error retrieving booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Something went wrong
          </h1>
          <p className="text-gray-600 mt-2">
            {error || "Booking details could not be found"}
          </p>
          <div className="mt-8">
            <Link
              to="/travel"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return to Travel Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            </div>
            <p className="mt-2 opacity-90">
              Your travel booking has been successfully processed.
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirmation #
                {booking.bookingReference || booking.sessionId.slice(0, 8)}
              </p>
              <p className="text-green-700 text-sm mt-1">
                A confirmation email has been sent to {booking.customerEmail}
              </p>
            </div>

            <div className="border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Travel Details
              </h2>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-600 font-medium">Route</p>
                    <p className="text-gray-800">
                      {booking.origin} to {booking.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-600 font-medium">Departure Date</p>
                    <p className="text-gray-800">
                      {new Date(booking.departureDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Payment Information
              </h2>
              <div className="flex justify-between">
                <p className="text-gray-600">Total Paid</p>
                <p className="font-bold text-gray-800">
                  ${booking.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Link
                to="/user-dashboard"
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
              >
                View in My Trips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TravelBookingSuccess;
