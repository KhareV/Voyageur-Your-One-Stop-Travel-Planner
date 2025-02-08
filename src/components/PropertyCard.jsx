import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMoneyBill,
  FaMapMarker,
} from "react-icons/fa";

const PropertyCard = ({ property }) => {
  const getRateDisplay = () => {
    const { rates } = property;
    if (rates.monthly) {
      return `$${rates.monthly.toLocaleString()}/mo`;
    }
    let priceString = "";
    if (rates.weekly) {
      priceString += `$${rates.weekly.toLocaleString()}/wk`;
    }
    if (rates.nightly) {
      priceString += priceString
        ? ` | $${rates.nightly.toLocaleString()}/night`
        : `$${rates.nightly.toLocaleString()}/night`;
    }
    return priceString;
  };

  return (
    <div className="rounded-xl shadow-lg bg-white overflow-hidden relative transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        <img
          src={`/properties/${property.images[0]}`}
          alt={property.name}
          className="w-full h-64 object-cover rounded-t-xl transition-opacity duration-300 hover:opacity-90"
        />
        <div className="absolute top-3 right-3 bg-white px-4 py-2 rounded-lg text-red-500 font-bold shadow-md text-sm transition-all duration-300 hover:bg-red-500 hover:text-white">
          {getRateDisplay()}
        </div>
      </div>

      <div className="p-5">
        <div className="text-left md:text-center lg:text-left mb-4">
          <div className="text-gray-500 uppercase text-sm">{property.type}</div>
          <h3 className="text-xl font-semibold text-gray-900">
            {property.name}
          </h3>
        </div>

        <div className="flex justify-around text-gray-700 text-sm mb-4">
          <p className="flex items-center gap-2">
            <FaBed className="text-red-500" />
            {property.beds} <span className="hidden md:inline">Beds</span>
          </p>
          <p className="flex items-center gap-2">
            <FaBath className="text-blue-500" />
            {property.baths} <span className="hidden md:inline">Baths</span>
          </p>
          <p className="flex items-center gap-2">
            <FaRulerCombined className="text-green-500" />
            {property.square_feet}{" "}
            <span className="hidden md:inline">sqft</span>
          </p>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center gap-2 text-orange-700">
            <FaMapMarker />
            <span>
              {property.location.city}, {property.location.state}
            </span>
          </div>

          <a
            href={`/properties/${property._id}`}
            className="mt-3 lg:mt-0 bg-red-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
