import {
  Globe,
  Wallet,
  Book,
  MapPin,
  Calendar,
  Camera,
  Activity,
  ChevronRight,
  Plus,
  Plane,
  Map,
  TrendingUp,
  Users,
  Compass,
  Search,
  Sparkles,
  Clock,
  Filter,
  ChevronLeft,
  BarChart3,
  ListFilter,
  X,
  Edit,
  BookAIcon,
} from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { HiGlobeAlt } from "react-icons/hi";
import { RiMapPinLine } from "react-icons/ri";
import { BiCopyright } from "react-icons/bi";
import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import CanvasLoader from "./Loading";
import React from "react";
import Girl from "./Girl";
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
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn("3D rendering error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const scrollRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent"); // recent, oldest, budget

  const navigate = useNavigate();
  const [canvasVisible, setCanvasVisible] = useState(true);
  const canvasErrorCount = useRef(0);

  // Handle Canvas errors to prevent repeated crashes
  const handleCanvasError = () => {
    canvasErrorCount.current += 1;
    if (canvasErrorCount.current > 2) {
      setCanvasVisible(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trips");
        const data = await response.json();

        // Sort trips by date (most recent first)
        const sortedTrips = sortTrips(data, sortOrder);
        setTrips(sortedTrips);
        setSelectedTrip(sortedTrips[0]);

        // Simulate loading for smoother UX
        setTimeout(() => setLoading(false), 600);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setLoading(false);
      }
    };

    fetchTrips();
  }, [sortOrder]);

  const sortTrips = (tripsData, order) => {
    // Create a shallow copy to avoid mutating the original data
    const sortedTrips = [...tripsData];

    switch (order) {
      case "recent":
        return sortedTrips.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
      case "oldest":
        return sortedTrips.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
      case "budget":
        return sortedTrips.sort((a, b) => b.totalExpenses - a.totalExpenses);
      default:
        return sortedTrips;
    }
  };

  const processExpenseData = (expenses) => {
    if (!expenses) return [];

    return Object.entries(expenses)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
      }))
      .filter(
        (item) => item.name !== "TotalExpenses" && item.name !== "totalExpenses"
      );
  };

  // Enhanced color palette
  const EXPENSE_COLORS = [
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f59e0b", // Amber
    "#6366f1", // Indigo
    "#06b6d4", // Cyan
  ];

  const stats = trips.length
    ? [
        {
          title: "Total Trips",
          value: trips.length,
          subtitle: "adventures collected",
          icon: Plane,
          color: "from-violet-500 to-purple-600",
          textColor: "text-purple-700",
          bgColor: "bg-purple-50",
          onClick: () => setActiveTab("trips"),
        },
        {
          title: "Destinations",
          value: new Set(trips.map((t) => t.destination)).size,
          subtitle: "places explored",
          icon: MapPin,
          color: "from-blue-500 to-indigo-600",
          textColor: "text-indigo-700",
          bgColor: "bg-indigo-50",
          onClick: () => navigate("/user-dashboard/user-map"),
        },
        {
          title: "Total Expenses",
          value: `$${trips
            .reduce((acc, trip) => acc + trip.totalExpenses, 0)
            .toLocaleString()}`,
          subtitle: "on your adventures",
          icon: Wallet,
          color: "from-emerald-500 to-teal-600",
          textColor: "text-teal-700",
          bgColor: "bg-teal-50",
          onClick: () => setActiveTab("expenses"),
        },
        {
          title: "Journal Entries",
          value: trips.reduce(
            (acc, trip) => acc + (trip.journalEntries?.length || 0),
            0
          ),
          subtitle: "memories recorded",
          icon: Book,
          color: "from-pink-500 to-rose-600",
          textColor: "text-rose-700",
          bgColor: "bg-rose-50",
          onClick: () => setActiveTab("journal"),
        },
      ]
    : [];

  // Simulated monthly spending data
  const monthlySpending = [
    { name: "Jan", amount: 1200 },
    { name: "Feb", amount: 1800 },
    { name: "Mar", amount: 1400 },
    { name: "Apr", amount: 2200 },
    { name: "May", amount: 1700 },
    { name: "Jun", amount: 2400 },
  ];

  // Organize journal entries for the Journal tab
  const allJournalEntries = trips
    .flatMap((trip) =>
      (trip.journalEntries || []).map((entry) => ({
        ...entry,
        tripName: trip.tripName,
        tripId: trip.id || trip._id,
        destination: trip.destination,
        image: trip.images?.[0] || null,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (most recent first)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="h-10 w-10 text-purple-500 animate-pulse" />
            </div>
          </div>
          <p className="text-purple-700 font-medium text-lg animate-pulse">
            Loading your adventures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2231&q=80')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 rounded-full bg-teal-400"></span>
                    <span className="text-sm font-medium text-white">
                      Your Travel Dashboard
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold">
                  Welcome back, Explorer!
                </h1>

                <p className="text-lg text-white/80 max-w-lg">
                  Track your adventures, manage expenses, and relive memories
                  from your {trips.length} journeys across the globe.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 flex items-center gap-2 bg-white text-indigo-700 font-medium rounded-lg shadow-lg"
                  onClick={() => navigate("/user-dashboard/add-trip")}
                >
                  <Plus size={18} />
                  Start New Adventure
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 flex items-center gap-2 bg-indigo-700/30 backdrop-blur-sm border border-white/20 text-white rounded-lg"
                  onClick={() => navigate("/user-dashboard/trips")}
                >
                  <Compass size={18} />
                  View All Trips
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 flex items-center gap-2 bg-purple-100/30 backdrop-blur-sm border border-white/20 text-white rounded-lg"
                  onClick={() => navigate("/user-dashboard/journals")}
                >
                  <BookAIcon size={18} />
                  Your Journals
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 text-indigo-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full"
          >
            <path
              fill="currentColor"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,138.7C672,149,768,203,864,224C960,245,1056,235,1152,202.7C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-14 relative z-10">
        {/* Quick Nav Tabs */}
        <div className="flex justify-between items-center">
          <motion.div
            className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide"
            ref={scrollRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {["overview", "trips", "expenses"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-indigo-700 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setFilterOpen(!filterOpen)}
            className="p-2 bg-white rounded-lg text-indigo-700 shadow-md relative"
          >
            <Filter size={18} />

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 p-2"
                >
                  <div className="text-sm text-gray-700 font-medium p-2">
                    Sort trips by:
                  </div>
                  {[
                    { id: "recent", label: "Most Recent" },
                    { id: "oldest", label: "Oldest First" },
                    { id: "budget", label: "Highest Budget" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        sortOrder === option.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => {
                        setSortOrder(option.id);
                        setFilterOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Section */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={stat.onClick}
                  >
                    <div className="flex">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                      >
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </p>
                        <p className={`text-2xl font-bold ${stat.textColor}`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {stat.title === "Total Expenses"
                            ? "Last 6 months trend"
                            : "View details"}
                        </span>
                        {stat.title === "Total Expenses" && (
                          <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                            <TrendingUp size={12} />
                            <span>+24%</span>
                          </div>
                        )}
                        {stat.title !== "Total Expenses" && (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Left Column */}
                <motion.div
                  className="lg:col-span-2 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {/* Monthly Spending */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" />
                        Spending Trends
                      </h2>
                      <select className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>All Time</option>
                      </select>
                    </div>

                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlySpending}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorAmount"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#8884d8"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#8884d8"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            formatter={(value) => [`$${value}`, "Amount"]}
                            contentStyle={{
                              backgroundColor: "white",
                              borderRadius: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              border: "none",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#8884d8"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Upcoming Trips */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Map className="mr-2 h-5 w-5 text-indigo-500" />
                        Your Adventures
                      </h2>
                      <button
                        className="text-indigo-600 text-sm font-medium flex items-center"
                        onClick={() => navigate("/user-dashboard/trips")}
                      >
                        View All
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {trips.slice(0, 2).map((trip, idx) => (
                        <motion.div
                          key={trip.id || idx}
                          className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                          whileHover={{ y: -5 }}
                          onClick={() =>
                            navigate(
                              `/user-dashboard/trip-details/${
                                trip.id || idx + 1
                              }`
                            )
                          }
                        >
                          <div className="aspect-[4/3] w-full">
                            <img
                              src={
                                trip.images?.[0] ||
                                "https://via.placeholder.com/400x300?text=No+Image"
                              }
                              alt={trip.destination}
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full inline-block mb-2">
                              <div className="flex items-center text-xs">
                                <MapPin size={10} className="mr-1" />
                                <span>{trip.destination}</span>
                              </div>
                            </div>
                            <h3 className="font-bold text-lg group-hover:text-purple-300 transition-colors">
                              {trip.tripName}
                            </h3>
                            <div className="flex items-center space-x-2 text-white/80 text-xs mt-1">
                              <Calendar size={12} />
                              <span>
                                {new Date(trip.startDate).toLocaleDateString()}{" "}
                                - {new Date(trip.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center p-6 cursor-pointer text-center h-full"
                        onClick={() => navigate("/user-dashboard/user-map")}
                      >
                        <div className="bg-indigo-100 rounded-full p-3 mb-4">
                          <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Discover New Destinations
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Explore amazing places for your next adventure
                        </p>
                        <span className="text-indigo-600 text-sm font-medium">
                          Open Interactive Map
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {/* Trip Selector for Expense Chart */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Wallet className="mr-2 h-5 w-5 text-indigo-500" />
                        Expense Breakdown
                      </h2>
                      <select
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                        value={selectedTrip?.id || ""}
                        onChange={(e) => {
                          const selectedId = parseInt(e.target.value);
                          const trip = trips.find(
                            (t) => t.id === selectedId || t._id === selectedId
                          );
                          if (trip) setSelectedTrip(trip);
                        }}
                      >
                        {trips.map((trip) => (
                          <option
                            key={trip.id || trip._id}
                            value={trip.id || trip._id}
                          >
                            {trip.tripName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4 px-2 py-1.5 bg-indigo-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-indigo-700">
                          Total Trip Budget
                        </span>
                        <span className="text-sm font-semibold text-indigo-700">
                          $
                          {selectedTrip?.totalExpenses?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </div>

                    <div className="h-60">
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
                            {(selectedTrip
                              ? processExpenseData(selectedTrip.expenses)
                              : []
                            ).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                }
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`$${value}`, "Amount"]}
                            contentStyle={{
                              background: "white",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {selectedTrip &&
                        processExpenseData(selectedTrip.expenses).map(
                          (expense, index) => (
                            <div
                              key={expense.name}
                              className="flex items-center p-2 rounded-lg bg-gray-50"
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    EXPENSE_COLORS[
                                      index % EXPENSE_COLORS.length
                                    ],
                                }}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 truncate">
                                  {expense.name}
                                </p>
                                <p className="text-sm font-semibold">
                                  ${expense.value}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  {/* Recent Journal Entries */}
                  <div className="lg:col-span-3 relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.5 }}
                      className="h-[350px] md:h-[375px] border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden relative shadow-xl shadow-purple-900/20"
                    >
                      {canvasVisible ? (
                        <ErrorBoundary
                          fallback={
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-800">
                              <div className="text-center p-6">
                                <motion.div
                                  className="w-16 h-16 mx-auto mb-3 bg-indigo-600/30 rounded-full flex items-center justify-center"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 8,
                                    ease: "linear",
                                  }}
                                >
                                  <span className="text-2xl">✨</span>
                                </motion.div>
                                <h4 className="text-white font-medium">
                                  Interactive Experience
                                </h4>
                                <p className="text-indigo-200 text-sm mt-2">
                                  Explore our virtual adventures
                                </p>
                              </div>
                            </div>
                          }
                        >
                          <div
                            className="w-full h-full"
                            onError={handleCanvasError}
                          >
                            <Canvas
                              shadows
                              camera={{ position: [0, 0, 10], fov: 25 }}
                              className="!absolute inset-0"
                            >
                              <ambientLight intensity={1.5} />
                              <spotLight
                                position={[10, 10, 10]}
                                angle={0.15}
                                penumbra={1}
                              />
                              <directionalLight
                                position={[10, 10, 10]}
                                intensity={1}
                              />
                              <OrbitControls
                                enableZoom={false}
                                maxPolarAngle={Math.PI / 2}
                                autoRotate
                                autoRotateSpeed={0.5}
                              />
                              <Suspense fallback={<CanvasLoader />}>
                                <Girl
                                  position-y={-3}
                                  scale={3}
                                  animationName="victory"
                                />
                                <Environment preset="sunset" />
                              </Suspense>
                            </Canvas>
                          </div>
                        </ErrorBoundary>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-800 to-purple-800">
                          <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-3 bg-pink-500/30 rounded-full flex items-center justify-center">
                              <span
                                role="img"
                                aria-label="star"
                                className="text-2xl"
                              >
                                ⭐
                              </span>
                            </div>
                            <h4 className="text-white font-medium">
                              Voyageur Experience
                            </h4>
                            <p className="text-indigo-200 text-sm mt-2">
                              Discover amazing destinations
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/90 to-transparent p-4 text-center">
                        <motion.p
                          className="text-white text-sm font-medium"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          Interactive Guide
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 bg-white rounded-2xl shadow-md p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-indigo-500" />
                    Future Trips Planning
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
                    onClick={() => navigate("/user-dashboard/itinerary")}
                  >
                    Create Itinerary
                  </motion.button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                      Plan Your Next Adventure
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Let us help you create the perfect itinerary for your next
                      journey. Our advanced planning tools make it easy to
                      organize your trips.
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "Personalized recommendations",
                        "Automated itinerary building",
                        "Budget optimization",
                        "Local experiences",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow hover:shadow-lg transition-all"
                        onClick={() => navigate("/user-dashboard/user-map")}
                      >
                        <Search size={16} />
                        Explore destinations
                      </button>
                      <button
                        className="px-4 py-2.5 border border-indigo-600 text-indigo-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
                        onClick={() => navigate("/user-dashboard/itinerary")}
                      >
                        <Plus size={16} />
                        Create itinerary
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2">
                    <img
                      src="https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2231&q=80"
                      alt="Travel Planning"
                      className="rounded-lg shadow-lg w-full aspect-[4/3] object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "trips" && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="my-6"
            >
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Plane className="mr-3 h-6 w-6 text-indigo-500" />
                    Your Trips
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center gap-2"
                    onClick={() => navigate("/user-dashboard/add-trip")}
                  >
                    <Plus size={16} />
                    Add New Trip
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map((trip, idx) => (
                    <motion.div
                      key={trip.id || idx}
                      whileHover={{ y: -5 }}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-[4/3] relative">
                        <img
                          src={
                            trip.images?.[0] ||
                            "https://via.placeholder.com/400x300?text=No+Image"
                          }
                          alt={trip.destination}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full inline-block mb-2">
                            <div className="flex items-center text-xs text-white">
                              <MapPin size={10} className="mr-1" />
                              <span>{trip.destination}</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-white">
                            {trip.tripName}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} -{" "}
                            {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-indigo-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-indigo-600">Expenses</p>
                            <p className="font-semibold text-indigo-700">
                              ${trip.totalExpenses?.toLocaleString() || "0"}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-purple-600">
                              Journal Entries
                            </p>
                            <p className="font-semibold text-purple-700">
                              {trip.journalEntries?.length || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-indigo-600 font-medium text-sm flex items-center"
                            onClick={() =>
                              navigate(
                                `/user-dashboard/trips/${trip.id || idx + 1}`
                              )
                            }
                          >
                            View Details
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-gray-500 font-medium text-sm flex items-center"
                            onClick={() =>
                              navigate(
                                `/user-dashboard/edit-trip/${
                                  trip.id || idx + 1
                                }`
                              )
                            }
                          >
                            <Edit className="mr-1 w-4 h-4" />
                            Edit
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "expenses" && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="my-6"
            >
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Wallet className="mr-3 h-6 w-6 text-indigo-500" />
                    Expense Analytics
                  </h2>

                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
                    value={selectedTrip?.id || "all"}
                    onChange={(e) => {
                      if (e.target.value === "all") {
                        // Select all trips
                        setSelectedTrip(null);
                      } else {
                        const trip = trips.find(
                          (t) => (t.id || t._id) === parseInt(e.target.value)
                        );
                        if (trip) setSelectedTrip(trip);
                      }
                    }}
                  >
                    <option value="all">All Trips</option>
                    {trips.map((trip) => (
                      <option
                        key={trip.id || trip._id}
                        value={trip.id || trip._id}
                      >
                        {trip.tripName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Pie Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Expense Distribution
                    </h3>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={
                              selectedTrip
                                ? processExpenseData(selectedTrip.expenses)
                                : trips
                                    .flatMap((trip) =>
                                      processExpenseData(trip.expenses)
                                    )
                                    .reduce((acc, item) => {
                                      const existingItem = acc.find(
                                        (i) => i.name === item.name
                                      );
                                      if (existingItem) {
                                        existingItem.value += item.value;
                                      } else {
                                        acc.push({ ...item });
                                      }
                                      return acc;
                                    }, [])
                            }
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {(selectedTrip
                              ? processExpenseData(selectedTrip.expenses)
                              : trips
                                  .flatMap((trip) =>
                                    processExpenseData(trip.expenses)
                                  )
                                  .reduce((acc, item) => {
                                    const existingItem = acc.find(
                                      (i) => i.name === item.name
                                    );
                                    if (existingItem) {
                                      existingItem.value += item.value;
                                    } else {
                                      acc.push({ ...item });
                                    }
                                    return acc;
                                  }, [])
                            ).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                }
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `$${value.toLocaleString()}`,
                              "Amount",
                            ]}
                            contentStyle={{
                              background: "white",
                              borderRadius: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              border: "none",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Expense By Trip
                    </h3>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={trips.map((trip) => ({
                            name: trip.tripName,
                            total: trip.totalExpenses,
                          }))}
                          margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#6B7280" }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `$${value.toLocaleString()}`,
                              "Total Expenses",
                            ]}
                            contentStyle={{
                              background: "white",
                              borderRadius: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              border: "none",
                            }}
                          />
                          <Bar
                            dataKey="total"
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                          >
                            {trips.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Expense Details Table */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-indigo-50">
                    <h3 className="font-semibold text-indigo-700">
                      Detailed Expenses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trip
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Trip
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trips.flatMap((trip) =>
                          processExpenseData(trip.expenses).map(
                            (expense, expenseIdx) => (
                              <tr
                                key={`${trip.id}-${expense.name}-${expenseIdx}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {trip.tripName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {expense.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  ${expense.value.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {(
                                    (expense.value / trip.totalExpenses) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Journal Entry Modal */}
    </div>
  );
};
export default Dashboard;
