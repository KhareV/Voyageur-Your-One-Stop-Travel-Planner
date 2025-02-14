import { createContext, useState, useEffect, useContext } from "react";

const CitiesContext = createContext();
/* eslint-disable react/prop-types */
function CitiesProvider({ children, c }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currCity, setCurrCity] = useState({});

  const URL = "http://localhost:9000";
  useEffect(function () {
    async function fetchCities() {
      try {
        setIsLoading(true);
        const res = await fetch(`${URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch {
        console.log("Error loading data!");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    try {
      setIsLoading(true);
      const res = await fetch(`${URL}/cities/${id}`);
      const data = await res.json();
      setCurrCity(data);
    } catch {
      console.log("Error loading data!");
    } finally {
      setIsLoading(false);
    }
  }

  async function createCity(newCity) {
    try {
      setIsLoading(true);
      const res = await fetch(`${URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      //   setCurrCity(data);
      setCities((cities) => [...cities, data]);
    } catch {
      console.log("Error creating city!");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCity(id) {
    try {
      setIsLoading(true);
      await fetch(`${URL}/cities/${id}`, {
        method: "DELETE",
      });
      //   setCurrCity(data);
      setCities((cities) => cities.filter((city) => city.id !== id));
    } catch {
      console.log("Error deleting city!");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <CitiesContext.Provider
      value={{ cities, isLoading, currCity, getCity, createCity, deleteCity }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
