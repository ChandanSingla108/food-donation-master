import React, { useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user ? user.name : "");
  const [phone, setPhone] = useState(user ? (user.phone || user.number || "") : "");
  const [email, setEmail] = useState(user ? user.email : "");

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-message">
          User not logged in. Please <a href="/login">Login</a>
        </p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setName(user.name);
    setPhone(user.phone || user.number || "");
    setEmail(user.email);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put("http://localhost:3000/update", {
        id: user._id,
        name,
        number: phone,
        phone: phone,
        email,
      });

      const updatedUser = {
        ...user,
        name,
        number: phone,
        phone: phone,
        email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="wrapper">
      <div className="profile">
        <div className="profile_img_info">
          <div className="img"></div>
          <div className="info">
            {!editing ? (
              <>
                <p className="name">{user.name}</p>
                <p className="place">
                  <button className="logout" onClick={handleLogout}>
                    Logout
                  </button>
                </p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
                <button onClick={handleSaveChanges}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            )}
          </div>
        </div>
        <div className="profile_skills">
          <div className="skills">
            <p>User Info</p>
            {!editing ? (
              <ul>
                <li>
                  <span className="icon">
                    <MdEmail />
                  </span>
                  <span className="title"> {user.email}</span>
                </li>
                <li>
                  <span className="icon">
                    <BsFillTelephoneFill />
                  </span>
                  <span className="title"> {phone || "Not provided"}</span>
                </li>
              </ul>
            ) : null}
          </div>
          <div className="tags_wrap">
            {!editing ? (
              <span className="tag" onClick={handleEditProfile}>
                Edit Profile
              </span>
            ) : null}
            <span className="tag">Change Username</span>
            <span className="tag">Change Password</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
