import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, Calendar, Wallet, Activity } from "lucide-react";

const TripView = ({ trips }) => {
  const safeTrips = trips || [];

  return (
    <div className="grid...">
      <AnimatePresence>
        {safeTrips.map((trip) => (
          <TripViewCard
            key={trip._id}
            id={trip.id}
            tripName={trip.tripName}
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
            budget={trip.totalExpenses}
            expenses={trip.expenses}
            thumbnail={trip.images?.[0]}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TripViewCard = ({
  id,
  tripName,
  destination,
  startDate,
  endDate,
  budget,
  expenses,
  thumbnail,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-2xl bg-white shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={thumbnail}
          alt={destination}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <motion.div
        whileHover={{ translateY: -5 }}
        className="p-6 bg-gradient-to-br from-purple-100 to-blue-50"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.h3
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            whileHover={{ x: 5 }}
          >
            {tripName}
          </motion.h3>
          <a href={`/user-dashboard/trips/${id}`}>
            <Globe className="text-purple-600" />
          </a>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-pink-600" />
            <span className="font-medium">{destination}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" />
            <span>
              {new Date(startDate).toLocaleDateString()} -
              {new Date(endDate).toLocaleDateString()}
            </span>
          </div>

          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Wallet className="text-green-600" />
            <span className="font-semibold">Budget: ${budget}</span>
          </motion.div>

          <motion.div
            className="mt-4 pt-4 border-t border-purple-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="font-semibold mb-2 text-purple-900">
              Expenses Breakdown
            </h4>
            <div className="flex flex-wrap gap-2">
              {expenses &&
                Object.entries(expenses).map(([category, amount]) => (
                  <motion.div
                    key={category}
                    className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-900 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    {category}: ${amount}
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 animate-shine bg-[linear-gradient(110deg,rgba(255,255,255,0.2),45%,rgba(168,85,247,0.15),55%,rgba(255,255,255,0.2))] bg-[length:200%_100%]" />
      </div>
    </motion.div>
  );
};
export default TripView;
