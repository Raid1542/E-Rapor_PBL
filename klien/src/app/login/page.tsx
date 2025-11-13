"use client";

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email_sekolah: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email_sekolah;
    const password = formData.password;
    const role = formData.role;

    // Validasi
    if (!email.trim() || !password || !role) {
      setError("Email, password, dan role wajib diisi");
      return;
    }

    console.log("📧 Email:", JSON.stringify(email));
    console.log("🔐 Password:", password.length, "karakter");
    console.log("👤 Role:", role);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_sekolah: email.trim(),
          password: password,
          role: role,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("❌ Error dari backend:", data.message);
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      console.log("✅ Login berhasil:", data);

      // Simpan token
      localStorage.setItem("token", data.token);
      
      // Simpan user data
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect berdasarkan role menggunakan window.location
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "guru_kelas") {
        window.location.href = "/guru-kelas/dashboard";
      } else if (role === "guru_bidang_studi") {
        window.location.href = "/guru-bidang-studi/dashboard";
      }

    } catch (err) {
      console.error("💥 Error koneksi:", err);

      setError("Gagal terhubung ke server. Silahkan coba lagi");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = name === 'email_sekolah' ? value.trim() : value;

    setFormData({
      ...formData,
      [name]: trimmedValue,
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
        <div className="absolute inset-0 glass-overlay"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {/* Logo */}
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

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
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
                    name="email_sekolah"
                    value={formData.email_sekolah}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-gray-800 bg-gray-50 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Password */}
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
                    required
                  />
                </div>

                {/* Role */}
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
                    required
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="guru_kelas">Guru Kelas</option>
                    <option value="guru_bidang_studi">Guru Bidang Studi</option>
                  </select>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "LOGIN"}
                </button>
              </form>

              {/* Footer */}
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