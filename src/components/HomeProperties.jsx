import { useState } from "react";
import PropertyCard from "./PropertyCard";
import properties from "../../properties.json";

const HomeProperties = ({ selectedFilters }) => {
  const [visibleCount, setVisibleCount] = useState(5); // Start with 5 properties

  const loadMoreProperties = () => {
    setVisibleCount((prev) => prev + 5); // Load 5 more properties
  };

  // Filter properties based on selected filters
  const filteredProperties = properties.filter((property) => {
    // Check if all selected filters are included in the property amenities
    if (selectedFilters.length === 0) return true; // If no filters are selected, show all properties

    return selectedFilters.every((filter) =>
      property.amenities.includes(filter)
    );
  });

  return (
    <>
      <section className="px-4 py-6">
        <div className="container-xl lg:container m-auto">
          <h2 className="text-3xl font-bold text-red-500 mb-6 text-center">
            Recent Properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Only display properties that are included in the filtered list */}
            {filteredProperties.slice(0, visibleCount).map((property) => (
              <div
                key={property._id}
                className="transition-opacity duration-500 opacity-0 animate-fade-in"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="m-auto max-w-lg my-10 px-6 text-center">
        {visibleCount < filteredProperties.length && (
          <button
            onClick={loadMoreProperties}
            className="bg-red-500 text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700 transition-transform duration-300 hover:scale-105"
          >
            Load More Properties
          </button>
        )}
      </section>
    </>
  );
};

export default HomeProperties;
