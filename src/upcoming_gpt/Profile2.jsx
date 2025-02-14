import React from "react";

const FullPageVoyageurProfile = () => {
  return (
    <>
      <style>
        {`
          /* Full-page layout */
          .profile-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // height: 100vh;
            width: 100%;
            background: #f8f9fa;
            padding: 40px;
          }

          .profile-card {
            width: 80%;
            max-width: 1000px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            padding: 30px;
            gap: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .profile-card:hover {
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          /* Profile Image */
          .profile-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 4px solid red;
          }

          /* Profile Details */
          .profile-details {
            flex: 1;
          }

          .profile-name {
            font-size: 26px;
            font-weight: bold;
            color: red;
            margin-bottom: 5px;
          }

          .profile-email,
          .profile-location {
            font-size: 16px;
            color: #555;
            margin-bottom: 5px;
          }

          .profile-bio {
            font-size: 16px;
            color: #333;
            margin-top: 10px;
          }

          /* Edit Profile Button */
          .edit-profile-btn {
            background: red;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
            transition: background 0.3s ease;
          }

          .edit-profile-btn:hover {
            background: darkred;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .profile-card {
              flex-direction: column;
              text-align: center;
            }
          }
        `}
      </style>

      <div className="profile-container">
        <div className="profile-card">
          <img
            className="profile-img"
            src="https://i.pravatar.cc/150"
            alt="Voyageur Profile"
          />
          <div className="profile-details">
            <h2 className="profile-name">Alex Johnson</h2>
            <p className="profile-email">alex.johnson@example.com</p>
            <p className="profile-location">📍 Paris, France</p>
            <p className="profile-bio">
              Passionate traveler exploring the world, one country at a time. 🌍✈️  
              Love discovering new cultures, foods, and adventures!
            </p>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullPageVoyageurProfile;
