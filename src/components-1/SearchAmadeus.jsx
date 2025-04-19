import { useState } from "react";
import {
  searchFlights,
  searchHotels,
  searchBusStations,
} from "./amadeusService";

function SearchAmadeus() {
  const [type, setType] = useState("flights");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    let data = [];
    if (type === "flights") {
      data = await searchFlights(origin, destination, date);
    } else if (type === "hotels") {
      data = await searchHotels(city);
    } else if (type === "buses") {
      data = await searchBusStations(city);
    }
    setResults(data);
  };

  return (
    <div>
      <div>
        <button onClick={() => setType("flights")}>Flights</button>
        <button onClick={() => setType("hotels")}>Hotels</button>
        <button onClick={() => setType("buses")}>Buses</button>
      </div>

      {type === "flights" && (
        <div>
          <input
            type="text"
            placeholder="Origin (e.g., JFK)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            type="text"
            placeholder="Destination (e.g., LHR)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      )}

      {type !== "flights" && (
        <input
          type="text"
          placeholder="City Code (e.g., NYC)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      )}

      <button onClick={handleSearch}>Search</button>

      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default SearchAmadeus;
