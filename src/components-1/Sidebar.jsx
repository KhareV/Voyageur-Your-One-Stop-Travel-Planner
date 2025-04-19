import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppNav from "./AppNav";
import Logo from "./Logo";
import styles from "./Sidebar.module.css";

function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCity(null);
  };

  return (
    <div className={styles.sidebar}>
      <Logo />
      <AppNav onCityClick={handleCityClick} />
      <Outlet /> {/* Added to display sub-routes */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedCity?.name}</h2>
            <div className={styles.details}>
              <p>
                <strong>When did you go to {selectedCity?.name}?</strong>{" "}
                {selectedCity?.visitDate}
              </p>
              <p>
                <strong>Notes about your trip:</strong> {selectedCity?.notes}
              </p>
            </div>
            <button onClick={handleCloseModal} className={styles.closeButton}>
              ← Back
            </button>
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        <p>&copy; Copyright {new Date().getFullYear()} WorldWise Inc.</p>
      </footer>
    </div>
  );
}

export default Sidebar;
