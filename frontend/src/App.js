import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  React.useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/book" element={<BookSlot />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/navigate" element={<NavigatePage />} />
          <Route path="/find-parking" element={<FindParking />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
