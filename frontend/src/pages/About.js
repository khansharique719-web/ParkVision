import React from 'react';

function About() {
  return (
    <div className="about-page">
      <div className="page-header mb-10 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 w-16 h-16 mx-auto mb-4">
          <span className="text-2xl">i</span>
        </div>
        <h1 className="text-4xl font-bold">About ParkVision</h1>
        <p className="text-gray-500 mt-3 text-lg">Smart Urban Parking for Modern Cities</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] mb-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-8">ParkVision is a cutting-edge parking management system designed to make parking easier and more efficient. Our mission is to reduce traffic congestion and parking frustrations by providing real-time parking information and seamless booking — all powered by AI and computer vision.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold">Email</p>
              <p>info@parkvision.com</p>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p>(123) 456-7890</p>
            </div>
            <div>
              <p className="font-semibold">Location</p>
              <p>Indore, Madhya Pradesh, India</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <div className="feature-card bg-white rounded-3xl shadow-xl p-7 border border-gray-200 text-center">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="font-semibold mb-2">Camera Detection</h3>
          <p className="text-gray-500 text-sm">Uses YOLOv8 AI to detect free and occupied slots from camera images.</p>
        </div>
        <div className="feature-card bg-white rounded-3xl shadow-xl p-7 border border-gray-200 text-center">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-500 text-sm">Book parking slots in advance and pay online seamlessly.</p>
        </div>
        <div className="feature-card bg-white rounded-3xl shadow-xl p-7 border border-gray-200 text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="font-semibold mb-2">GPS Navigation</h3>
          <p className="text-gray-500 text-sm">Get turn-by-turn directions to your reserved parking spot.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
        <p className="text-gray-700 leading-8">We are a team of passionate developers and engineers committed to improving urban mobility. Built with React, Node.js, MongoDB, Python, and YOLOv8 AI.</p>
      </div>
    </div>
  );
}

export default About;
