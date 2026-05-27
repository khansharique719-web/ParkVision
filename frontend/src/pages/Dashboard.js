import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "parkingAreas"; // must match AdminPanel

// Fallback data — only used when localStorage is empty
const fallbackAreas = [
  {
    areaName: "Mall Parking",
    location: "Vijay Nagar, Indore",
    slots: Array.from({ length: 8 }, (_, i) => ({
      status: i < 3 ? "free" : "occupied",
    })),
  },
  {
    areaName: "Railway Station Parking",
    location: "Station Road, Indore",
    slots: Array.from({ length: 8 }, (_, i) => ({
      status: i < 6 ? "free" : "occupied",
    })),
  },
  {
    areaName: "City Center Parking",
    location: "MG Road, Indore",
    slots: Array.from({ length: 8 }, (_, i) => ({
      status: i < 5 ? "free" : "occupied",
    })),
  },
  {
    areaName: "Apollo Hospital",
    location: "Sector-D, Scheme No 74C, Vijay Nagar, Indore, Madhya Pradesh, 452010",
    slots: Array.from({ length: 30 }, (_, i) => ({
      status: i < 15 ? "free" : "occupied",
    })),
  },
  {
    areaName: "DMart",
    location: "Unknown location",
    slots: Array.from({ length: 60 }, (_, i) => ({
      status: i < 58 ? "free" : "occupied",
    })),
  },
  {
    areaName: "Pinaki Boys Hostel",
    location: "Unknown location",
    slots: Array.from({ length: 64 }, (_, i) => ({
      status: i < 37 ? "free" : "occupied",
    })),
  },
  {
    areaName: "Minesh Hospital",
    location: "Rau",
    slots: Array.from({ length: 64 }, (_, i) => ({
      status: i < 37 ? "free" : "occupied",
    })),
  },
];

/** Read areas from localStorage (saved by AdminPanel), or fall back to static data. */
function loadAreas() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length > 0 ? saved : fallbackAreas;
  } catch {
    return fallbackAreas;
  }
}

function Dashboard({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const [areas, setAreas] = useState(loadAreas);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) localStorage.setItem("token", "demo");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  /**
   * Re-read from localStorage.
   * Also listens for the custom "parkingAreasUpdated" event dispatched by AdminPanel
   * if both panels are open in the same tab (unlikely but handled).
   */
  const refreshAreas = () => setAreas(loadAreas());

  // Re-sync whenever the user navigates back to this tab
  useEffect(() => {
    window.addEventListener("focus", refreshAreas);
    return () => window.removeEventListener("focus", refreshAreas);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const pageBg = darkMode ? "bg-slate-950 text-white" : "bg-gray-100 text-gray-900";
  const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
  const cardBg = darkMode
    ? "bg-slate-900 border border-slate-800 text-white"
    : "bg-white text-gray-900";
  const cardText = darkMode ? "text-slate-300" : "text-gray-500";
  const softPanel = darkMode
    ? "bg-slate-900/70 border border-slate-800"
    : "bg-white/40 border border-gray-200";

  const actionCards = [
    { title: "Book a Slot", icon: "🚗", path: "/book", className: "bg-blue-700 text-white" },
    { title: "My Bookings", icon: "📋", path: "/my-bookings", className: cardBg },
    { title: "Navigate", icon: "🧭", path: "/navigate", className: cardBg },
    { title: "Profile", icon: "👤", path: "/profile", className: cardBg },
    { title: "Admin Panel", icon: "📷", path: "/admin", className: "bg-yellow-400 text-yellow-950" },
  ];

  return (
    <div className={`min-h-screen ${pageBg}`}>
      {/* Nav */}
      <nav className="bg-blue-800 px-10 py-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 text-3xl font-bold"
          >
            <span className="text-4xl font-medium">P</span>
            <span>ParkVision</span>
          </button>

          <div className="flex items-center gap-5">
            <button
              onClick={toggleDarkMode}
              className="rounded-full bg-slate-950 px-7 py-4 text-lg font-semibold text-white"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-blue-600 px-7 py-4 text-lg font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="px-10 py-12">
        {/* Hero */}
        <section className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome back!</h1>
            <p className={`mt-3 text-2xl ${mutedText}`}>
              Where would you like to park today?
            </p>
          </div>

          <button
            onClick={refreshAreas}
            className="mt-2 rounded-xl bg-blue-700 px-7 py-4 text-xl font-semibold text-white hover:bg-blue-800"
          >
            Refresh Parking Data
          </button>
        </section>

        {/* Action cards */}
        <section className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-5">
          {actionCards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.path)}
              className={`min-h-40 rounded-2xl p-8 text-center shadow-md transition hover:-translate-y-1 ${card.className}`}
            >
              <div className="text-4xl">{card.icon}</div>
              <div className="mt-5 text-2xl font-semibold">{card.title}</div>
            </button>
          ))}
        </section>

        {/* About / Contact */}
        <section className={`mt-10 rounded-3xl p-9 shadow-inner ${softPanel}`}>
          <h2 className="text-2xl font-bold">More from ParkVision</h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <button
              onClick={() => navigate("/about")}
              className={`rounded-2xl p-8 text-left shadow-md ${cardBg}`}
            >
              <div className="flex items-start gap-6">
                <div className="flex h-11 w-11 items-center justify-center rounded bg-sky-500 text-2xl font-bold text-white">
                  i
                </div>
                <div>
                  <h3 className="text-2xl font-bold">About Us</h3>
                  <p className={`mt-2 text-xl ${cardText}`}>Learn more about ParkVision.</p>
                </div>
              </div>
              <p className={`mt-7 text-xl ${cardText}`}>
                Read our mission, vision, and how we help you find parking faster.
              </p>
            </button>

            <button
              onClick={() => navigate("/contact")}
              className={`rounded-2xl p-8 text-left shadow-md ${cardBg}`}
            >
              <div className="flex items-start gap-6">
                <div className="text-4xl">✉️</div>
                <div>
                  <h3 className="text-2xl font-bold">Contact Us</h3>
                  <p className={`mt-2 text-xl ${cardText}`}>Get in touch with our support team.</p>
                </div>
              </div>
              <p className={`mt-7 text-xl ${cardText}`}>
                Send a message if you need help with parking, bookings, or the app.
              </p>
            </button>
          </div>
        </section>

        {/* Parking area list */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Nearby Parking Areas</h2>
            <p className={`text-xl ${mutedText}`}>
              Synced from Admin Panel · {areas.length} areas
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {areas.map((area, index) => {
              const slots = area.slots || [];
              const free = slots.filter((s) => s.status === "free").length;
              const occupied = slots.filter((s) => s.status === "occupied").length;

              return (
                <article
                  key={area.id || `${area.areaName}-${index}`}
                  className={`rounded-2xl shadow ${cardBg} overflow-hidden`}
                >
                  {/* Parking image if available */}
                  {area.image && (
                    <img
                      src={area.image}
                      alt={area.areaName}
                      className="h-40 w-full object-cover"
                    />
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold">{area.areaName}</h3>

                    <p className={`mt-3 min-h-14 text-xl leading-7 ${cardText}`}>
                      {area.location || "Unknown location"}
                    </p>

                    <div className="mt-5 flex gap-4">
                      <span className="rounded-full bg-green-100 px-4 py-2 text-lg font-semibold text-green-700">
                        {free} Free
                      </span>
                      <span className="rounded-full bg-red-100 px-4 py-2 text-lg font-semibold text-red-700">
                        {occupied} Occupied
                      </span>
                    </div>

                    <button
                      onClick={() => navigate("/book")}
                      className="mt-8 w-full rounded-xl bg-blue-700 py-4 text-xl font-semibold text-white hover:bg-blue-800"
                    >
                      Book Now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
