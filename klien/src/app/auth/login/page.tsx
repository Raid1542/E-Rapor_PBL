"use client";

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        .bg-image {
          background-image: url('/images/bg-logo.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .glass-overlay {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
      
      <div className="min-h-screen relative bg-image">
        {/* Glass Overlay pada Background */}
        <div className="absolute inset-0 glass-overlay"></div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          {/* Login Card - Solid Background */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {/* Logo Image */}
              <div className="flex justify-center mb-6">
                <div className="transform hover:scale-105 transition-all duration-300">
                  <img
                    src="/images/LogoUA.jpg"
                    alt="Logo SDIT Ulil Albab"
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                  E-RAPOR SDIT ULIL ALBAB
                </h1>
                <p className="text-black text-sm font-light">
                  Login pada akun terdaftar
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="flex items-center text-black text-sm font-medium mb-2.5">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 placeholder-gray-400"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="flex items-center text-black text-sm font-medium mb-2.5">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password Anda"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 placeholder-gray-400"
                  />
                </div>

                {/* Role Field */}
                <div>
                  <label className="flex items-center text-black text-sm font-medium mb-2.5">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 cursor-pointer"
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="wali_kelas">Wali Kelas</option>
                  </select>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 mt-8"
                >
                  LOGIN
                </button>
              </div>

              {/* Footer Text */}
              <div className="text-center mt-6">
                <p className="text-xs text-black font-light drop-shadow">
                  © 2025 SDIT Ulil Albab. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}