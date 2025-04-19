import React, { useState } from "react";
import {
  Plane,
  Calendar,
  MapPin,
  Activity,
  PlusCircle,
  Image as ImageIcon,
  Book,
  DollarSign,
  X,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddTrip = () => {
  const navigate = useNavigate();
  const total = 0;

  const [formData, setFormData] = useState({
    id: "",
    tripName: "",
    destination: "",
    startDate: "",
    endDate: "",
    activities: [""],
    expenses: {
      flights: 0,
      accomodation: 0,
      food: 0,
      transport: 0,
      miscellaneous: 0,
    },
    totalExpenses: 0,
    journalEntries: [
      {
        date: "",
        entry: "",
      },
    ],
    images: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExpenseChange = (category, value) => {
    setFormData((prev) => {
      const updatedExpenses = {
        ...prev.expenses,
        [category]: parseFloat(value) || 0,
      };

      const newTotalExpenses = Object.values(updatedExpenses).reduce(
        (acc, curr) => acc + curr,
        0
      );

      return {
        ...prev,
        expenses: updatedExpenses,
        totalExpenses: newTotalExpenses,
      };
    });
  };

  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, ""],
    }));
  };

  const handleActivityChange = (index, value) => {
    const newActivities = [...formData.activities];
    newActivities[index] = value;
    setFormData((prev) => ({
      ...prev,
      activities: newActivities,
    }));
  };

  const addJournalEntry = () => {
    setFormData((prev) => ({
      ...prev,
      journalEntries: [...prev.journalEntries, { date: "", entry: "" }],
    }));
  };

  const handleJournalChange = (index, field, value) => {
    const newEntries = [...formData.journalEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      journalEntries: newEntries,
    }));
  };

  const removeJournalEntry = (index) => {
    setFormData((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formData.id ||
        !formData.tripName ||
        !formData.destination ||
        !formData.startDate ||
        !formData.endDate
      ) {
        alert(
          "Please fill in all required fields (Trip ID, Trip Name, Destination, Dates)"
        );
        return;
      }

      const numericId = parseInt(formData.id);
      if (isNaN(numericId) || numericId <= 0) {
        alert("Please enter a valid positive number for Trip ID");
        return;
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert("End date cannot be before start date");
        return;
      }

      if (formData.activities.every((activity) => !activity.trim())) {
        alert("Please add at least one activity");
        return;
      }

      if (formData.images.length === 0) {
        alert("Please upload at least one image before submitting.");
        return;
      }

      const tripPayload = {
        id: numericId,
        tripName: formData.tripName.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        activities: formData.activities.filter((a) => a.trim() !== ""),
        expenses: Object.fromEntries(
          Object.entries(formData.expenses).map(([k, v]) => [
            k,
            Math.max(0, parseFloat(v) || 0),
          ])
        ),
        totalExpenses: Object.values(formData.expenses).reduce(
          (acc, curr) => acc + Math.max(0, parseFloat(curr) || 0),
          0
        ),
        journalEntries: formData.journalEntries.filter(
          (entry) => entry.date && entry.entry.trim() !== ""
        ),
        images: formData.images.map((file) =>
          file instanceof File ? URL.createObjectURL(file) : file
        ),
      };

      const formDataToSend = new FormData();
      formDataToSend.append("tripData", JSON.stringify(tripPayload));

      formData.images.forEach((file, index) => {
        if (file instanceof File) {
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`Image ${index + 1} exceeds 5MB size limit`);
          }
          if (!file.type.startsWith("image/")) {
            throw new Error(`File ${index + 1} is not a valid image`);
          }
          formDataToSend.append("images", file, `image-${index}-${Date.now()}`);
        }
      });

      setLoading(true);

      const response = await fetch("http://localhost:5000/api/trips", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "A trip with this ID already exists. Please use a different ID."
          );
        } else if (response.status === 400) {
          throw new Error(data.error || "Invalid input data");
        } else {
          throw new Error(data.error || "Failed to create trip");
        }
      }

      alert("Trip created successfully!");
      navigate(`/user-dashboard/trips/${data.trip.id}`);
    } catch (error) {
      console.error("Submission error details:", {
        message: error.message,
        stack: error.stack,
      });

      let errorMessage = "An error occurred while creating the trip.";
      if (error.message.includes("ID already exists")) {
        errorMessage = error.message;
      } else if (error.message.includes("size limit")) {
        errorMessage = "One or more images exceed the 5MB size limit.";
      } else if (error.message.includes("valid image")) {
        errorMessage = "Only valid image files are allowed.";
      } else if (error.message.includes("Database connection error")) {
        errorMessage =
          "Unable to connect to the database. Please try again later.";
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="relative group">
              <input
                type="number"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent
            focus:border-blue-400 outline-none transition duration-300
            group-hover:shadow-lg placeholder-gray-400"
                placeholder="Enter Trip ID (Required)"
                min="1"
                required
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                #ID
              </span>
            </div>
            <div className="relative group">
              <input
                type="text"
                name="tripName"
                value={formData.tripName}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                         focus:border-blue-400 outline-none transition duration-300 
                         group-hover:shadow-lg placeholder-gray-400"
                placeholder="Trip Name"
              />
              <Plane
                className="absolute right-4 top-1/2 transform -translate-y-1/2 
                              text-blue-400 transition duration-300 group-hover:scale-110"
              />
            </div>

            <div className="relative group">
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                         focus:border-purple-400 outline-none transition duration-300 
                         group-hover:shadow-lg placeholder-gray-400"
                placeholder="Destination"
              />
              <MapPin
                className="absolute right-4 top-1/2 transform -translate-y-1/2 
                               text-purple-400 transition duration-300 group-hover:scale-110"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                           focus:border-green-400 outline-none transition duration-300 
                           group-hover:shadow-lg"
                />
                <Calendar
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                  text-green-400 transition duration-300 group-hover:scale-110"
                />
              </div>

              <div className="relative group">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                           focus:border-green-400 outline-none transition duration-300 
                           group-hover:shadow-lg"
                />
                <Calendar
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                  text-green-400 transition duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.activities.map((activity, index) => (
              <div key={index} className="relative group">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => handleActivityChange(index, e.target.value)}
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                           focus:border-pink-400 outline-none transition duration-300 
                           group-hover:shadow-lg placeholder-gray-400"
                  placeholder={`Activity ${index + 1}`}
                />
                <Activity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                  text-pink-400 transition duration-300 group-hover:scale-110"
                />
              </div>
            ))}
            <button
              onClick={addActivity}
              className="w-full px-6 py-4 bg-pink-100 rounded-xl transition duration-300 
                       hover:bg-pink-200 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Activity
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {Object.entries(formData.expenses).map(([category, amount]) => (
              <div key={category} className="relative group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    handleExpenseChange(category, e.target.value)
                  }
                  className="w-full px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl border-2 border-transparent 
                           focus:border-amber-400 outline-none transition duration-300 
                           group-hover:shadow-lg placeholder-gray-400"
                  placeholder={
                    category.charAt(0).toUpperCase() + category.slice(1)
                  }
                />
                <DollarSign
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                    text-amber-400 transition duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {formData.journalEntries.map((entry, index) => (
              <div
                key={index}
                className="relative group bg-white/80 backdrop-blur-md rounded-xl p-6 
                                        transition duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => removeJournalEntry(index)}
                  className="absolute right-2 top-2 p-2 text-gray-400 hover:text-red-400 
                           transition duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) =>
                        handleJournalChange(index, "date", e.target.value)
                      }
                      className="w-full px-6 py-4 bg-white/80 rounded-xl border-2 border-transparent 
                               focus:border-indigo-400 outline-none transition duration-300"
                    />
                    <Calendar
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                      text-indigo-400 ml-10"
                    />
                  </div>
                  <textarea
                    value={entry.entry}
                    onChange={(e) =>
                      handleJournalChange(index, "entry", e.target.value)
                    }
                    className="w-full px-6 py-4 bg-white/80 rounded-xl border-2 border-transparent 
                             focus:border-indigo-400 outline-none transition duration-300 
                             resize-none h-32"
                    placeholder="Write your journal entry..."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addJournalEntry}
              className="w-full px-6 py-4 bg-indigo-100 rounded-xl transition duration-300 
                       hover:bg-indigo-200 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Book className="w-5 h-5" />
              Add Journal Entry
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition duration-300 
                         ${
                           dragActive
                             ? "border-purple-400 bg-purple-50"
                             : "border-gray-300 hover:border-purple-400"
                         }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center space-y-4">
                <Upload className="mx-auto h-12 w-12 text-purple-400" />
                <div className="text-gray-600">
                  <p className="font-medium">Drop your images here</p>
                  <p className="text-sm">or click to select files</p>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={
                        file instanceof File ? URL.createObjectURL(file) : file
                      }
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg transition duration-300 group-hover:shadow-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full 
                               opacity-0 group-hover:opacity-100 transition duration-300 
                               hover:bg-red-100"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl 
                      transition duration-500 hover:shadow-2xl"
        >
          <h1
            className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 
                       to-purple-600 bg-clip-text text-transparent"
          >
            Plan Your Adventure
          </h1>

          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full 
                         transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Basic Info</span>
              <span>Dates</span>
              <span>Activities</span>
              <span>Budget</span>
              <span>Journal</span>
              <span>Photos</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                className={`px-6 py-3 rounded-xl transition duration-300 
                         ${
                           currentStep === 1
                             ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                             : "bg-white text-gray-700 hover:shadow-lg"
                         }`}
                disabled={currentStep === 1}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                           text-white rounded-xl transition duration-300 hover:shadow-lg 
                           hover:scale-105 transform"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 
                           text-white rounded-xl transition duration-300 hover:shadow-lg 
                           hover:scale-105 transform"
                >
                  Create Trip
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTrip;
