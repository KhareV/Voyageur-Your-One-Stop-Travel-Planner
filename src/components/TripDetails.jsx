import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
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
  ChevronLeft,
  Clock,
  User,
  Palmtree,
  Utensils,
  Hotel,
  Bus,
  Heart,
  Image,
  X,
  TrendingUp,
  DollarSign,
  TicketCheck,
  Coffee,
  ArrowLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const heroRef = useRef(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPos = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollPos * 0.4}px)`;
        heroRef.current.style.opacity = 1 - scrollPos * 0.002;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/trips`);
        const data = await response.json();

        // Simulate loading for better UX
        setTimeout(() => {
          setTrip(data[id - 1]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching trip details:", error);
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

  // Enhanced color palette
  const EXPENSE_COLORS = [
    "#9333EA", // Purple
    "#3B82F6", // Blue
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#6366F1", // Indigo
  ];

  const dailySpendingData = [
    { day: "Day 1", amount: 120, date: "Mar 10" },
    { day: "Day 2", amount: 250, date: "Mar 11" },
    { day: "Day 3", amount: 180, date: "Mar 12" },
    { day: "Day 4", amount: 300, date: "Mar 13" },
    { day: "Day 5", amount: 200, date: "Mar 14" },
  ];

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Calculate trip duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch (e) {
      return "";
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-700 font-medium">{`${label}`}</p>
          <p className="text-indigo-600 font-bold">${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-20 h-20 rounded-full border-t-4 border-l-4 border-indigo-600"
          ></motion.div>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <Plane className="text-indigo-600 w-8 h-8" />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-indigo-600 font-medium"
        >
          Loading your adventure...
        </motion.p>
      </div>
    );
  }

  // Trip not found state
  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-pink-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [-5, 5, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="mb-6 inline-block"
          >
            <Navigation className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Trip Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't locate the adventure you're looking for.
          </p>
          <Link
            to="/user-dashboard/trips"
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to All Trips
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${trip.images[0] || ""})`,
            backgroundPosition: "center",
            zIndex: -10,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              to="/user-dashboard/trips"
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to all trips</span>
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4">
              {trip.tripName}
            </h1>

            <div className="flex flex-wrap items-center text-white/90 gap-x-6 gap-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-pink-400" />
                <span className="font-medium">{trip.destination}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                <span>
                  {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                <span>{calculateDuration(trip.startDate, trip.endDate)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 bg-white shadow-md z-30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-2 py-4">
            <TabButton
              icon={<Globe className="w-4 h-4" />}
              label="Overview"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              icon={<Wallet className="w-4 h-4" />}
              label="Expenses"
              active={activeTab === "expenses"}
              onClick={() => setActiveTab("expenses")}
            />
            <TabButton
              icon={<Activity className="w-4 h-4" />}
              label="Activities"
              active={activeTab === "activities"}
              onClick={() => setActiveTab("activities")}
            />
            <TabButton
              icon={<Camera className="w-4 h-4" />}
              label="Gallery"
              active={activeTab === "gallery"}
              onClick={() => setActiveTab("gallery")}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {/* Trip Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
                title="Total Budget"
                value={`$${trip.totalExpenses.toLocaleString()}`}
                subtitle="Spent on this adventure"
                color="bg-gradient-to-br from-emerald-50 to-teal-50"
                iconBg="bg-emerald-100"
              />

              <SummaryCard
                icon={<TicketCheck className="w-6 h-6 text-violet-500" />}
                title="Activities"
                value={trip.activities.length}
                subtitle="Experiences enjoyed"
                color="bg-gradient-to-br from-violet-50 to-purple-50"
                iconBg="bg-violet-100"
              />

              <SummaryCard
                icon={<Image className="w-6 h-6 text-rose-500" />}
                title="Photos"
                value={trip.images.length}
                subtitle="Memories captured"
                color="bg-gradient-to-br from-rose-50 to-pink-50"
                iconBg="bg-rose-100"
              />
            </div>

            {/* Quick Stats & Spending Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-indigo-500" />
                    Expense Breakdown
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total: ${trip.totalExpenses.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={processExpenseData(trip.expenses)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {processExpenseData(trip.expenses).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                }
                              />
                            )
                          )}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="md:w-1/2 flex flex-col justify-center">
                    {processExpenseData(trip.expenses).map((entry, index) => (
                      <div
                        key={`legend-${index}`}
                        className="flex items-center mb-3 last:mb-0"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              EXPENSE_COLORS[index % EXPENSE_COLORS.length],
                          }}
                        ></div>
                        <div className="flex justify-between w-full">
                          <span className="text-sm text-gray-600 capitalize">
                            {entry.name}
                          </span>
                          <span className="text-sm font-medium">
                            ${entry.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daily Spending */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Daily Spending
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailySpendingData}>
                    <defs>
                      <linearGradient
                        id="colorSpending"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366F1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366F1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366F1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSpending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activities & Photos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Activities */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-violet-500" />
                    Activities
                  </h2>
                  <button
                    onClick={() => setActiveTab("activities")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="space-y-3">
                  {trip.activities.slice(0, 4).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100"
                    >
                      <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                        <Activity className="w-4 h-4 text-indigo-500" />
                      </div>
                      <p className="text-gray-700">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-rose-500" />
                    Photos
                  </h2>
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    View gallery
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {trip.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden aspect-square group cursor-pointer shadow-md"
                      onClick={() => {
                        setSelectedImage(image);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Trip memory ${index + 1}`}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <Camera className="text-white w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <Wallet className="h-6 w-6 mr-2 text-indigo-500" />
                Expense Summary
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Expense Distribution
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={processExpenseData(trip.expenses)}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={3}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{
                            stroke: "#555",
                            strokeWidth: 1,
                            strokeOpacity: 0.5,
                          }}
                        >
                          {processExpenseData(trip.expenses).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  EXPENSE_COLORS[index % EXPENSE_COLORS.length]
                                }
                              />
                            )
                          )}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Spending */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Daily Spending
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailySpendingData}>
                        <defs>
                          <linearGradient
                            id="colorExpenses"
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
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#8884d8"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorExpenses)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Expense Details */}
              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Expense Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processExpenseData(trip.expenses).map(
                        (expense, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-3"
                                  style={{
                                    backgroundColor:
                                      EXPENSE_COLORS[
                                        index % EXPENSE_COLORS.length
                                      ],
                                  }}
                                ></div>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {expense.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${expense.value.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${
                                        (expense.value / trip.totalExpenses) *
                                        100
                                      }%`,
                                      backgroundColor:
                                        EXPENSE_COLORS[
                                          index % EXPENSE_COLORS.length
                                        ],
                                    }}
                                  ></div>
                                </div>
                                <span className="ml-3 text-sm text-gray-500">
                                  {(
                                    (expense.value / trip.totalExpenses) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${trip.totalExpenses.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          100%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Budget Tips
              </h2>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  Based on your spending patterns, accommodations and dining
                  were your highest expenses. Consider booking accommodations
                  with kitchen facilities for your next trip to save on dining
                  costs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                  <h3 className="font-medium text-emerald-800 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Money-saving tip
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Consider traveling during shoulder season for lower prices
                    and fewer crowds.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                    <Wallet className="w-4 h-4 mr-1" />
                    Budget allocation
                  </h3>
                  <p className="text-sm text-amber-700">
                    For similar destinations, budget about 40% for
                    accommodation, 30% for activities, 20% for food, and 10% for
                    transportation.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-indigo-500" />
                Activities & Experiences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trip.activities.map((activity, index) => {
                  // Choose an icon based on activity keywords
                  let ActivityIcon = Target;
                  if (
                    activity.toLowerCase().includes("food") ||
                    activity.toLowerCase().includes("dinner") ||
                    activity.toLowerCase().includes("lunch")
                  ) {
                    ActivityIcon = Utensils;
                  } else if (
                    activity.toLowerCase().includes("beach") ||
                    activity.toLowerCase().includes("swimming") ||
                    activity.toLowerCase().includes("park")
                  ) {
                    ActivityIcon = Palmtree;
                  } else if (
                    activity.toLowerCase().includes("hotel") ||
                    activity.toLowerCase().includes("resort")
                  ) {
                    ActivityIcon = Hotel;
                  } else if (
                    activity.toLowerCase().includes("tour") ||
                    activity.toLowerCase().includes("bus") ||
                    activity.toLowerCase().includes("travel")
                  ) {
                    ActivityIcon = Bus;
                  } else if (
                    activity.toLowerCase().includes("coffee") ||
                    activity.toLowerCase().includes("cafe")
                  ) {
                    ActivityIcon = Coffee;
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition duration-300"
                    >
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <ActivityIcon className="w-5 h-5 text-indigo-500" />
                          </div>
                          <h3 className="ml-3 font-medium text-gray-800">
                            Activity {index + 1}
                          </h3>
                        </div>
                        <p className="text-gray-700">{activity}</p>

                        <div className="mt-4 flex justify-end">
                          <button className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                            <Heart className="w-4 h-4 mr-1" />
                            Favorite
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-rose-500" />
                Popular Activities in {trip.destination}
              </h2>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  Based on your interests, here are some suggested activities
                  for your next visit to {trip.destination}:
                </p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-start">
                    <div className="bg-pink-100 p-1 rounded-full mt-0.5">
                      <Target className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="ml-3 text-gray-700">
                      Visit the local museums and historical sites
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <Target className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="ml-3 text-gray-700">
                      Try authentic local cuisine at family-owned restaurants
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 p-1 rounded-full mt-0.5">
                      <Target className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="ml-3 text-gray-700">
                      Explore natural parks and hiking trails
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                <Camera className="h-6 w-6 mr-2 text-rose-500" />
                Trip Gallery
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trip.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-square rounded-lg overflow-hidden shadow-md group relative cursor-pointer"
                    onClick={() => {
                      setSelectedImage(image);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`Trip memory ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-medium">
                        Memory #{index + 1}
                      </p>
                      <p className="text-white/80 text-sm">
                        {trip.destination} • {formatDate(trip.startDate)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0, top: 10 }}
              animate={{ opacity: 1, top: 20 }}
              exit={{ opacity: 0, top: 10 }}
              className="absolute top-5 right-5 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Trip memory"
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Tab Button Component
const TabButton = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
        active
          ? "bg-indigo-100 text-indigo-800 shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, title, value, subtitle, color, iconBg }) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`${color} rounded-2xl p-6 shadow-lg border border-gray-100`}
    >
      <div
        className={`${iconBg} w-14 h-14 rounded-full flex items-center justify-center mb-5`}
      >
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </motion.div>
  );
};

export default TripDetails;
