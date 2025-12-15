"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, X } from 'lucide-react';

interface UserProfile {
  id: number;
  role: string;
  nama_lengkap: string;
  email_sekolah: string;
  roles: string[];
  niy?: string;
  nuptk?: string;
  jenis_kelamin?: string;
  alamat?: string;
  no_telepon?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string | null;
  profileImage?: string;
}

const ProfilePage = () => {
  // State profil
  const [formData, setFormData] = useState({
    nama: '',
    nuptk: '',
    niy: '',
    jenisKelamin: 'Laki-laki',
    telepon: '',
    email: '',
    alamat: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null); // URL foto dari server
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Preview lokal saat upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);


  // State password
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  // === Ambil data user dari localStorage saat mount ===
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');

      if (!token || !storedUser) {
        window.location.href = '/login';
        return;
      }

      try {
        const userData: UserProfile = JSON.parse(storedUser);

        // Jika tidak ada profileImage di localStorage, ambil dari API
        if (!userData.profileImage || !userData.profileImage.trim()) {
          const res = await fetch(`http://localhost:5000/api/admin/admin/${userData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const apiResponse = await res.json();
            const freshData = apiResponse.data; // karena respons format { success, data: {...} }

            // Simpan kembali ke localStorage
            const updatedUser = {
              ...userData,
              profileImage: freshData.profileImage || null
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setProfileImage(freshData.profileImage ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${freshData.profileImage}` : null);
          }
        } else {
          // Jika ada di localStorage, langsung pakai
          setProfileImage(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${userData.profileImage}`);
        }

        const initialData = {
          nama: userData.nama_lengkap || '',
          nuptk: userData.nuptk || '',
          niy: userData.niy || '',
          jenisKelamin: userData.jenis_kelamin || 'Laki-laki',
          telepon: userData.no_telepon || '',
          email: userData.email_sekolah || '',
          alamat: userData.alamat || ''
        };

        setFormData(initialData);
        setInitialFormData(initialData);
      } catch (e) {
        console.error('Gagal memuat data profil:', e);
      }
    };

    fetchProfile();
  }, []);

  // === Handler Profil ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // === Simpan Profil ke Backend ===
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 1. Cek apakah ada perubahan
    if (initialFormData && JSON.stringify(initialFormData) === JSON.stringify(formData)) {
      alert('Tidak ada perubahan data.');
      return;
    }

    if (!isConfirmed) {
      alert('Harap centang konfirmasi terlebih dahulu!');
      return;
    }

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    if (!token || !storedUser) {
      alert('Sesi login tidak valid. Silakan login ulang.');
      return;
    }

    try {
      const userData: UserProfile = JSON.parse(storedUser);
      const userId = userData.id;

      const response = await fetch(`http://localhost:5000/api/admin/admin/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_lengkap: formData.nama,
          email_sekolah: formData.email,
          niy: formData.niy,
          nuptk: formData.nuptk,
          jenis_kelamin: formData.jenisKelamin,
          no_telepon: formData.telepon,
          alamat: formData.alamat,
          status: 'aktif'
        })
      });

      if (response.ok) {
        // ✅ 2. Update localStorage
        const updatedUser: UserProfile = {
          ...userData,
          nama_lengkap: formData.nama,
          email_sekolah: formData.email,
          niy: formData.niy,
          nuptk: formData.nuptk,
          jenis_kelamin: formData.jenisKelamin,
          no_telepon: formData.telepon,
          alamat: formData.alamat
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // ✅ 3. Beri tahu Header (jika ada)
        window.dispatchEvent(new Event('userDataUpdated'));

        alert('✅ Profil berhasil diperbarui!');

        // ✅ 4. REFRESH HALAMAN SETELAH SIMPAN
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server');
    }
  };

  // === Ganti Password ===
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Semua kolom kata sandi wajib diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Kata sandi baru dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword.length < 8) {
      alert('Kata sandi baru minimal 8 karakter');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login tidak valid. Silakan login ulang.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/admin/ganti-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const result = await response.json();
      if (response.ok) {
        alert('Kata sandi berhasil diubah!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });

        // ✅ LOGOUT OTOMATIS SETELAH GANTI PASSWORD
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login'; // Redirect ke halaman login
      } else {
        alert(result.message || 'Gagal mengubah kata sandi');
      }
    } catch (err) {
      console.error('Error ganti password:', err);
      alert('Gagal terhubung ke server');
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Hanya file JPG, PNG, atau WebP yang diizinkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Ukuran file maksimal 5MB');
      return;
    }

    // Preview lokal
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload ke server
    setIsUploading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi login tidak valid.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await fetch('http://localhost:5000/api/admin/admin/upload-foto', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (response.ok && result.fotoPath) {
        // ✅ Update localStorage dengan path baru
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.profileImage = result.fotoPath;
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        window.dispatchEvent(new Event('profileImageUpdated'));

        // Update state dengan URL lengkap
        setProfileImage(`http://localhost:5000${result.fotoPath}`);
        setPreviewImage(null);
        alert('Foto profil berhasil diupload!');

      } else {
        throw new Error(result.message || 'Upload gagal');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal mengupload foto');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Card */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-full bg-gray-300 overflow-hidden mb-3">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : profileImage ? (
                    <img src={profileImage} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black text-lg font-semibold flex items-center justify-center w-full h-full">
                      {(formData.nama || '??')
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0]?.toUpperCase() || '')
                        .join('') || '??'}
                    </span>
                  )}
                </div>

                {/* Tombol Ganti Foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-70"
                >
                  <Camera size={14} />
                  {isUploading ? 'Mengupload...' : 'Ganti Foto'}
                </button>

                {/* Input File Hidden */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadPhoto}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Profil & Password */}
        <div className="flex-1 space-y-8">
          {/* Edit Profil */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-5">Edit Profil</h2>
            <form onSubmit={handleSubmitProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                    <input
                      type="text"
                      name="nuptk"
                      value={formData.nuptk}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIY</label>
                    <input
                      type="text"
                      name="niy"
                      value={formData.niy}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                    <input
                      type="tel"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-200">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="confirm" className="text-sm text-gray-700">
                  Saya yakin akan mengubah data tersebut
                </label>
              </div>
              <div className="mt-5">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded text-sm transition"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Ganti Kata Sandi */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Ganti Kata Sandi</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kata Sandi Lama
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan kata sandi lama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm transition"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;