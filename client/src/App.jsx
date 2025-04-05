import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import Home from "./pages/Home";
import FoodDonation from "./pages/FoodDonation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./dashboard/Layout";
import Navbar from "./components/Navbar/Navbar";

import Profile from "./dashboard/Profile";
import Food from "./dashboard/Food";
import About from "./pages/about";
import Contact from "./pages/contact";
import Ourwork from "./pages/ourwork";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const { pathname } = useLocation();

  // Check for authentication on component mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
      {!pathname.includes("/login") &&
        !pathname.includes("/signup") &&
        !pathname.includes("/dashboard") && <Navbar token={token} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donation" element={<FoodDonation />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<FoodDonation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="food" element={<Food />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ourwork" element={<Ourwork />} />
      </Routes>
    </>
  );
}

export default App;
