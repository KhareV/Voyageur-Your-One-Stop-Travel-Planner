import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import NotFoundPage from "./components/NotFound.jsx";
import HomePage from "./components/HomePageHouse.jsx";
import PropertyDetails from "./components/PropertyPage.jsx";
import TravelBooking from "./travel-components/TravelBooking.jsx";
import PropertyAddForm from "./components/AddPropertyPage.jsx";
import { SignIn, useUser } from "@clerk/clerk-react";
import SignInPage from "./components/SignIn.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TripView from "./components/TripView.jsx";
import axios from "axios";
import TripDetails from "./components/TripDetails.jsx";
import AddTrip from "./AddTrip.jsx";
import Diary from "./components/Journal.jsx";
import AppLayout from "./pages/AppLayout.jsx";
import { CitiesProvider } from "./contexts/CitiesContext.jsx";
import CityList from "../src/components-1/CityList.jsx";
import City from "./components-1/CityItem.jsx";
import CountryList from "../src/components-1/CountryList.jsx";
import Form from "../src/components-1/Form.jsx";
import ChatBot from "react-chatbotify";
import DanteBubbleTabIcon from "./components/ChatBotEver.jsx";
// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return children;
};

const App = () => {
  const [trips, setTrips] = useState([]); // State to store trips data

  // Fetch data from API
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/trips");
        setTrips(response.data); // Store fetched trips data in state
      } catch (error) {
        console.error("Error fetching trips data:", error);
      }
    };

    fetchTrips();
  }, []);

  return (
    <Router>
      <>
        <Navbar />
        <DanteBubbleTabIcon />
        <CitiesProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/" element={<HomePage />} />

            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/travel" element={<TravelBooking />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route
              path="/add-property"
              element={
                <ProtectedRoute>
                  <PropertyAddForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard/trips"
              element={<TripView trips={trips} />}
            />
            <Route path="/user-dashboard/trips/:id" element={<TripDetails />} />
            <Route path="/user-dashboard/add-trip" element={<AddTrip />} />
            <Route path="/user-dashboard/chat" element={<ChatBot />} />

            {/* User Map Routes */}
            <Route path="/user-dashboard/user-map" element={<AppLayout />}>
              <Route
                index
                element={
                  <Navigate replace to="/user-dashboard/user-map/cities" />
                }
              />
              <Route
                path="/user-dashboard/user-map/cities"
                element={<CityList />}
              />
              <Route
                path="/user-dashboard/user-map/cities/:id"
                element={<City />}
              />
              <Route
                path="/user-dashboard/user-map/countries"
                element={<CountryList />}
              />
              <Route path="/user-dashboard/user-map/form" element={<Form />} />
            </Route>

            {/* Catch-all for unknown routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CitiesProvider>
        <Footer />
      </>
    </Router>
  );
};

export default App;
