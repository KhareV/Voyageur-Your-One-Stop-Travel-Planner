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
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";

// City Modal Component
const CityModal = ({ city, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.cityEmoji}>{city?.emoji}</span>
          <h2>{city?.cityName}</h2>
        </div>

        <div className={styles.modalDetails}>
          <div>
            <p className={styles.label}>When did you go to {city?.cityName}?</p>
            <p>{new Date(city?.date).toLocaleDateString()}</p>
          </div>

          <div>
            <p className={styles.label}>Notes about your trip:</p>
            <p>{city?.notes}</p>
          </div>

          <div>
            <p className={styles.label}>Location:</p>
            <p>
              Lat: {city?.position?.lat}, Lng: {city?.position?.lng}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate("/app/cities");
          }}
          className={styles.backButton}
        >
          ← Back to Cities
        </button>
      </div>
    </div>
  );
};

// Map Position Component
function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

// Click Detection Component
function DetectClick() {
  const navigate = useNavigate();
  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
  return null;
}

// Main Map Component
function Map() {
  const navigate = useNavigate();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const [selectedCity, setSelectedCity] = useState(null);
  const { cities } = useCities();
  const [mapLat, mapLng] = useUrlPosition();

  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getLocation: getPosition,
    error: geolocationError,
  } = useGeolocation();

  // Handle URL position updates
  useEffect(
    function () {
      if (mapLat && mapLng) {
        setMapPosition([parseFloat(mapLat), parseFloat(mapLng)]);
      }
    },
    [mapLat, mapLng]
  );

  // Handle geolocation updates
  useEffect(
    function () {
      if (geolocationPosition) {
        setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
      }
    },
    [geolocationPosition]
  );

  // Handle geolocation errors
  useEffect(() => {
    if (geolocationError) {
      alert(
        `Geolocation error: ${geolocationError}. Please check browser permissions or try again.`
      );
    }
  }, [geolocationError]);

  const handleUsePositionClick = () => {
    getPosition();
  };

  const handleMarkerClick = (city) => {
    setSelectedCity(city);
  };

  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition && (
        <Button type="position" onClick={handleUsePositionClick}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
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
            eventHandlers={{
              click: () => handleMarkerClick(city),
            }}
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

      {selectedCity && (
        <CityModal city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  );
}

export default Map;
