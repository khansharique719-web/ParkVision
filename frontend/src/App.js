import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import BookSlot from "./pages/BookSlot";
import MyBookings from "./pages/MyBookings";
import NavigatePage from "./pages/Navigate";
import FindParking from "./pages/FindParking";
import PaymentHistory from "./pages/PaymentHistory";
import Profile from "./pages/Profile";
import Reservations from "./pages/Reservations";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const themeProps = {
    darkMode,
    toggleDarkMode: () => setDarkMode((value) => !value),
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard {...themeProps} />} />
        <Route path="/admin" element={<AdminPanel {...themeProps} />} />
        <Route path="/book" element={<BookSlot {...themeProps} />} />
        <Route path="/my-bookings" element={<MyBookings {...themeProps} />} />
        <Route path="/navigate" element={<NavigatePage {...themeProps} />} />
        <Route path="/find-parking" element={<FindParking {...themeProps} />} />
        <Route path="/payment-history" element={<PaymentHistory {...themeProps} />} />
        <Route path="/profile" element={<Profile {...themeProps} />} />
        <Route path="/reservations" element={<Reservations {...themeProps} />} />
        <Route path="/about" element={<About {...themeProps} />} />
        <Route path="/contact" element={<Contact {...themeProps} />} />
      </Routes>
    </Router>
  );
}

export default App;