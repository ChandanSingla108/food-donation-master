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
import ReceiverDashboard from "./dashboard/ReceiverDashboard";
import About from "./pages/about";
import Contact from "./pages/contact";
import Ourwork from "./pages/ourwork";
import DashboardHome from "./dashboard/DashboardHome";
import DonateForm from "./dashboard/DonateForm";
import MyDonations from "./dashboard/MyDonations";
// import NotFound from "./pages/NotFound";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState("");
  const { pathname } = useLocation();

  // Check for authentication on component mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(user.role || "");
    };

    // Initial check
    handleStorageChange();

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
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/donation" element={<FoodDonation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/ourwork" element={<Ourwork />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="food" element={<Food />} />
          <Route path="donate" element={<DonateForm />} />
          <Route path="mydonations" element={<MyDonations />} />
          <Route path="nearby" element={<ReceiverDashboard />} />
        </Route>

        {/* Fallback Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  );
}

export default App;
