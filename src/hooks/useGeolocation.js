import { useState } from "react";

export function useGeolocation(defaultPosition = null) {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [error, setError] = useState(null);

  function getLocation() {
    console.log("getPosition called"); // Debugging log

    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Geolocation success:", pos); // Debugging log
        setTimeout(() => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          console.log(
            "Position updated:",
            pos.coords.latitude,
            pos.coords.longitude
          ); // Debugging log
          setIsLoading(false);
        }, 1000); // 1-second delay
      },
      (error) => {
        console.error("Geolocation error:", error.message); // Debugging log (more detailed)
        setError(error.message);
        setIsLoading(false);
      }
    );
  }
  return { position, isLoading, error, getLocation };
}
