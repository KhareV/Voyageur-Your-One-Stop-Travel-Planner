import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Globe,
  Wallet,
  Book,
  MapPin,
  Calendar,
  Camera,
  Activity,
  Target,
  Plane,
  Navigation,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/trips`);
        const data = await response.json();
        setTrip(data[id - 1]);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  const processExpenseData = (expenses) => {
    return Object.entries(expenses)
      .map(([category, amount]) => ({ name: category, value: amount }))
      .filter((item) => item.value > 0);
  };

  const EXPENSE_COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
  ];

  const dailySpendingData = [
    { day: "Day 1", amount: 120 },
    { day: "Day 2", amount: 250 },
    { day: "Day 3", amount: 180 },
    { day: "Day 4", amount: 300 },
    { day: "Day 5", amount: 200 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-100 to-pink-200">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <Navigation className="w-12 h-12 text-red-500 mb-4 mx-auto animate-bounce" />
          <p className="text-red-500 font-bold text-xl">Trip not found!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-6 transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl transition duration-300 hover:shadow-2xl transform hover:-translate-y-1">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-blue-600 animate-spin-slow" />
          </div>
          <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {trip.tripName}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4 text-gray-600">
            <MapPin className="w-5 h-5 text-pink-500" />
            <span>{trip.destination}</span>
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl transition duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-green-600">
              <Wallet className="h-6 w-6" /> Expense Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processExpenseData(trip.expenses)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {processExpenseData(trip.expenses).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl transition duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-600">
              <Target className="h-6 w-6" /> Daily Spending
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySpendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  fill="url(#colorGradient)"
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl transition duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
            <Activity className="h-6 w-6" /> Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.activities.map((activity, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl shadow transition duration-300 hover:shadow-lg hover:scale-105"
              >
                <Target className="w-6 h-6 text-indigo-500 mb-2" />
                <p className="text-gray-700">{activity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl transition duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-pink-600">
            <Camera className="h-6 w-6" /> Trip Memories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trip.images.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg transition duration-300 hover:shadow-2xl"
              >
                <img
                  src={image}
                  alt={`Trip Image ${index + 1}`}
                  className="w-full h-64 object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                  <p className="text-white text-sm">Memory #{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
