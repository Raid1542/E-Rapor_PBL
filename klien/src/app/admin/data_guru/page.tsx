"use client";

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Upload, X, EyeOff, ArrowLeft, Plus } from 'lucide-react';



export default function DataGuruPage() {
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/guru");
        const data = await res.json();
        if (res.ok) {
          setGuruList(data.data || []);
        }
      } catch (err) {
        console.error('Error fetch guru:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuru();
  }, []);

  const [formData, setFormData] = useState({
    nama: '',
    niy: '',
    nuptk: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    alamat: '',
    telepon: '',
    email: '',
    password: '',
    roles: [],
    confirmData: false
  });

  const handleDetail = (guru) => {
    setSelectedGuru(guru);
    setShowDetail(true);
  };

  const handleEdit = (guru) => {
    console.log('Edit guru:', guru);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      console.log('Hapus guru:', id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_lengkap: formData.nama,       // ← sesuai kolom di backend
          email_sekolah: formData.email,
          password: formData.password,
          role: "Guru Kelas",                 // ← HARUS ADA!
          niy: formData.niy,
          nuptk: formData.nuptk,
          tempat_lahir: formData.tempatLahir,
          tanggal_lahir: formData.tanggalLahir,
          jenis_kelamin: formData.jenisKelamin,
          alamat: formData.alamat,
          no_telepon: formData.telepon
        })
      });

      if (res.ok) {
        alert("Data guru berhasil ditambahkan");
        setShowTambah(false);
        // Refresh data
        const data = await res.json();
        setGuruList(prev => [...prev, {
          id: data.id,
          nama: formData.nama,
          lp: formData.jenisKelamin === 'LAKI-LAKI' ? 'L' : 'P',
          niy: formData.niy,
          nuptk: formData.nuptk,
          statusGuru: 'AKTIF',
          jenisKelamin: formData.jenisKelamin,
          telepon: formData.telepon,
          alamat: formData.alamat
        }]);
      } else {
        const error = await res.json();
        alert(error.message || "Gagal menambah data guru");
      }
    } catch (err) {
      alert("Gagal terhubung ke server");
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      niy: '',
      nuptk: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      alamat: '',
      telepon: '',
      email: '',
      password: '',
      confirmData: false
    });
  };

  const filteredGuru = guruList.filter(guru =>
    guru.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guru.niy && guru.niy.includes(searchQuery)) ||
    (guru.nuptk && guru.nuptk.includes(searchQuery))
  );

  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGuru = filteredGuru.slice(startIndex, endIndex);

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
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pages.push(
          <span key="dots1" className="px-2 text-gray-600">
            ...
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
          >
            {i}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="dots2" className="px-2 text-gray-600">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 border border-gray-300 rounded transition ${currentPage === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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

  if (showTambah) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Guru</h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tambah Data Guru</h2>
              <button
                onClick={() => setShowTambah(false)}
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
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Ketik Nama"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Akun</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ketik Email"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
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
                  Password Akun <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Ketik Password"
                    className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Tempat Lahir</label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleInputChange}
                  placeholder="Ketik Tempat Lahir"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="">-- Pilih --</option>
                  <option value="LAKI-LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  placeholder="Ketik Alamat"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium mb-2">Telepon</label>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  placeholder="Ketik Telepon"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Role (Hak Akses)
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value="guru kelas"
                    checked={formData.roles.includes('guru kelas')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => {
                        if (e.target.checked) {
                          return { ...prev, roles: [...prev.roles, value] };
                        } else {
                          return { ...prev, roles: prev.roles.filter(r => r !== value) };
                        }
                      });
                    }}
                  />
                  Guru Kelas
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value="guru bidang studi"
                    checked={formData.roles.includes('guru bidang studi')}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => {
                        if (e.target.checked) {
                          return { ...prev, roles: [...prev.roles, value] };
                        } else {
                          return { ...prev, roles: prev.roles.filter(r => r !== value) };
                        }
                      });
                    }}
                  />
                  Guru Bidang Studi
                </label>
              </div>
              {formData.roles.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Pilih minimal satu role</p>
              )}
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
                onClick={() => setShowTambah(false)}
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Guru</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTambah(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Tambah Guru
              </button>
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Upload size={20} />
              Import Data Guru
            </button>
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
              placeholder="Cari..."
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
                  <th className="px-4 py-3 text-left">Status Guru</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentGuru.map((guru, index) => (
                  <tr
                    key={guru.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">{guru.nama}</td>
                    <td className="px-4 py-3">{guru.lp}</td>
                    <td className="px-4 py-3">{guru.niy || '-'}</td>
                    <td className="px-4 py-3">{guru.nuptk || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{guru.statusGuru}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDetail(guru)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(guru)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredGuru.length)} dari {filteredGuru.length} data
            </div>
            <div className="flex gap-1">{renderPagination()}</div>
          </div>
        </div>
      </div>

      {showDetail && selectedGuru && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Detail Guru</h2>
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
                <h3 className="text-xl font-semibold">{selectedGuru.nama}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Status Guru</span>
                  <span className="mr-4">:</span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    {selectedGuru.statusGuru}
                  </span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NIY</span>
                  <span className="mr-4">:</span>
                  <span>{selectedGuru.niy || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">NUPTK</span>
                  <span className="mr-4">:</span>
                  <span>{selectedGuru.nuptk || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Jenis Kelamin</span>
                  <span className="mr-4">:</span>
                  <span>{selectedGuru.jenisKelamin}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Telepon</span>
                  <span className="mr-4">:</span>
                  <span>{selectedGuru.telepon || '-'}</span>
                </div>
                <div className="flex border-b pb-2">
                  <span className="w-48 font-semibold">Alamat</span>
                  <span className="mr-4">:</span>
                  <span>{selectedGuru.alamat || '-'}</span>
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
                    handleEdit(selectedGuru);
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