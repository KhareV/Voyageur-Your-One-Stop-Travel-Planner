import React from "react";

const VoyageurProfile = () => {
  return (
    <>
      <style>
        {`
          /* Profile Card Container */
          .profile-card {
            width: 350px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            padding: 20px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .profile-card:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          /* Profile Image */
          .profile-img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid red;
            margin-bottom: 10px;
          }

          /* Primary Red Theme */
          .profile-name {
            font-size: 22px;
            font-weight: bold;
            color: red;
            margin-bottom: 5px;
          }

          .profile-email,
          .profile-location {
            font-size: 14px;
            color: #555;
            margin-bottom: 5px;
          }

          .profile-bio {
            font-size: 14px;
            color: #333;
            margin-top: 10px;
          }

          /* Action Button */
          .edit-profile-btn {
            background: red;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
            transition: background 0.3s ease;
          }

          .edit-profile-btn:hover {
            background: darkred;
          }
        `}
      </style>

      <div className="profile-card">
        <img
          className="profile-img"
          src="https://i.pravatar.cc/100"
          alt="Voyageur Profile"
        />
        <h2 className="profile-name">Alex Johnson</h2>
        <p className="profile-email">alex.johnson@example.com</p>
        <p className="profile-location">📍 Paris, France</p>
        <p className="profile-bio">
          Passionate traveler exploring the world, one country at a time. 🌍✈️
        </p>
        <button className="edit-profile-btn">Edit Profile</button>
      </div>
    </>
  );
};

export default VoyageurProfile;
