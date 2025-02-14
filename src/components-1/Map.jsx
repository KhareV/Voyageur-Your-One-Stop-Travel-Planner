import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { useCities } from "../../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";

function Map() {
  // const navigate = useNavigate(); // You had this commented out, but might need it later
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const { cities } = useCities();
  const [mapLat, mapLng] = useUrlPosition();

  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getLocation: getPosition, // Renamed to getLocation for clarity, and to match useGeolocation hook
    error: geolocationError, // Capture error from useGeolocation
  } = useGeolocation();

  useEffect(
    function () {
      if (mapLat && mapLng) {
        console.log("URL params detected, setting mapPosition from URL");
        setMapPosition([parseFloat(mapLat), parseFloat(mapLng)]); // Parse to numbers
      }
    },
    [mapLat, mapLng]
  );

  useEffect(
    function () {
      if (geolocationPosition) {
        console.log("Geolocation position received:", geolocationPosition);
        setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
      }
    },
    [geolocationPosition]
  );

  useEffect(() => {
    if (geolocationError) {
      console.error("Geolocation Error:", geolocationError);
      alert(
        `Geolocation error: ${geolocationError}. Please check browser permissions or try again.`
      ); // User feedback
    }
  }, [geolocationError]);

  const handleUsePositionClick = () => {
    console.log("Button 'Use your position' clicked");
    getPosition(); // Call the getLocation function from useGeolocation
  };

  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition ? (
        <Button type="position" onClick={handleUsePositionClick}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      ) : (
        ""
      )}
      <MapContainer
        center={mapPosition}
        zoom={7}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji}</span>
              <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <DetectClick />
        <ChangeCenter position={mapPosition} />
      </MapContainer>
    </div>
  );
} /* eslint-disable react/prop-types */

function ChangeCenter({ position }) {
  const map = useMap();
  console.log("ChangeCenter component - Setting map view to:", position);
  map.setView(position);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvents({
    click: (e) => {
      console.log("Map clicked at:", e.latlng);
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
