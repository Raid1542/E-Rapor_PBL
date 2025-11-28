"use client";

import { useState, useEffect } from 'react';

export default function DataSekolahPage() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    namaSekolah: '',
    npsn: '',
    nss: '',
    kodePos: '',
    telepon: '',
    alamat: '',
    email: '',
    website: '',
    kepalaSekolah: '',
    niyKepalaSekolah: '', 
    confirmData: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔁 Fetch data sekolah saat halaman dimuat
  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/sekolah', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const s = data.data || {};

          setFormData({
            namaSekolah: s.nama_sekolah || 'SDN 1 INDONESIA',
            npsn: s.npsn || '24243243241234',
            nss: s.nss || '2423414',
            kodePos: s.kode_pos || '43423',
            telepon: s.telepon || '085505532851',
            alamat: s.alamat || 'Jl. Indonesia No.17',
            email: s.email || 'sdn1indonesia@gmail.com',
            website: s.website || 'google.com',
            kepalaSekolah: s.kepala_sekolah || 'Erik Santoso, S.Pd',
            niyKepalaSekolah: s.niy_kepala_sekolah || '1900002148149320',
            confirmData: false
          });

          // Tampilkan logo jika ada
          if (s.logo_path) {
            setLogoPreview(`http://localhost:5000${s.logo_path}`);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data sekolah:', err);
        alert('Gagal memuat data sekolah');
      } finally {
        setLoading(false);
      }
    };

    fetchSekolah();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Simpan data sekolah
  const handleSubmit = async () => {
    if (!formData.confirmData) {
      alert('Mohon centang konfirmasi data sebelum menyimpan');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/sekolah', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          namaSekolah: formData.namaSekolah,
          npsn: formData.npsn,
          nss: formData.nss,
          alamat: formData.alamat,
          kodePos: formData.kodePos,
          telepon: formData.telepon,
          email: formData.email,
          website: formData.website,
          kepalaSekolah: formData.kepalaSekolah,
          niyKepalaSekolah: formData.niyKepalaSekolah
        })
      });

      if (res.ok) {
        alert('Data sekolah berhasil disimpan!');
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menyimpan data sekolah');
      }
    } catch (err) {
      console.error('Error simpan data:', err);
      alert('Gagal menghubungi server');
    } finally {
      setSaving(false);
    }
  };


   // ✅ Upload logo
  const handleUpdateLogo = async () => {
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput?.files[0];

    if (!file) {
      alert('Pilih file logo terlebih dahulu');
      return;
    }

    setUploading(true);
    const formDataLogo = new FormData();
    formDataLogo.append('logo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/sekolah/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataLogo
      });

      if (res.ok) {
        const data = await res.json();
        setLogoPreview(`http://localhost:5000${data.logoPath}`);
        alert('Logo berhasil diupdate!');
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mengupload logo');
      }
    } catch (err) {
      console.error('Error upload logo:', err);
      alert('Gagal menghubungi server');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Memuat data sekolah...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Sekolah</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Data Sekolah */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Data Sekolah</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nama Sekolah</label>
              <input
                type="text"
                name="namaSekolah"
                value={formData.namaSekolah}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">NPSN</label>
              <input
                type="text"
                name="npsn"
                value={formData.npsn}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">NSS</label>
              <input
                type="text"
                name="nss"
                value={formData.nss}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Kode POS</label>
              <input
                type="text"
                name="kodePos"
                value={formData.kodePos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Telepon</label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Kepala Sekolah</label>
              <input
                type="text"
                name="kepalaSekolah"
                value={formData.kepalaSekolah}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">NIY Kepala Sekolah</label>
              <input
                type="text"
                name="niyKepalaSekolah"
                value={formData.niyKepalaSekolah}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="confirmData"
                name="confirmData"
                checked={formData.confirmData}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label htmlFor="confirmData" className="text-sm">
                Saya yakin akan mengubah data tersebut
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
              >
                {saving ? 'Menyimpan...' : 'simpan'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Logo Sekolah */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Logo Sekolah</h2>
          
          <div className="bg-gray-200 rounded-lg p-8 mb-4">
            <p className="text-center text-gray-700 font-semibold mb-4">Logo</p>
            <div className="flex justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 italic mb-3">Ganti logo sekolah</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <button
            onClick={handleUpdateLogo}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
          >
            {uploading ? 'Mengupload...' : 'update Logo'}
          </button>
        </div>
      </div>
    </div>
  );
}