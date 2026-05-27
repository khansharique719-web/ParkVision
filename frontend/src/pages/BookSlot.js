import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "parkingAreas";

const hardcodedAreas = [
  {
    id: 1,
    areaName: "City Center Parking",
    location: "MG Road, Indore",
    slots: [
      { id: "A1", status: "free" }, { id: "A2", status: "occupied" },
      { id: "A3", status: "free" }, { id: "A4", status: "occupied" },
      { id: "B1", status: "free" }, { id: "B2", status: "free" },
      { id: "B3", status: "occupied" }, { id: "B4", status: "free" },
    ],
  },
  {
    id: 2,
    areaName: "Mall Parking",
    location: "Vijay Nagar, Indore",
    slots: [
      { id: "A1", status: "occupied" }, { id: "A2", status: "occupied" },
      { id: "A3", status: "free" },    { id: "A4", status: "free" },
      { id: "B1", status: "occupied" }, { id: "B2", status: "free" },
      { id: "B3", status: "occupied" }, { id: "B4", status: "occupied" },
    ],
  },
  {
    id: 3,
    areaName: "Railway Station Parking",
    location: "Station Road, Indore",
    slots: [
      { id: "A1", status: "free" }, { id: "A2", status: "free" },
      { id: "A3", status: "free" }, { id: "A4", status: "free" },
      { id: "B1", status: "occupied" }, { id: "B2", status: "free" },
      { id: "B3", status: "free" },    { id: "B4", status: "occupied" },
    ],
  },
];

function loadAreas() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return hardcodedAreas;
}

// Pricing per vehicle type
const PRICING = {
  "2": { "1": 30, "2": 55, "3": 75, "4": 90,  "5": 110 },
  "4": { "1": 50, "2": 90, "3": 130, "4": 160, "5": 200 },
};

// Validate Indian number plate  e.g. MP09AB1234
const PLATE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

function BookSlot() {
  const navigate = useNavigate();
  const [allAreas]      = useState(loadAreas);
  const [showAll, setShowAll] = useState(false);
  const [selectedArea, setSelectedArea]   = useState(null);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [duration, setDuration] = useState("1");
  const [vehicleType, setVehicleType]     = useState("4");   // "2" | "4"
  const [numberPlate, setNumberPlate]     = useState("");
  const [plateError, setPlateError]       = useState("");
  const [step, setStep] = useState(1);

  const visibleAreas = showAll ? allAreas : allAreas.slice(0, 3);
  const hasMore      = allAreas.length > 3;

  const getAmount = () => PRICING[vehicleType]?.[duration] ?? 200;

  const handlePlateChange = (val) => {
    const upper = val.toUpperCase().replace(/\s/g, "");
    setNumberPlate(upper);
    if (upper && !PLATE_REGEX.test(upper)) {
      setPlateError("Format: MP09AB1234 (state · district · series · number)");
    } else {
      setPlateError("");
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === "occupied") return;
    setSelectedSlot(slot.id);
  };

  const handleProceed = () => {
    if (!selectedArea || !selectedSlot || !date || !time) {
      alert("Please fill all fields and select a slot");
      return;
    }
    if (!numberPlate) {
      alert("Please enter your vehicle number plate");
      return;
    }
    if (!PLATE_REGEX.test(numberPlate)) {
      alert("Please enter a valid number plate (e.g. MP09AB1234)");
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = () => {
    const booking = {
      _id: Date.now().toString(),
      area: selectedArea.areaName,
      location: selectedArea.location,
      slot: selectedSlot,
      date, time,
      duration: parseInt(duration),
      vehicleType: vehicleType === "2" ? "2-Wheeler" : "4-Wheeler",
      numberPlate,
      amount: getAmount(),
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const old = JSON.parse(localStorage.getItem("bookings") || "[]");
    localStorage.setItem("bookings", JSON.stringify([booking, ...old]));
    alert("Booking confirmed!");
    navigate("/my-bookings");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="text-xl font-bold">ParkVision</span>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-blue-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Back
        </button>
      </nav>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Book a Parking Slot</h2>

        {step === 1 && (
          <>
            {/* ── Parking Area ─────────────────────────────────────── */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Parking Area
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleAreas.map((area, idx) => {
                  const freeCount  = (area.slots || []).filter((s) => s.status === "free").length;
                  const areaId     = area.id ?? `${area.areaName}-${idx}`;
                  const isSelected = selectedArea &&
                    (selectedArea.id ?? `${selectedArea.areaName}`) === (area.id ?? area.areaName);
                  return (
                    <div
                      key={areaId}
                      onClick={() => { setSelectedArea(area); setSelectedSlot(null); }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <h4 className="font-semibold text-gray-800">{area.areaName}</h4>
                      <p className="text-sm text-gray-500">{area.location}</p>
                      <p className="text-sm text-green-600 mt-1">{freeCount} slots free</p>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <button
                  onClick={() => {
                    setShowAll((v) => !v);
                    if (showAll && selectedArea) {
                      const stillVisible = allAreas.slice(0, 3).some(
                        (a) => (a.id ?? a.areaName) === (selectedArea.id ?? selectedArea.areaName)
                      );
                      if (!stillVisible) { setSelectedArea(null); setSelectedSlot(null); }
                    }
                  }}
                  className="mt-4 flex items-center gap-2 text-blue-700 font-semibold text-sm hover:underline focus:outline-none"
                >
                  {showAll ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      See Less
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      See More ({allAreas.length - 3} more areas)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* ── Slot Grid ────────────────────────────────────────── */}
            {selectedArea && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Select a Slot — {selectedArea.areaName}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {(selectedArea.slots || []).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={`py-3 rounded-lg text-sm font-semibold transition ${
                        slot.status === "occupied"
                          ? "bg-red-100 text-red-500 cursor-not-allowed"
                          : selectedSlot === slot.id
                          ? "bg-blue-600 text-white"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {slot.id}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Free
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Occupied
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Selected
                  </span>
                </div>
              </div>
            )}

            {/* ── Vehicle Details ───────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Vehicle Details</h3>

              {/* 2 / 4 Wheeler toggle */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <div className="flex gap-3">
                  {[
                    { val: "2", label: "2-Wheeler", icon: "🏍️", hint: "Bike / Scooter" },
                    { val: "4", label: "4-Wheeler", icon: "🚗", hint: "Car / SUV" },
                  ].map(({ val, label, icon, hint }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setVehicleType(val)}
                      className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${
                        vehicleType === val
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{label}</p>
                        <p className="text-xs text-gray-400">{hint}</p>
                      </div>
                      {vehicleType === val && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number plate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number Plate
                </label>
                <div className="relative">
                  {/* IND badge */}
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <div className="h-full flex items-center justify-center bg-blue-700 text-white text-xs font-bold px-3 rounded-l-lg tracking-wider select-none">
                      IND
                    </div>
                  </div>
                  <input
                    type="text"
                    value={numberPlate}
                    onChange={(e) => handlePlateChange(e.target.value)}
                    placeholder="MP09AB1234"
                    maxLength={10}
                    className={`w-full border rounded-lg pl-16 pr-4 py-2.5 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 ${
                      plateError
                        ? "border-red-400 focus:ring-red-400"
                        : numberPlate && !plateError
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {/* valid tick */}
                  {numberPlate && !plateError && (
                    <span className="absolute inset-y-0 right-3 flex items-center text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                {plateError && (
                  <p className="mt-1 text-xs text-red-500">{plateError}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Enter without spaces · auto-converts to uppercase
                </p>
              </div>
            </div>

            {/* ── Date / Time / Duration ────────────────────────────── */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Select Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date" value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time" value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                    <span className="ml-1 text-xs text-blue-600 font-normal">
                      ({vehicleType === "2" ? "2-Wheeler rates" : "4-Wheeler rates"})
                    </span>
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(PRICING[vehicleType]).map(([hrs, price]) => (
                      <option key={hrs} value={hrs}>
                        {hrs} hour{hrs !== "1" ? "s" : ""} — ₹{price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition"
            >
              Proceed to Payment
            </button>
          </>
        )}

        {/* ── Step 2: Summary ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Booking Summary</h3>

            <div className="space-y-3 text-sm text-gray-700">
              {[
                ["Parking Area",  selectedArea.areaName],
                ["Location",      selectedArea.location],
                ["Slot",          selectedSlot],
                ["Vehicle Type",  vehicleType === "2" ? "🏍️  2-Wheeler" : "🚗  4-Wheeler"],
                ["Number Plate",  numberPlate],
                ["Date",          date],
                ["Time",          time],
                ["Duration",      `${duration} hour(s)`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{label}</span>
                  <span className="font-mono tracking-wide">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-blue-700 pt-1">
                <span>Total Amount</span>
                <span>₹{getAmount()}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookSlot;