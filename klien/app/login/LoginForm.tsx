'use client';

import { useState, FormEvent } from 'react';
import './login.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Di sini Anda bisa tambahkan logic untuk login
    console.log('Login attempt:', { email, password, role });
    
    // Contoh: redirect atau API call
    // router.push('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                {/* GANTI 'logo.png' dengan nama file logo Anda */}
                <img src="/LogoUA.jpg" alt="Logo SDIT Ulil Albab" className="logo-image" />
              </div>
            </div>
            <h1 className="login-title">E-RAPOR SDIT ULIL ALBAB</h1>
            <p className="login-subtitle">Login pada akun terdaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Email</span>
              </div>
              <input
                type="email"
                className="input-field"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Password</span>
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Role</span>
              </div>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Pilih Role</option>
                <option value="admin">Admin</option>
                <option value="wali">Wali Kelas</option>
                <option value="guru">Guru Bidang Studi</option>
              </select>
            </div>

            <button type="submit" className="login-btn">
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}