import React, { useState } from 'react';
const darkMode = localStorage.getItem("darkMode") === "true";
const pageBg = darkMode
  ? "bg-slate-950 text-white"
  : "bg-gray-100 text-gray-900";

const cardBg = darkMode
  ? "bg-slate-900 border border-slate-800 text-white"
  : "bg-white text-gray-900";

const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
function FindParking() {
  const [location, setLocation] = useState('');
  const [parkingSpots] = useState([
    { id: 1, name: 'Downtown Parking Lot', available: 45, price: '$5/hour', distance: '0.5 mi' },
    { id: 2, name: 'Plaza Garage', available: 12, price: '$6/hour', distance: '1.2 mi' },
    { id: 3, name: 'Street Parking - Main', available: 8, price: '$3/hour', distance: '0.3 mi' },
  ]);
  const [selectedSpot, setSelectedSpot] = useState(null);

  const handleReserve = (spot) => {
    setSelectedSpot(spot);
    alert(`Reserved at ${spot.name} - Confirmation sent to your email!`);
  };

  return (
    <div className="find-parking-page">
      <h1>Find Parking Near You</h1>
      <p>Search available parking spots and reserve your space instantly.</p>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter location or address"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button className="submit-btn">Search</button>
      </div>

      <div className="parking-listings">
        {parkingSpots.map((spot) => (
          <div key={spot.id} className="parking-card">
            <div className="parking-info">
              <h3>{spot.name}</h3>
              <p><strong>Available:</strong> {spot.available} spots</p>
              <p><strong>Price:</strong> {spot.price}</p>
              <p><strong>Distance:</strong> {spot.distance}</p>
            </div>
            <button 
              onClick={() => handleReserve(spot)}
              className="submit-btn"
            >
              Reserve Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FindParking;
