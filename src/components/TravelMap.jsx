import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// The TravelMap component uses Leaflet to display routes with pins and lines
const TravelMap = ({ option, height = "400px" }) => {
  const mapId = `map-${option.id}`;

  useEffect(() => {
    // Initialize map after component mounts
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) return;

    // Clean up any existing map
    mapContainer._leaflet && mapContainer._leaflet.remove();

    // If we don't have route data, don't render the map
    if (
      !option.routePath ||
      !Array.isArray(option.routePath) ||
      option.routePath.length < 2
    ) {
      mapContainer.innerHTML =
        '<div class="p-4 text-center text-gray-500">Route information unavailable</div>';
      return;
    }

    // Initialize map
    const map = L.map(mapId).setView([0, 0], 2);
    mapContainer._leaflet = map;

    // Add tile layer (map background)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create origin marker with custom icon
    const originMarker = L.marker(option.routePath[0], {
      icon: createCustomIcon("green"),
    }).addTo(map);

    // Create destination marker with custom icon
    const destinationMarker = L.marker(
      option.routePath[option.routePath.length - 1],
      {
        icon: createCustomIcon("red"),
      }
    ).addTo(map);

    // Add popups to markers
    originMarker.bindPopup(`<b>Origin:</b> ${option.origin}`);
    destinationMarker.bindPopup(`<b>Destination:</b> ${option.destination}`);

    // Add waypoint markers if any
    if (option.waypoints && option.waypoints.length) {
      option.waypoints.forEach((waypoint, index) => {
        if (waypoint.coordinates) {
          const waypointMarker = L.marker(waypoint.coordinates, {
            icon: createCustomIcon("blue"),
          }).addTo(map);

          waypointMarker.bindPopup(`<b>Stop ${index + 1}</b>`);
        }
      });
    }

    // Draw path line with appropriate color
    const pathColor =
      option.transportType === "flights"
        ? "#4F46E5"
        : option.transportType === "trains"
        ? "#10B981"
        : "#0284C7";

    const pathLine = L.polyline(option.routePath, {
      color: pathColor,
      weight: 4,
      opacity: 0.7,
    }).addTo(map);

    // Add tooltip to line showing distance
    pathLine.bindTooltip(`Distance: ${Math.round(option.distance || 0)} km`);

    // Fit map to show the entire route
    map.fitBounds(pathLine.getBounds(), { padding: [30, 30] });

    // Clean up on component unmount
    return () => {
      map && map.remove();
      mapContainer._leaflet = null;
    };
  }, [option, mapId]);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <div id={mapId} style={{ height, width: "100%" }}></div>
      <div className="bg-white p-3 border-t border-gray-100">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Distance:</span>{" "}
          {Math.round(option.distance || 0)} km
          <span className="ml-4 font-medium">Duration:</span>{" "}
          {Math.floor(option.duration / 60)}h {option.duration % 60}m
        </p>
      </div>
    </div>
  );
};

// Helper function to create custom markers
function createCustomIcon(color) {
  return new L.Icon({
    iconUrl: `https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export default TravelMap;
