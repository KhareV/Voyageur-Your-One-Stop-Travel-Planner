import React, { useState, useEffect } from "react";
import {
  Globe,
  Wallet,
  Book,
  MapPin,
  Calendar,
  Camera,
  Activity,
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
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        const data = await response.json();
        setTrips(data);
        setSelectedTrip(data[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const processExpenseData = (expenses) => {
    return Object.entries(expenses)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
      }))
      .filter((item) => item.name !== "totalExpenses");
  };

  const EXPENSE_COLORS = [
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#6366f1",
  ];

  const stats = trips.length
    ? [
        {
          title: "Total Trips",
          value: trips.length,
          icon: Globe,
          color: "bg-purple-500",
        },
        {
          title: "Total Destinations",
          value: new Set(trips.map((t) => t.destination)).size,
          icon: MapPin,
          color: "bg-blue-500",
        },
        {
          title: "Total Expenses",
          value: `$${trips
            .reduce((acc, trip) => acc + trip.totalExpenses, 0)
            .toLocaleString()}`,
          icon: Wallet,
          color: "bg-green-500",
        },
        {
          title: "Journal Entries",
          value: trips.reduce(
            (acc, trip) => acc + trip.journalEntries.length,
            0
          ),
          icon: Book,
          color: "bg-pink-500",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back, Explorer!
            </h1>
            <p className="text-gray-600 mt-2">
              Managing {trips.length} adventures
            </p>
            <button
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg 
              transform transition-all duration-300 hover:scale-105 hover:shadow-lg mt-6"
              onClick={() => {
                navigate("/user-dashboard/trips");
              }}
            >
              View All Trips
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg 
              transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => {
                navigate("/user-dashboard/add-trip");
              }}
            >
              New Trip
            </button>

            <button
              className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg 
  transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-purple-50"
              onClick={() => {
                navigate("/user-dashboard/itinerary");
              }}
            >
              Make Future Itineraries with us
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-4">
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md transform transition-all duration-300 hover:shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.slice(0, 2).map((trip) => (
                <div
                  key={trip.id}
                  className="relative group overflow-hidden rounded-lg transform transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={trip.images[0]}
                    alt={trip.destination}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-semibold">
                      {trip.tripName}
                    </h3>
                    <div className="flex items-center space-x-2 text-white/80 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} -{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg 
              transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => {
                  navigate("/user-dashboard/user-map");
                }}
              >
                Discover New Places to Visit
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md transform transition-all duration-300 hover:shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Journal Entries</h2>
            <div className="space-y-4">
              {trips.slice(0, 3).map((trip, index) =>
                trip.journalEntries.map((entry, entryIndex) => (
                  <div
                    key={`${trip.id}-${entryIndex}`}
                    className="flex items-center space-x-3 p-2 rounded-lg 
                    transform transition-all duration-300 hover:bg-purple-50"
                  >
                    <Book className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{trip.tripName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-md transform transition-all duration-300 hover:shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Expense Distribution</h2>
            <div className="h-80 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      selectedTrip
                        ? processExpenseData(selectedTrip.expenses)
                        : []
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {processExpenseData(selectedTrip?.expenses || {}).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-2">
                {selectedTrip &&
                  processExpenseData(selectedTrip.expenses).map(
                    (expense, index) => (
                      <div
                        key={expense.name}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: EXPENSE_COLORS[index] }}
                        ></div>
                        <span className="text-sm">{expense.name}</span>
                        <span className="text-sm font-bold">
                          ${expense.value}
                        </span>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
