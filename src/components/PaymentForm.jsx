import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { CheckCircle, RefreshCcw } from "lucide-react";

const PaymentForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    address: {
      line1: "",
      city: "",
      postal_code: "",
      country: "",
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      onError("Please complete your card information");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError("An error occurred with your payment system");
      return;
    }

    setLoading(true);

    try {
      // Get the client secret from the URL
      const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
      );

      let paymentIntent;

      if (clientSecret) {
        // If we have a client secret in the URL, use confirmCardPayment
        const { error, paymentIntent: confirmedIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: billingDetails,
            },
          });

        if (error) {
          throw new Error(
            error.message || "An error occurred with your payment"
          );
        }

        paymentIntent = confirmedIntent;
      } else {
        // If no client secret in URL, assume it was already created and stored in the Element
        const { error, paymentIntent: confirmedIntent } =
          await stripe.confirmCardPayment(undefined, {
            payment_method: {
              card: cardElement,
              billing_details: billingDetails,
            },
          });

        if (error) {
          throw new Error(
            error.message || "An error occurred with your payment"
          );
        }

        paymentIntent = confirmedIntent;
      }

      if (paymentIntent.status === "succeeded") {
        // After successful payment, confirm the booking in our backend
        const confirmResponse = await fetch("/api/confirm-travel-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            travelDetails: {
              billingName: billingDetails.name,
              billingAddress: billingDetails.address,
            },
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.message || "Failed to confirm booking");
        }

        const bookingConfirmation = await confirmResponse.json();

        // Pass confirmation data to success handler
        onSuccess({
          ...paymentIntent,
          bookingReference: bookingConfirmation.bookingReference,
        });
      } else {
        onError("Payment processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setBillingDetails({
        ...billingDetails,
        [parent]: {
          ...billingDetails[parent],
          [child]: value,
        },
      });
    } else {
      setBillingDetails({
        ...billingDetails,
        [name]: value,
      });
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#424770",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
        iconColor: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            name="name"
            value={billingDetails.name}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line
          </label>
          <input
            type="text"
            name="address.line1"
            value={billingDetails.address.line1}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="address.city"
              value={billingDetails.address.city}
              onChange={handleInputChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="address.postal_code"
              value={billingDetails.address.postal_code}
              onChange={handleInputChange}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="10001"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="address.country"
            value={billingDetails.address.country}
            onChange={handleInputChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Information
          </label>
          <div className="p-3 border border-gray-300 rounded-md shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <CardElement
              options={cardStyle}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Test card: 4242 4242 4242 4242, any future date, any CVC
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!stripe || loading || !cardComplete}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm transition disabled:opacity-70 flex items-center justify-center"
      >
        {loading ? (
          <>
            <RefreshCcw className="animate-spin mr-2 h-4 w-4" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </motion.button>
    </form>
  );
};

export default PaymentForm;
