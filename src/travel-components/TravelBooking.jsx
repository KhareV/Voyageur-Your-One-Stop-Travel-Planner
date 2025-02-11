// TravelBooking.jsx
import React, { useState } from "react";
import axios from "axios";

const TravelBooking = () => {
  const [searchData, setSearchData] = useState({
    tripType: "oneWay",
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    class: "economy",
  });

  const [results, setResults] = useState({
    flights: [],
    trains: [],
    buses: [],
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3001/api/search",
        searchData
      );
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="tripType"
              value="oneWay"
              checked={searchData.tripType === "oneWay"}
              onChange={(e) =>
                setSearchData({ ...searchData, tripType: e.target.value })
              }
            />
            <span className="ml-2">One Way</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="tripType"
              value="roundTrip"
              checked={searchData.tripType === "roundTrip"}
              onChange={(e) =>
                setSearchData({ ...searchData, tripType: e.target.value })
              }
            />
            <span className="ml-2">Round Trip</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="From"
            className="w-full p-2 border rounded"
            value={searchData.from}
            onChange={(e) =>
              setSearchData({ ...searchData, from: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="To"
            className="w-full p-2 border rounded"
            value={searchData.to}
            onChange={(e) =>
              setSearchData({ ...searchData, to: e.target.value })
            }
          />
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={searchData.departureDate}
            onChange={(e) =>
              setSearchData({ ...searchData, departureDate: e.target.value })
            }
          />
          {searchData.tripType === "roundTrip" && (
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={searchData.returnDate}
              onChange={(e) =>
                setSearchData({ ...searchData, returnDate: e.target.value })
              }
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            className="w-full p-2 border rounded"
            value={searchData.passengers}
            onChange={(e) =>
              setSearchData({
                ...searchData,
                passengers: Number(e.target.value),
              })
            }
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} Passenger{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <select
            className="w-full p-2 border rounded"
            value={searchData.class}
            onChange={(e) =>
              setSearchData({ ...searchData, class: e.target.value })
            }
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="firstClass">First Class</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Results Tabs */}
      {(results.flights.length > 0 ||
        results.trains.length > 0 ||
        results.buses.length > 0) && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 ${
                activeTab === "flights" ? "border-b-2 border-blue-600" : ""
              }`}
              onClick={() => setActiveTab("flights")}
            >
              Flights
            </button>
            <button
              className={`px-6 py-3 ${
                activeTab === "trains" ? "border-b-2 border-blue-600" : ""
              }`}
              onClick={() => setActiveTab("trains")}
            >
              Trains
            </button>
            <button
              className={`px-6 py-3 ${
                activeTab === "buses" ? "border-b-2 border-blue-600" : ""
              }`}
              onClick={() => setActiveTab("buses")}
            >
              Buses
            </button>
          </div>

          <div className="p-6">
            {activeTab === "flights" && (
              <div className="space-y-4">
                {results.flights.map((flight, index) => (
                  <div
                    key={index}
                    className="border-b pb-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{flight.carrierCode}</p>
                      <p>
                        {flight.departure} - {flight.arrival}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {flight.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{flight.price}</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "trains" && (
              <div className="space-y-4">
                {results.trains.map((train, index) => (
                  <div
                    key={index}
                    className="border-b pb-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{train.name}</p>
                      <p>
                        {train.departure} - {train.arrival}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {train.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{train.price}</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "buses" && (
              <div className="space-y-4">
                {results.buses.map((bus, index) => (
                  <div
                    key={index}
                    className="border-b pb-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{bus.operator}</p>
                      <p>
                        {bus.departure} - {bus.arrival}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {bus.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{bus.price}</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelBooking;
