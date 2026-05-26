import React, { useState } from 'react';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message!');
  };

  return (
    <div className="contact-page">
      <div className="page-header mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-700 font-semibold">Contact Us</p>
        <h1 className="text-4xl font-bold mt-4">We'd love to hear from you.</h1>
        <p className="text-gray-500 mt-3">Send us a message!</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn w-full">Send Message</button>
          </form>
        </div>

        <div className="bg-blue-800 text-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Or reach us directly</h2>
          <div className="space-y-4 text-sm text-blue-100">
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
    </div>
  );
}

export default Contact;
