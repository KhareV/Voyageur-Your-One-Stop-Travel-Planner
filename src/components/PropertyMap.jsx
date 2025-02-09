import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyMap = ({ location }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCoordinates = async () => {
      if (!location) {
        setError("No location provided");
        setLoading(false);
        return;
      }

      try {
        const address = `${location.street}, ${location.city}, ${location.state} ${location.zipcode}`;
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Error fetching location data");
        console.error("Geocoding error:", err);
      } finally {
        setLoading(false);
      }
    };

    getCoordinates();
  }, [location]);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">{error || "Unable to display map"}</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={coordinates}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates}>
        <Popup>
          {location.street}
          <br />
          {location.city}, {location.state} {location.zipcode}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default PropertyMap;
