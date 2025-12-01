"use client";

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, X, EyeOff, Plus } from 'lucide-react';

export default function DataAdminPage() {
  const [adminData, setAdminData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const result = await res.json();
        setAdminData(result.data || []);
      } else {
        alert('Gagal memuat data admin');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const [formData, setFormData] = useState({
    email_sekolah: '',
    nama_lengkap: '',
    password: '',
    niy: '',
    nuptk: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    no_telepon: '',
    confirmData: false
  });

  // ✅ VALIDASI FORM
  const validateForm = () => {
    // Validasi email
    if (formData.email_sekolah && !formData.email_sekolah.includes('@')) {
      alert('Format email tidak valid! Harus mengandung @');
      return false;
    }

    // Validasi telepon (hanya angka)
    if (formData.no_telepon && !/^\d+$/.test(formData.no_telepon)) {
      alert('Nomor telepon hanya boleh berisi angka!');
      return false;
    }

    // Validasi required fields
    if (!formData.nama_lengkap.trim()) {
      alert('Nama lengkap harus diisi!');
      return false;
    }

    if (!formData.jenis_kelamin) {
      alert('Jenis kelamin harus dipilih!');
      return false;
    }

    // Validasi password untuk tambah data baru
    if (!editMode && !formData.password) {
      alert('Password harus diisi untuk data baru!');
      return false;
    }

    if (!editMode && formData.password.length < 6) {
      alert('Password minimal 6 karakter!');
      return false;
    }

    return true;
  };

  const handleDetail = (admin) => {
    setSelectedAdmin(admin);
    setShowDetail(true);
  };

  const handleEdit = async (admin) => {
    setFormData({
      email_sekolah: admin.email || admin.email_sekolah || '',
      nama_lengkap: admin.nama || admin.nama_lengkap || '',
      niy: admin.niy || '',
      nuptk: admin.nuptk || '',
      tempat_lahir: admin.tempat_lahir || '',
      tanggal_lahir: admin.tanggal_lahir || '',
      jenis_kelamin: admin.jenis_kelamin || (admin.jenisKelamin === 'LAKI-LAKI' ? 'Laki-laki' : 'Perempuan'),
      alamat: admin.alamat || '',
      no_telepon: admin.no_telepon || admin.telepon || '',
      password: '',
      confirmData: true
    });
    setEditingId(admin.id);
    setEditMode(true);
    setShowTambah(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah anda yakin hapus admin ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/admin/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        alert('Admin berhasil dihapus');
        fetchAdminData();
      } else {
        alert('Gagal menghapus admin');
      }
    } catch (error) {
      console.error(error);
      alert('Error saat hapus data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ PERBAIKAN: FUNCTION handleSubmit YANG SUDAH DIPERBAIKI
  const handleSubmit = async () => {
    if (!formData.confirmData) {
      alert('Harap centang konfirmasi data');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editMode 
        ? `http://localhost:5000/api/admin/admin/${editingId}` 
        : 'http://localhost:5000/api/admin/admin';
      
      const method = editMode ? 'PUT' : 'POST';

      // ✅ PERBAIKAN: Convert semua empty string/undefined ke null
      const payload = {
        nama_lengkap: formData.nama_lengkap.trim() || null,
        email_sekolah: formData.email_sekolah.trim() || null,
        niy: formData.niy.trim() || null,
        nuptk: formData.nuptk.trim() || null,
        tempat_lahir: formData.tempat_lahir.trim() || null,
        tanggal_lahir: formData.tanggal_lahir || null,
        jenis_kelamin: formData.jenis_kelamin || null,
        alamat: formData.alamat.trim() || null,
        no_telepon: formData.no_telepon.trim() || null
      };

      // ✅ Hanya tambah password jika diisi
      if (!editMode || formData.password) {
        payload.password = formData.password || null;
      }

      console.log('🔵 DEBUG - Payload dikirim:', payload);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log('🟡 DEBUG - Response Status:', res.status);
      console.log('🟡 DEBUG - Response Text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: 'Response bukan JSON' };
      }
      
      if (res.ok) {
        alert(editMode ? '✅ Admin berhasil diperbarui!' : '✅ Admin berhasil ditambahkan!');
        setFormData({
          email_sekolah: '',
          nama_lengkap: '',
          password: '',
          niy: '',
          nuptk: '',
          tempat_lahir: '',
          tanggal_lahir: '',
          jenis_kelamin: '',
          alamat: '',
          no_telepon: '',
          confirmData: false
        });
        setShowTambah(false);
        setEditMode(false);
        setEditingId(null);
        fetchAdminData();
      } else {
        console.error('🔴 ERROR - Full Error:', {
          status: res.status,
          statusText: res.statusText,
          responseText: responseText,
          responseData: responseData
        });
        
        let errorMessage = `❌ Gagal ${editMode ? 'memperbarui' : 'menambah'} data admin!\n\n`;
        errorMessage += `Status: ${res.status} ${res.statusText}\n`;
        
        if (responseData.message) {
          errorMessage += `Pesan: ${responseData.message}\n`;
        }
        if (responseData.error) {
          errorMessage += `Error: ${responseData.error}\n`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('🔴 NETWORK ERROR:', error);
      alert('🌐 Gagal menghubungi server. Pastikan backend berjalan di port 5000.');
    }
  };

  const handleReset = () => {
    setFormData({
      email_sekolah: '',
      nama_lengkap: '',
      password: '',
      niy: '',
      nuptk: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: '',
      alamat: '',
      no_telepon: '',
      confirmData: false
    });
  };

  const filteredAdmin = adminData.filter(admin =>
    admin.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.niy?.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredAdmin.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmin = filteredAdmin.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          «
        </button>
      );
    }

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${
              currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${
            currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(<span key="dots1" className="px-2 text-gray-600">...</span>);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${
              currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="dots2" className="px-2 text-gray-600">...</span>);
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${
            currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          »
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (showTambah) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Admin</h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editMode ? 'Edit Data Admin' : 'Tambah Data Admin'}
              </h2>
              <button
                onClick={() => {
                  setShowTambah(false);
                  setEditMode(false);
                  setEditingId(null);
                  handleReset();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  placeholder="Ketik Nama Lengkap"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Akun</label>
                <input
                  type="email"
                  name="email_sekolah"
                  value={formData.email_sekolah}
                  onChange={handleInputChange}
                  placeholder="contoh: email@sekolah.com"
                  className={`w-full border rounded px-4 py-2 ${
                    formData.email_sekolah && !formData.email_sekolah.includes('@') 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                />
                {formData.email_sekolah && !formData.email_sekolah.includes('@') && (
                  <p className="text-red-500 text-xs mt-1">Format email harus mengandung @</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">NIY</label>
                <input
                  type="text"
                  name="niy"
                  value={formData.niy}
                  onChange={handleInputChange}
                  placeholder="Ketik NIY"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {editMode ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password Akun'} 
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editMode ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                    className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
                    required={!editMode}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!editMode && formData.password && formData.password.length < 6 && (
                  <p className="text-red-500 text-xs mt-1">Password minimal 6 karakter</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">NUPTK</label>
                <input
                  type="text"
                  name="nuptk"
                  value={formData.nuptk}
                  onChange={handleInputChange}
                  placeholder="Ketik NUPTK"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleInputChange}
                  placeholder="Ketik Tempat Lahir"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  required
                >
                  <option value="">-- Pilih --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Ketik Alamat Lengkap"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telepon</label>
                <input
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={(e) => {
                    // Hanya allow angka
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, no_telepon: value }));
                  }}
                  placeholder="Contoh: 08123456789"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
                {formData.no_telepon && !/^\d+$/.test(formData.no_telepon) && (
                  <p className="text-red-500 text-xs mt-1">Hanya boleh angka</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmData"
                  checked={formData.confirmData}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded transition"
              >
                Simpan
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setShowTambah(false);
                  setEditMode(false);
                  setEditingId(null);
                  handleReset();
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Admin</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTambah(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Tambah Admin
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Tampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-700">data</span>
            </div>
            <input
              type="text"
              placeholder="Cari nama atau NIY..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-4 py-2 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left">No.</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">L/P</th>
                  <th className="px-4 py-3 text-left">NIY</th>
                  <th className="px-4 py-3 text-left">NUPTK</th>
                  <th className="px-4 py-3 text-left">Status Admin</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentAdmin.length > 0 ? (
                  currentAdmin.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{startIndex + index + 1}</td>
                      <td className="px-4 py-3">{admin.nama || admin.nama_lengkap}</td>
                      <td className="px-4 py-3">{(admin.jenis_kelamin || admin.jenisKelamin)?.charAt(0) || '-'}</td>
                      <td className="px-4 py-3">{admin.niy || '-'}</td>
                      <td className="px-4 py-3">{admin.nuptk || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          admin.statusAdmin === 'Aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.statusAdmin || 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDetail(admin)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(admin)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      {adminData.length === 0 ? 'Tidak ada data admin' : 'Data tidak ditemukan'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredAdmin.length)} dari {filteredAdmin.length} data
            </div>
            <div className="flex gap-1">{renderPagination()}</div>
          </div>
        </div>
      </div>

      {showDetail && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Admin</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{selectedAdmin.nama || selectedAdmin.nama_lengkap}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Status Admin</span>
                  <span className="mr-4">:</span>
                  <span className={`px-3 py-1 rounded text-sm ${
                    selectedAdmin.statusAdmin === 'Aktif' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {selectedAdmin.statusAdmin || 'Tidak Aktif'}
                  </span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NIY</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.niy || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NUPTK</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.nuptk || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Jenis Kelamin</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.jenis_kelamin || selectedAdmin.jenisKelamin || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Telepon</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.no_telepon || selectedAdmin.telepon || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Email</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.email || selectedAdmin.email_sekolah || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Alamat</span>
                  <span className="mr-4">:</span>
                  <span>{selectedAdmin.alamat || '-'}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedAdmin);
                    setShowDetail(false);
                  }}
                  className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}