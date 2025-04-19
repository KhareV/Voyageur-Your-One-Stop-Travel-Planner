import { useState, useEffect } from "react";
import {
  useUser,
  SignedOut,
  SignIn,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const PropertyAddForm = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageCount, setImageCount] = useState(0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const imageFiles = e.target.images.files;
    if (imageFiles.length > 4) {
      setError("Maximum 4 images allowed");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(e.target);
      const currentDate = new Date().toISOString();

      const propertyData = {
        owner: user.id,
        name: formData.get("name"),
        type: formData.get("type"),
        description: formData.get("description"),
        location: {
          street: formData.get("location.street"),
          city: formData.get("location.city"),
          state: formData.get("location.state"),
          zipcode: formData.get("location.zipcode"),
        },
        beds: parseInt(formData.get("beds")),
        baths: parseInt(formData.get("baths")),
        square_feet: parseInt(formData.get("square_feet")),
        amenities: Array.from(formData.getAll("amenities")),
        rates: {
          nightly: parseFloat(formData.get("rates.nightly")) || null,
          weekly: parseFloat(formData.get("rates.weekly")) || null,
          monthly: parseFloat(formData.get("rates.monthly")) || null,
        },
        seller_info: {
          name: formData.get("seller_info.name"),
          email: formData.get("seller_info.email"),
          phone: formData.get("seller_info.phone"),
        },
        images: [],
        is_featured: false,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      // Redirect to verification page with property data
      navigate("/verify-aadhaar", { state: { propertyData } });
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    setImageCount(e.target.files.length);
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-8">
            <h2 className="text-3xl font-bold text-white text-center">
              Add Your Property
            </h2>
            <p className="text-blue-100 text-center mt-2">
              Fill in the details below to list your property
            </p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select property type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="House">House</option>
                      <option value="CabinOrCottage">Cabin or Cottage</option>
                      <option value="Room">Room</option>
                      <option value="Studio">Studio</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Listing Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g. Beautiful Apartment In Miami"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Add an optional description of your property"
                  ></textarea>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Property Location
                </h3>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="street"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="location.street"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="123 Main St."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="location.city"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="location.state"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="State"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="zipcode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Zipcode
                      </label>
                      <input
                        type="text"
                        id="zipcode"
                        name="location.zipcode"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Zipcode"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Property Details
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="beds"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Beds <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="beds"
                        name="beds"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="baths"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Baths <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="baths"
                        name="baths"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="square_feet"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Square Feet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="square_feet"
                        name="square_feet"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Amenities
                </h3>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_wifi"
                        name="amenities"
                        value="Wifi"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_wifi"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Wifi
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_kitchen"
                        name="amenities"
                        value="Full kitchen"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_kitchen"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Full kitchen
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_washer_dryer"
                        name="amenities"
                        value="Washer & Dryer"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_washer_dryer"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Washer & Dryer
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_free_parking"
                        name="amenities"
                        value="Free Parking"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_free_parking"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Free Parking
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_pool"
                        name="amenities"
                        value="Swimming Pool"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_pool"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Swimming Pool
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_hot_tub"
                        name="amenities"
                        value="Hot Tub"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_hot_tub"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Hot Tub
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_24_7_security"
                        name="amenities"
                        value="24/7 Security"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_24_7_security"
                        className="ml-2 text-sm text-gray-700"
                      >
                        24/7 Security
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_wheelchair_accessible"
                        name="amenities"
                        value="Wheelchair Accessible"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_wheelchair_accessible"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Wheelchair Accessible
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_elevator_access"
                        name="amenities"
                        value="Elevator Access"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_elevator_access"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Elevator Access
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_dishwasher"
                        name="amenities"
                        value="Dishwasher"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_dishwasher"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Dishwasher
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_gym_fitness_center"
                        name="amenities"
                        value="Gym/Fitness Center"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_gym_fitness_center"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Gym/Fitness Center
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_air_conditioning"
                        name="amenities"
                        value="Air Conditioning"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_air_conditioning"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Air Conditioning
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_balcony_patio"
                        name="amenities"
                        value="Balcony/Patio"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_balcony_patio"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Balcony/Patio
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_smart_tv"
                        name="amenities"
                        value="Smart TV"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_smart_tv"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Smart TV
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="amenity_coffee_maker"
                        name="amenities"
                        value="Coffee Maker"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="amenity_coffee_maker"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Coffee Maker
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Pricing
                </h3>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-4">
                    Leave blank if not applicable
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="nightly_rate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nightly Rate ($)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="nightly_rate"
                          name="rates.nightly"
                          min="0"
                          step="0.01"
                          className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="weekly_rate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Weekly Rate ($)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="weekly_rate"
                          name="rates.weekly"
                          min="0"
                          step="0.01"
                          className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="monthly_rate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Monthly Rate ($)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="monthly_rate"
                          name="rates.monthly"
                          min="0"
                          step="0.01"
                          className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="seller_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="seller_name"
                      name="seller_info.name"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="seller_email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="seller_email"
                      name="seller_info.email"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="seller_phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="seller_phone"
                      name="seller_info.phone"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Property Images
                </h3>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <label
                    htmlFor="images"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Upload Images <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 ml-1">
                      (Select up to 4 images)
                    </span>
                  </label>

                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      {imageCount > 0 && (
                        <p className="text-sm font-medium text-blue-600">
                          {imageCount} {imageCount === 1 ? "image" : "images"}{" "}
                          selected
                        </p>
                      )}
                      {imageCount > 4 && (
                        <p className="text-sm font-medium text-red-600">
                          Maximum 4 images allowed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-4 text-base font-medium text-center text-white bg-gradient-to-r from-blue-600 to-[#FB2C36] rounded-lg shadow-md hover:bg-gradient-to-r hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Property...
                    </div>
                  ) : (
                    "Add Property"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PropertyAddForm;
