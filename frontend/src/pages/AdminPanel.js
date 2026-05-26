import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const navigate = useNavigate();
  
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [detectedSlots, setDetectedSlots] = useState([]);
  const [carsDetected, setCarsDetected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [gridRows, setGridRows] = useState(2);
  const [gridCols, setGridCols] = useState(4);
  const autoDetect = false;
  const stats = { totalUsers: 0 };

  // Add new area form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaLocation, setNewAreaLocation] = useState("");
  const [newAreaSlotCount, setNewAreaSlotCount] = useState(8);
  const [addingArea, setAddingArea] = useState(false);

  const fetchAreas = async () => {
    try {
      const res = await fetch("/api/slots");
      const data = await res.json();
      setAreas(data);
    } catch (err) {
      console.error("Failed to fetch areas");
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!selectedArea || !imageBase64) {
      alert("Please select an area and upload an image first");
      return;
    }
    setLoading(true);
    setMessage("");
    setDetectedSlots([]);
    try {
      const res = await fetch(`/api/slots/detect/${selectedArea.areaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          rows: gridRows,
          cols: gridCols,
        }),
      });
      const data = await res.json();
      if (data.area) {
        setDetectedSlots(data.area.slots);
        setCarsDetected(data.carsDetected || 0);
        if (data.detected_rows) setGridRows(data.detected_rows);
        if (data.detected_cols) setGridCols(data.detected_cols);
        setMessage(`Detection complete! ${data.carsDetected || 0} cars detected.${autoDetect ? ` Auto grid: ${data.detected_rows}x${data.detected_cols}` : ''}`);
        fetchAreas();
      } else {
        setMessage("Detection failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setMessage("Error connecting to server. Make sure Python API is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlots = (count) => {
    const rows = ["A", "B", "C", "D"];
    const slots = [];
    let slotNum = 0;
    for (let r = 0; r < rows.length && slotNum < count; r++) {
      for (let c = 1; c <= 4 && slotNum < count; c++) {
        slots.push({
          id: `${rows[r]}${c}`,
          x: (c - 1) * 110 + 10,
          y: r * 90 + 10,
          w: 100,
          h: 80,
          status: "free",
        });
        slotNum++;
      }
    }
    return slots;
  };

  const handleAddArea = async () => {
    if (!newAreaName || !newAreaLocation) {
      alert("Please fill all fields");
      return;
    }
    setAddingArea(true);
    try {
      const slots = generateSlots(newAreaSlotCount);
      const newAreaId = areas.length > 0 ? Math.max(...areas.map(a => a.areaId)) + 1 : 1;
      const res = await fetch("/api/slots/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaId: newAreaId, areaName: newAreaName, location: newAreaLocation, slots }),
      });
      const data = await res.json();
      if (data.message === "Area added") {
        setMessage("New parking area added successfully!");
        setShowAddForm(false);
        setNewAreaName("");
        setNewAreaLocation("");
        setNewAreaSlotCount(8);
        fetchAreas();
      }
    } catch (err) {
      setMessage("Error adding area");
    } finally {
      setAddingArea(false);
    }
  };

  const handleDeleteArea = async (areaId) => {
    const confirmed = window.confirm("Delete this parking area?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/slots/${areaId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.message === "Area deleted") {
        setMessage("Area deleted successfully");
        setSelectedArea(null);
        fetchAreas();
      }
    } catch (err) {
      setMessage("Error deleting area");
    }
  };

  const freeCount = detectedSlots.filter(s => s.status === "free").length;
  const occupiedCount = detectedSlots.filter(s => s.status === "occupied").length;

  return (
    <div className="admin-panel-page px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-600 mb-8">Manage parking lots, users, and system activity.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="stat-card p-5 bg-white rounded-xl shadow-sm">
          <h4 className="text-sm text-gray-500">Total Users</h4>
          <p className="text-2xl font-semibold">{stats.totalUsers}</p>
        </div>
        <button onClick={() => navigate("/dashboard")} className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition">
          Back
        </button>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Panel</h2>
        <p className="text-gray-500 mb-6">Manage parking areas and detect slots using YOLOv8 AI</p>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes("success") || message.includes("added") || message.includes("deleted") || message.includes("complete") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        {/* Parking Areas */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Parking Areas ({areas.length})</h3>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition">
              {showAddForm ? "Cancel" : "+ Add New Area"}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-blue-50 rounded-xl p-5 mb-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4">Add New Parking Area</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                  <input type="text" placeholder="e.g. Airport Parking" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" placeholder="e.g. Airport Road, Indore" value={newAreaLocation} onChange={(e) => setNewAreaLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Slots</label>
                  <select value={newAreaSlotCount} onChange={(e) => setNewAreaSlotCount(parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={4}>4 slots</option>
                    <option value={8}>8 slots</option>
                    <option value={12}>12 slots</option>
                    <option value={16}>16 slots</option>
                  </select>
                </div>
              </div>
              <button onClick={handleAddArea} disabled={addingArea} className="mt-4 bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
                {addingArea ? "Adding..." : "Add Area"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {areas.map((area) => (
              <div key={area.areaId} onClick={() => { setSelectedArea(area); setDetectedSlots([]); setImage(null); }} className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${selectedArea?.areaId === area.areaId ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                <h4 className="font-semibold text-gray-800 pr-6">{area.areaName}</h4>
                <p className="text-sm text-gray-500">{area.location}</p>
                <p className="text-sm text-green-600 mt-1">{area.slots?.filter(s => s.status === "free").length} free / {area.slots?.length} total</p>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.areaId); }} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Section */}
        {selectedArea && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Upload Image — {selectedArea.areaName}</h3>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {image && <img src={image} alt="Uploaded" className="mt-4 w-full max-h-64 object-cover rounded-lg" />}

              {/* Manual grid controls - only show when Auto is OFF */}
              {!autoDetect && (
                <div className="flex gap-6 items-end mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button onClick={() => setGridRows(Math.max(1, gridRows - 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">−</button>
                      <span className="px-4 py-2 text-sm font-semibold">{gridRows}</span>
                      <button onClick={() => setGridRows(gridRows + 1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button onClick={() => setGridCols(Math.max(1, gridCols - 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">−</button>
                      <span className="px-4 py-2 text-sm font-semibold">{gridCols}</span>
                      <button onClick={() => setGridCols(gridCols + 1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">+</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 pb-2">Total slots: <span className="font-bold text-blue-700">{gridRows * gridCols}</span></p>
                </div>
              )}
            </div>

            <button onClick={handleDetect} disabled={loading} className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition mb-6 disabled:opacity-50">
              {loading ? "Detecting with YOLOv8 AI..." : "Detect Slots with YOLOv8 AI"}
            </button>
          </>
        )}

        {/* Results */}
        {detectedSlots.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Detection Results</h3>
              <div className="flex gap-3">
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{freeCount} Free</span>
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">{occupiedCount} Occupied</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{carsDetected} Cars by YOLO</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {detectedSlots.map((slot) => (
                <div key={slot.id} className={`py-3 rounded-lg text-center text-sm font-semibold ${slot.status === "free" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  <p>{slot.id}</p>
                  <p className="text-xs capitalize">{slot.status}</p>
                </div>
              ))}
            </div>
          </div>          )}      </div>
    </div>
  );
}

export default AdminPanel;
