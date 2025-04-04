import React, { useState } from "react";
import axios from "axios";
import "./FoodDonation.css";

function FoodDonation() {
  const [foodName, setFoodName] = useState("");
  const [foodTag, setFoodTag] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [address, setAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // ✅ State for success message

  const email = localStorage.getItem("email");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      foodName,
      foodTag,
      quantity,
      expiryDate,
      address,
      email,
    };

    try {
      const response = await axios.post("http://localhost:3000/fooddonation", {
        formData,
      });

      console.log(response.data);

      // ✅ Show success message dynamically
      setSuccessMessage(`Thanks ${email} for donating ${foodName}! 🎉`);

      // ✅ Clear form fields after successful submission
      setFoodName("");
      setFoodTag("");
      setQuantity("");
      setExpiryDate("");
      setAddress("");

      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="foodDonation_container">
      <div className="foodDonation_heading">
        <h1 className="heading-foodd">FOOD DONATION FORM</h1>
      </div>

      {/* ✅ Show success message if available */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="foodDonation_wrapper">
        <form className="food-donation_form" onSubmit={handleSubmit}>
          <div className="form_element">
            <label htmlFor="foodName">Food Name</label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={foodName}
              onChange={(event) => setFoodName(event.target.value)}
              required
            />
          </div>

          <div className="form_element">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required 
            />
          </div>

          <div className="form_element">
            <label htmlFor="foodTag">Food Type</label>
            <select
              id="foodTag"
              name="foodTag"
              value={foodTag}
              onChange={(event) => setFoodTag(event.target.value)}
              required
            >
              <option value="" disabled>
                Choose type
              </option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non Veg</option>
            </select>
          </div>

          <div className="form_element">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={expiryDate}
              min={new Date().toISOString().split("T")[0]} // ✅ Disable past dates
              onChange={(event) => setExpiryDate(event.target.value)}
              required
            />
          </div>

          <div className="form_element">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              required
            />
          </div>

          <button id="foodDonation_submit-btn" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default FoodDonation;
