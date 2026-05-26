import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero mb-8 rounded-3xl p-10 bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm opacity-80">ParkVision</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">Welcome back!</h1>
            <p className="mt-4 text-lg text-blue-100">Where would you like to park today?</p>
          </div>
          <button onClick={() => navigate("/book")} className="mt-2 md:mt-0 inline-flex items-center justify-center rounded-full bg-white text-blue-700 font-semibold px-6 py-3 shadow-lg hover:bg-gray-100 transition">
            Refresh Parking Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <div
          onClick={() => navigate("/book")}
          className="bg-blue-700 text-white rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-blue-800 transition shadow-xl"
        >
          <span className="text-4xl">🚗</span>
          <span className="font-semibold text-lg">Book a Slot</span>
        </div>

        <div
          onClick={() => navigate("/my-bookings")}
          className="bg-white text-gray-900 rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:shadow-lg transition border border-gray-200"
        >
          <span className="text-4xl">📋</span>
          <span className="font-semibold text-lg">My Bookings</span>
        </div>

        <div
          onClick={() => navigate("/navigate")}
          className="bg-white text-gray-900 rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:shadow-lg transition border border-gray-200"
        >
          <span className="text-4xl">🧭</span>
          <span className="font-semibold text-lg">Navigate</span>
        </div>

        <div
          onClick={() => navigate("/profile")}
          className="bg-white text-gray-900 rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:shadow-lg transition border border-gray-200"
        >
          <span className="text-4xl">👤</span>
          <span className="font-semibold text-lg">Profile</span>
        </div>

        <div
          onClick={() => navigate("/admin")}
          className="bg-yellow-400 text-yellow-950 rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-yellow-500 transition shadow-xl"
        >
          <span className="text-4xl">📸</span>
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Nearby Parking Areas</h2>
        <p className="text-sm text-gray-500">Automatically updated from admin panel detection results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900">Mall Parking</h3>
          <p className="text-sm text-gray-500 mt-1">Vijay Nagar, Indore</p>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">3 Free</span>
            <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1">5 Occupied</span>
          </div>
          <button onClick={() => navigate("/book")} className="mt-6 w-full rounded-full bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 transition">Book Now</button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900">Railway Station Parking</h3>
          <p className="text-sm text-gray-500 mt-1">Station Road, Indore</p>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">6 Free</span>
            <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1">2 Occupied</span>
          </div>
          <button onClick={() => navigate("/book")} className="mt-6 w-full rounded-full bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 transition">Book Now</button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900">City Center Parking</h3>
          <p className="text-sm text-gray-500 mt-1">MG Road, Indore</p>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">5 Free</span>
            <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1">3 Occupied</span>
          </div>
          <button onClick={() => navigate("/book")} className="mt-6 w-full rounded-full bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 transition">Book Now</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
