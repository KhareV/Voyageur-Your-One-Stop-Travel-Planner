import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomeProperties from "./components/HomeProperties.jsx";
import Footer from "./components/Footer.jsx";
import NotFoundPage from "./components/NotFound.jsx";
import HomePage from "./components/HomePage.jsx";
import PropertyDetails from "./components/PropertyPage.jsx"; // Import the PropertyDetails component

const App = () => {
  return (
    <Router>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />{" "}
          {/* Add this route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </>
    </Router>
  );
};

export default App;
