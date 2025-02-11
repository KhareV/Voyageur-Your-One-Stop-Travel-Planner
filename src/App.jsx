import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomeProperties from "./components/HomeProperties.jsx";
import Footer from "./components/Footer.jsx";
import NotFoundPage from "./components/NotFound.jsx";
import HomePage from "./components/HomePageHouse.jsx";
import PropertyDetails from "./components/PropertyPage.jsx"; // Import the PropertyDetails component
import TravelBooking from "./travel-components/TravelBooking.jsx";
import PropertyAddForm from "./components/AddPropertyPage.jsx";
import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import SignInPage from "./components/SignIn.jsx";
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
  return (
    <Router>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />{" "}
          {/* Add this route */}
          <Route path="/travel" element={<TravelBooking />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route
            path="/add-property"
            element={
              <ProtectedRoute>
                <PropertyAddForm />
              </ProtectedRoute>
            }
          />{" "}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </>
    </Router>
  );
};

export default App;
