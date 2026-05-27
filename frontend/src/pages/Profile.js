import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const darkMode = localStorage.getItem("darkMode") === "true";
const pageBg = darkMode
  ? "bg-slate-950 text-white"
  : "bg-gray-100 text-gray-900";

const cardBg = darkMode
  ? "bg-slate-900 border border-slate-800 text-white"
  : "bg-white text-gray-900";

const mutedText = darkMode ? "text-slate-300" : "text-gray-500";
function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: 'user@example.com',
    phone: '+1 (555) 123-4567',
    vehicle: 'Toyota Camry - ABC 1234',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="profile-page">
      <div className="page-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-700 font-semibold">My Profile</p>
          <h1 className="text-4xl font-bold mt-3">Manage your account details and preferences.</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rounded-full bg-white px-5 py-3 text-blue-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-100 transition">
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <p className="text-gray-500 mb-8">Keep your contact and vehicle information up to date.</p>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Email</p>
                <p className="text-lg font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Phone</p>
                <p className="text-lg font-medium text-gray-900">{profile.phone}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Vehicle</p>
                <p className="text-lg font-medium text-gray-900">{profile.vehicle}</p>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="submit-btn w-full sm:w-auto">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6">
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <input type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={handleSave} type="button" className="submit-btn">Save Changes</button>
              <button onClick={() => setIsEditing(false)} type="button" className="secondary-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
