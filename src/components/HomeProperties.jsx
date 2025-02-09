import { useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";

const HomeProperties = ({ selectedFilters = [] }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 properties initially
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/properties"); // API endpoint
        const data = await response.json();
        setAllProperties(data); // Store all properties
        setFilteredProperties(data); // Initially set filtered data
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!Array.isArray(selectedFilters) || selectedFilters.length === 0) {
      setFilteredProperties(allProperties);
      return;
    }

    const filtered = allProperties.filter((property) =>
      selectedFilters.every((filter) => property.amenities.includes(filter))
    );

    setFilteredProperties(filtered);
  }, [selectedFilters, allProperties]);

  const loadMoreProperties = () => {
    setVisibleCount((prev) => prev + 5); // Load 5 more properties
  };

  return (
    <>
      <section className="px-4 py-6">
        <div className="container-xl lg:container m-auto">
          <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
            Recent Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProperties.slice(0, visibleCount).map((property) => (
              <div
                key={property._id}
                className="transition-opacity duration-500 opacity-100"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {visibleCount < filteredProperties.length && (
        <section className="m-auto max-w-lg my-10 px-6 text-center">
          <button
            onClick={loadMoreProperties}
            className="bg-red-500 text-white py-4 px-6 rounded-xl hover:bg-gray-700 transition-transform duration-300 hover:scale-105"
          >
            Load More Properties
          </button>
        </section>
      )}
    </>
  );
};

export default HomeProperties;
