import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Verify authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Check if screen size is mobile and manage sidebar accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Close sidebar on location change for mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar
        user={JSON.parse(localStorage.getItem("user")) || {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {isMobile && (
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      )}
      
      <div className="dashboard-content">
        {children}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
