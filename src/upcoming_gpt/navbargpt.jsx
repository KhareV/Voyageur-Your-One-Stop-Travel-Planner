import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>
        {`
          /* Navbar Container */
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            background-color: red;
            color: white;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }

          /* Logo */
          .logo {
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
          }

          .logo-icon {
            margin-right: 10px;
            font-size: 28px;
          }

          /* Navbar Links */
          .nav-links {
            display: flex;
            gap: 20px;
          }

          .nav-links a {
            color: white;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            transition: color 0.3s ease;
          }

          .nav-links a:hover {
            color: #ffd700; /* Gold hover effect */
          }

          /* Mobile Menu */
          .hamburger {
            display: none;
            font-size: 28px;
            cursor: pointer;
          }

          /* Mobile Menu Styles */
          @media (max-width: 768px) {
            .nav-links {
              display: ${isOpen ? "flex" : "none"};
              flex-direction: column;
              background: red;
              position: absolute;
              top: 60px;
              left: 0;
              width: 100%;
              padding: 20px;
              text-align: center;
            }

            .hamburger {
              display: block;
            }
          }
        `}
      </style>

      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">🌍</span> Voyageur
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#profile">Profile</a>
          <a href="#trips">My Trips</a>
          <a href="#settings">Settings</a>
        </div>
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>☰</div>
      </nav>
    </>
  );
};

export default Navbar;
