import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "parkingAreas";

const initialAreas = [
  {
    id: 1,
    areaName: "Mall Parking",
    location: "Vijay Nagar, Indore",
    image: "",
    slots: Array.from({ length: 8 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 3 ? "free" : "occupied",
    })),
  },
  {
    id: 2,
    areaName: "Railway Station Parking",
    location: "Station Road, Indore",
    image: "",
    slots: Array.from({ length: 8 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 6 ? "free" : "occupied",
    })),
  },
  {
    id: 3,
    areaName: "City Center Parking",
    location: "MG Road, Indore",
    image: "",
    slots: Array.from({ length: 8 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 5 ? "free" : "occupied",
    })),
  },
  {
    id: 4,
    areaName: "Apollo Hospital",
    location: "Sector-D, Scheme No 74C, Vijay Nagar, Indore, Madhya Pradesh, 452010",
    image: "",
    slots: Array.from({ length: 30 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 15 ? "free" : "occupied",
    })),
  },
  {
    id: 5,
    areaName: "DMart",
    location: "Unknown location",
    image: "",
    slots: Array.from({ length: 60 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 58 ? "free" : "occupied",
    })),
  },
  {
    id: 6,
    areaName: "Pinaki Boys Hostel",
    location: "Unknown location",
    image: "",
    slots: Array.from({ length: 64 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 37 ? "free" : "occupied",
    })),
  },
  {
    id: 7,
    areaName: "Minesh Hospital",
    location: "Rau",
    image: "",
    slots: Array.from({ length: 64 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 37 ? "free" : "occupied",
    })),
  },
  {
    id: 8,
    areaName: "TI Mall",
    location: "11, Mahatma Gandhi Road, South Tukoganj",
    image: "",
    slots: Array.from({ length: 30 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 15 ? "free" : "occupied",
    })),
  },
  {
    id: 9,
    areaName: "Airport",
    location: "Aerodrum Road, Indore",
    image: "",
    slots: Array.from({ length: 60 }, (_, i) => ({
      id: `S${i + 1}`,
      status: i < 15 ? "free" : "occupied",
    })),
  },
];

function makeSlots(total, freeCount) {
  return Array.from({ length: total }, (_, i) => ({
    id: `S${i + 1}`,
    status: i < freeCount ? "free" : "occupied",
  }));
}

function readStoredAreas() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length > 0 ? saved : initialAreas;
  } catch {
    return initialAreas;
  }
}

// ── CV/YOLO slot detection via local Flask API ───────────────────────────────
// Auto-detect Codespaces / remote forwarded port URL, fall back to localhost
function getDetectionAPI() {
  const host = window.location.hostname;
  // GitHub Codespaces: *.app.github.dev  → swap app port to 5001
  if (host.endsWith(".app.github.dev")) {
    // e.g. studious-fiesta-gx447v6949xp39xqq-3000.app.github.dev
    //   → studious-fiesta-gx447v6949xp39xqq-5001.app.github.dev
    const base = host.replace(/-\d+\.app\.github\.dev$/, "-5001.app.github.dev");
    return `https://${base}`;
  }
  // GitPod: *.gitpod.io
  if (host.endsWith(".gitpod.io")) {
    const base = host.replace(/^\d+-/, "5001-");
    return `https://${base}`;
  }
  return "http://localhost:5001";
}
const DETECTION_API = getDetectionAPI();

async function detectSlotsFromImage(base64Image, rows = 2, cols = 4) {
  const response = await fetch(`${DETECTION_API}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image, rows, cols }),
  });

  if (!response.ok) {
    throw new Error(`Detection API error ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Detection failed");

  // Normalise to the shape the rest of the component expects
  // { total, free, occupied, method, cars_detected, slots }
  return {
    total: data.total,
    free: data.free,
    occupied: data.occupied,
    method: data.method,            // "YOLO" | "OpenCV"
    cars_detected: data.cars_detected,
    slots: data.slots,              // per-slot detail array
  };
}

async function checkDetectionAPI() {
  try {
    const res = await fetch(`${DETECTION_API}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function AdminPanel({ darkMode }) {
  const navigate = useNavigate();

  const [areas, setAreas] = useState(readStoredAreas);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null); // { total, free, occupied, method, cars_detected, slots }
  const [apiOnline, setApiOnline] = useState(null); // null=unchecked, true, false

  const [form, setForm] = useState({
    areaName: "",
    location: "",
    rows: 2,
    columns: 4,
    image: "",
  });

  // ── Theme helpers ──────────────────────────────────────────────────────────
  const pageBg = darkMode ? "bg-slate-950 text-white" : "bg-gray-100 text-gray-900";
  const cardBg = darkMode
    ? "bg-slate-900 border border-slate-800 text-white"
    : "bg-white border border-gray-200 text-gray-900";
  const fieldBg = darkMode
    ? "bg-slate-950 border-slate-700 text-white"
    : "bg-white border-gray-300 text-gray-900";
  const mutedText = darkMode ? "text-slate-300" : "text-gray-500";

  // Total slots always driven by the rows × columns inputs
  const calculatedTotalSlots = Math.max(1, Number(form.rows || 1)) * Math.max(1, Number(form.columns || 1));

  // Free count: if detection ran, scale the occupancy ratio to the current total
  const detectedFree = detectionResult && detectionResult.total > 0
    ? Math.round((detectionResult.free / detectionResult.total) * calculatedTotalSlots)
    : calculatedTotalSlots;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSlots = areas.reduce((sum, a) => sum + a.slots.length, 0);
    const freeSlots = areas.reduce(
      (sum, a) => sum + a.slots.filter((s) => s.status === "free").length,
      0
    );
    return {
      totalAreas: areas.length,
      totalSlots,
      freeSlots,
      occupiedSlots: totalSlots - freeSlots,
    };
  }, [areas]);

  // ── Persist helpers ────────────────────────────────────────────────────────
  const saveAreas = (nextAreas) => {
    setAreas(nextAreas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAreas));
  };

  const resetForm = () => {
    setForm({ areaName: "", location: "", rows: 2, columns: 4, image: "" });
    setEditingId(null);
    setShowForm(false);
    setDetectionResult(null);
  };

  // ── Image upload — just stores the image, no auto-detection ─────────────
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setForm((prev) => ({ ...prev, image: base64 }));
    setDetectionResult(null);
    // Check API reachability silently
    checkDetectionAPI().then(setApiOnline);
  };

  // ── Manual "Detect Slots" trigger ────────────────────────────────────────
  const handleDetect = async () => {
    if (!form.image) {
      alert("Please upload a parking area image first.");
      return;
    }
    const online = await checkDetectionAPI();
    setApiOnline(online);
    if (!online) {
      alert(
        "⚠️ Detection API is offline.\n" +
        "Start your Flask server with: python app.py\n" +
        "Then try again."
      );
      return;
    }
    setDetecting(true);
    setDetectionResult(null);
    try {
      const result = await detectSlotsFromImage(
        form.image,
        Number(form.rows) || 2,
        Number(form.columns) || 4
      );
      setDetectionResult(result);
    } catch (err) {
      console.error("Slot detection failed:", err);
      alert("Detection failed: " + err.message);
    } finally {
      setDetecting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (area) => {
    const totalSlots = area.slots.length;
    const columns = Math.ceil(Math.sqrt(totalSlots));
    const rows = Math.ceil(totalSlots / columns);

    setEditingId(area.id);
    setForm({ areaName: area.areaName, location: area.location, rows, columns, image: area.image || "" });
    setDetectionResult(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("Delete this parking area?")) return;
    saveAreas(areas.filter((a) => a.id !== id));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.areaName.trim() || !form.location.trim()) {
      alert("Please enter area name and location");
      return;
    }

    const totalSlots = calculatedTotalSlots;
    const freeCount = detectedFree;

    if (editingId) {
      const nextAreas = areas.map((area) =>
        area.id === editingId
          ? {
              ...area,
              areaName: form.areaName,
              location: form.location,
              image: form.image,
              slots: makeSlots(totalSlots, freeCount),
            }
          : area
      );
      saveAreas(nextAreas);
      alert("Parking area updated");
      resetForm();
      return;
    }

    const newArea = {
      id: Date.now(),
      areaName: form.areaName,
      location: form.location,
      image: form.image,
      slots: makeSlots(totalSlots, freeCount),
    };

    saveAreas([newArea, ...areas]);
    alert("New parking area registered");
    resetForm();
  };

  const handleRefresh = () => {
    saveAreas([...areas]);
    alert("Parking data refreshed");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen px-6 py-8 ${pageBg}`}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className={`mt-2 text-lg ${mutedText}`}>
                Manage parking areas · YOLO + OpenCV slot detection
              </p>
              {apiOnline === false && (
                <p className="mt-1 text-sm font-semibold text-yellow-600">
                  ⚠️ Detection API offline — run <code className="rounded bg-yellow-100 px-1">python app.py</code> on port 5001
                </p>
              )}
              {apiOnline === true && (
                <p className="mt-1 text-sm font-semibold text-green-600">
                  ✅ Detection API online
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Parking Areas", value: stats.totalAreas, color: "" },
            { label: "Total Slots", value: stats.totalSlots, color: "" },
            { label: "Free Slots", value: stats.freeSlots, color: "text-green-600" },
            { label: "Occupied Slots", value: stats.occupiedSlots, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl p-5 shadow ${cardBg}`}>
              <p className={mutedText}>{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        {/* Area management */}
        <section className={`mb-8 rounded-2xl p-8 shadow ${cardBg}`}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Parking Areas ({areas.length})</h2>
            <button
              onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              {showForm ? "Close Form" : "+ Add New Area"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className={`mb-6 rounded-2xl border p-5 ${
                darkMode ? "border-slate-700 bg-slate-950" : "border-blue-100 bg-blue-50"
              }`}
            >
              <h3 className="mb-4 text-lg font-bold">
                {editingId ? "Edit Parking Area" : "Register New Parking Area"}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-semibold">Area Name</label>
                  <input
                    value={form.areaName}
                    onChange={(e) => setForm({ ...form, areaName: e.target.value })}
                    placeholder="e.g. Central Mall Parking"
                    className={`w-full rounded-lg border px-4 py-3 ${fieldBg}`}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-semibold">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. MG Road, Indore"
                    className={`w-full rounded-lg border px-4 py-3 ${fieldBg}`}
                  />
                </div>

                {/* Rows / Cols — always visible */}
                <>
                    <div>
                      <label className="mb-1 block text-sm font-semibold">Rows</label>
                      <input
                        type="number"
                        min="1"
                        value={form.rows}
                        onChange={(e) => setForm({ ...form, rows: e.target.value })}
                        className={`w-full rounded-lg border px-4 py-3 ${fieldBg}`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold">Columns</label>
                      <input
                        type="number"
                        min="1"
                        value={form.columns}
                        onChange={(e) => setForm({ ...form, columns: e.target.value })}
                        className={`w-full rounded-lg border px-4 py-3 ${fieldBg}`}
                      />
                    </div>
                  </>

                {/* Slot summary */}
                <div className={`rounded-lg px-4 py-3 md:col-span-2 ${
                  detectionResult
                    ? "bg-green-100 text-green-800"
                    : apiOnline === false
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {detectionResult ? (
                    <span>
                      {detectionResult.method === "YOLO" ? "🎯" : "🔍"}{" "}
                      <strong>{detectionResult.method} detected:</strong>{" "}
                      {detectionResult.total} total slots ·{" "}
                      <span className="text-green-700 font-semibold">{detectionResult.free} free</span> ·{" "}
                      <span className="text-red-700 font-semibold">{detectionResult.occupied} occupied</span>
                      {detectionResult.method === "YOLO" && (
                        <span className="ml-2 text-xs text-gray-600">
                          ({detectionResult.cars_detected} vehicle{detectionResult.cars_detected !== 1 ? "s" : ""} detected by YOLO)
                        </span>
                      )}
                      {detectionResult.method === "OpenCV" && (
                        <span className="ml-2 text-xs text-gray-600">
                          (auto-threshold · no vehicles found by YOLO)
                        </span>
                      )}
                    </span>
                  ) : apiOnline === false ? (
                    <span>
                      ⚠️ <strong>Detection API offline</strong> — start your Flask server, then re-upload the image.
                      Slots will be set from rows × columns below.
                    </span>
                  ) : (
                    <span>
                      <strong>Total Slots:</strong> {calculatedTotalSlots} (from rows × columns)
                    </span>
                  )}
                </div>

                {/* Image upload */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold">
                    Parking Area Picture{" "}
                    <span className={`font-normal ${mutedText}`}>
                      — upload to auto-detect slots via YOLO + OpenCV
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={detecting}
                    className={`w-full rounded-lg border px-4 py-3 ${fieldBg}`}
                  />

                  {/* Preview */}
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Parking preview"
                      className="mt-4 max-h-64 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>

              {/* ── Slot Preview Panel ───────────────────────────────────── */}
              {(detectionResult || calculatedTotalSlots > 0) && (
                <div className={`mt-5 rounded-xl border p-5 ${darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"}`}>
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-500">
                    Slot Preview
                  </h4>

                  {/* Count badges */}
                  <div className="mb-4 flex flex-wrap gap-3">
                    <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${darkMode ? "bg-slate-800" : "bg-white border border-gray-200"}`}>
                      <span className="text-2xl font-bold">{calculatedTotalSlots}</span>
                      <span className={`text-sm ${mutedText}`}>Total Slots</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2">
                      <span className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-2xl font-bold text-green-700">{detectedFree}</span>
                      <span className="text-sm text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2">
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-2xl font-bold text-red-700">{calculatedTotalSlots - detectedFree}</span>
                      <span className="text-sm text-red-600 font-medium">Occupied</span>
                    </div>
                    {detectionResult && (
                      <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${darkMode ? "bg-slate-800" : "bg-blue-50 border border-blue-200"}`}>
                        <span className="text-lg">{detectionResult.method === "YOLO" ? "🎯" : "🔍"}</span>
                        <span className={`text-sm font-semibold ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
                          {detectionResult.method}
                        </span>
                      </div>
                    )}
                  </div>


                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={detecting}
                  className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {editingId ? "Save Changes" : "Register Area"}
                </button>

                {/* Detect Slots button */}
                <button
                  type="button"
                  onClick={handleDetect}
                  disabled={detecting || !form.image}
                  className={`flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition disabled:opacity-40 ${
                    darkMode
                      ? "bg-emerald-700 text-white hover:bg-emerald-600"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {detecting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Detecting…
                    </>
                  ) : (
                    <>
                      🔍 Detect Slots
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className={`rounded-lg px-6 py-3 font-semibold ${
                    darkMode ? "bg-slate-800 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Area cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {areas.map((area) => {
              const free = area.slots.filter((s) => s.status === "free").length;
              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`relative rounded-xl border p-5 transition cursor-pointer ${
                    selectedAreaId === area.id
                      ? "border-blue-600 bg-blue-50 text-gray-900"
                      : darkMode
                      ? "border-slate-700 bg-slate-950"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }}
                    className="absolute right-4 top-3 text-xl text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>

                  {/* Thumbnail */}
                  {area.image && (
                    <img
                      src={area.image}
                      alt={area.areaName}
                      className="mb-3 h-24 w-full rounded-lg object-cover"
                    />
                  )}

                  <h3 className="pr-8 text-lg font-bold">{area.areaName}</h3>
                  <p className={`mt-1 ${selectedAreaId === area.id ? "text-gray-600" : mutedText}`}>
                    {area.location}
                  </p>
                  <p className="mt-3 font-semibold text-green-600">
                    {free} free / {area.slots.length} total
                  </p>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(area); }}
                    className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Edit Area
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Registered list */}
        <section className={`rounded-2xl p-8 shadow ${cardBg}`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">All Registered Parking Areas</h2>
            <button
              onClick={handleRefresh}
              className={`rounded-lg px-5 py-3 ${
                darkMode ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {areas.map((area) => {
              const free = area.slots.filter((s) => s.status === "free").length;
              const occupied = area.slots.length - free;

              return (
                <div
                  key={`registered-${area.id}`}
                  className={`grid gap-4 rounded-xl border p-5 md:grid-cols-[120px_1fr_auto] ${
                    darkMode ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <div className="h-24 overflow-hidden rounded-lg bg-gray-200">
                    {area.image ? (
                      <img src={area.image} alt={area.areaName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">P</div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">{area.areaName}</h3>
                    <p className={mutedText}>{area.location}</p>
                    <div className="mt-3 flex gap-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {free} Free
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        {occupied} Occupied
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(area)}
                      className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id)}
                      className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

export default AdminPanel;
