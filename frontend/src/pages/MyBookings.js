import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const darkMode = localStorage.getItem("darkMode") === "true";
const pageBg = darkMode
  ? "bg-slate-950 text-white"
  : "bg-gray-100 text-gray-900";

const cardBg = darkMode
  ? "bg-slate-900 border border-slate-800 text-white"
  : "bg-white text-gray-900";

const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    try {
      const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      setBookings(savedBookings);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (id) => {
    const confirmed = window.confirm(
      "Cancel this booking? Your payment will be refunded."
    );

    if (!confirmed) return;

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const updatedBookings = savedBookings.map((booking) =>
      booking._id === id ? { ...booking, status: "cancelled" } : booking
    );

    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    alert("Booking cancelled! Refund in 3-5 business days.");
    fetchBookings();
  };

  const statusStyle = (status) => {
    if (status === "active") return "bg-green-100 text-green-700";
    if (status === "completed") return "bg-gray-100 text-gray-600";
    if (status === "cancelled") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
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

      <div className="px-6 py-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>

        {loading ? (
          <p className="text-center text-gray-500 mt-20">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-4">&#128203;</p>
            <p>No bookings yet.</p>
            <button
              onClick={() => navigate("/book")}
              className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Book a Slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {booking.area}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {booking.location}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm text-gray-600">
                  <div>
                    <p className="text-xs text-gray-400">Slot</p>
                    <p className="font-medium">{booking.slot}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-medium">{booking.date}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="font-medium">{booking.time}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="font-medium">{booking.duration} hr(s)</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p className="font-bold text-blue-700">
                    &#8377;{booking.amount}
                  </p>

                  {booking.status === "active" && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Cancel & Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;