import React, { useState } from 'react';
const darkMode = localStorage.getItem("darkMode") === "true";
const pageBg = darkMode
  ? "bg-slate-950 text-white"
  : "bg-gray-100 text-gray-900";

const cardBg = darkMode
  ? "bg-slate-900 border border-slate-800 text-white"
  : "bg-white text-gray-900";

const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
function Reservations() {
  const [reservations] = useState([
    { id: 1, location: 'Downtown Parking Lot', date: '2026-04-30', time: '09:00 AM - 05:00 PM', status: 'Active', price: '$40' },
    { id: 2, location: 'Plaza Garage', date: '2026-05-05', time: '02:00 PM - 08:00 PM', status: 'Upcoming', price: '$30' },
  ]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const handleCancel = (id) => {
    alert('Reservation cancelled successfully!');
  };

  return (
    <div className="reservations-page">
      <h1>My Reservations</h1>
      <p>View and manage your active parking reservations.</p>
      
      <div className="reservations-list">
        {reservations.length > 0 ? (
          reservations.map((res) => (
            <div key={res.id} className="reservation-card">
              <div className="reservation-header">
                <h3>{res.location}</h3>
                <span className={`status-badge ${res.status.toLowerCase()}`}>{res.status}</span>
              </div>
              <div className="reservation-details">
                <p><strong>Date:</strong> {res.date}</p>
                <p><strong>Time:</strong> {res.time}</p>
                <p><strong>Amount:</strong> {res.price}</p>
              </div>
              <div className="reservation-actions">
                <button className="submit-btn">Modify</button>
                <button className="submit-btn" onClick={() => handleCancel(res.id)}>Cancel</button>
              </div>
            </div>
          ))
        ) : (
          <p>No active reservations. <a href="/find-parking">Find a spot now!</a></p>
        )}
      </div>
    </div>
  );
}

export default Reservations;
