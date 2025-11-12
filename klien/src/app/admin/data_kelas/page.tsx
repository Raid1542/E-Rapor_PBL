"use client";

import { useState } from 'react';
import { Pencil, Trash2, X, Plus, Filter } from 'lucide-react';

const dummyKelas = [
  { id: 1, idKelas: 1, namaKelas: 'Kelas 1', waliKelas: 'Maman Walas, S.Kom', tahunPelajaran: '2024/2025 - Genap', tingkat: 1, jumlahSiswa: 29 },
  { id: 2, idKelas: 2, namaKelas: 'Kelas 2', waliKelas: 'Calista Nasyiah', tahunPelajaran: '2024/2025 - Genap', tingkat: 2, jumlahSiswa: 41 },
  { id: 3, idKelas: 3, namaKelas: 'Kelas 3', waliKelas: 'Fitria Mayasari', tahunPelajaran: '2024/2025 - Genap', tingkat: 3, jumlahSiswa: 33 },
  { id: 4, idKelas: 4, namaKelas: 'Kelas 4', waliKelas: 'Jane Anggraini', tahunPelajaran: '2024/2025 - Genap', tingkat: 4, jumlahSiswa: 41 },
  { id: 5, idKelas: 5, namaKelas: 'Kelas 5', waliKelas: 'Lili Ella Maryati', tahunPelajaran: '2024/2025 - Genap', tingkat: 5, jumlahSiswa: 28 },
  { id: 6, idKelas: 6, namaKelas: 'Kelas 6', waliKelas: 'Karman Kawaca Kurniawan S.Pd', tahunPelajaran: '2024/2025 - Genap', tingkat: 6, jumlahSiswa: 29 },
  { id: 7, idKelas: 7, namaKelas: 'Kelas 1A', waliKelas: 'Ahmad Santoso, S.Pd', tahunPelajaran: '2024/2025 - Genap', tingkat: 1, jumlahSiswa: 25 },
  { id: 8, idKelas: 8, namaKelas: 'Kelas 2A', waliKelas: 'Siti Nurhaliza, M.Pd', tahunPelajaran: '2024/2025 - Genap', tingkat: 2, jumlahSiswa: 30 },
  { id: 9, idKelas: 9, namaKelas: 'Kelas 3A', waliKelas: 'Budi Santoso, S.Pd', tahunPelajaran: '2024/2025 - Genap', tingkat: 3, jumlahSiswa: 28 },
  { id: 10, idKelas: 10, namaKelas: 'Kelas 4A', waliKelas: 'Dewi Lestari, M.Pd', tahunPelajaran: '2024/2025 - Genap', tingkat: 4, jumlahSiswa: 32 },
];

const dummyWaliKelas = [
  'Maman Walas, S.Kom',
  'Calista Nasyiah',
  'Fitria Mayasari',
  'Jane Anggraini',
  'Lili Ella Maryati',
  'Karman Kawaca Kurniawan S.Pd',
  'Ahmad Santoso, S.Pd',
  'Siti Nurhaliza, M.Pd',
  'Budi Santoso, S.Pd',
  'Dewi Lestari, M.Pd',
];

const tahunPelajaranOptions = [
  '2024/2025 - Genap',
  '2024/2025 - Ganjil',
  '2023/2024 - Genap',
  '2023/2024 - Ganjil',
];

export default function DataKelasPage() {
  const [showTambah, setShowTambah] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTingkat, setFilterTingkat] = useState('');

  const [formData, setFormData] = useState({
    namaKelas: '',
    waliKelas: '',
    tahunPelajaran: '',
    tingkat: '',
    confirmData: false
  });

  const handleTambahKelas = () => {
    setSelectedKelas(null);
    setFormData({
      namaKelas: '',
      waliKelas: '',
      tahunPelajaran: '',
      tingkat: '',
      confirmData: false
    });
    setShowTambah(true);
  };

  const handleEdit = (kelas) => {
    setSelectedKelas(kelas);
    setFormData({
      namaKelas: kelas.namaKelas,
      waliKelas: kelas.waliKelas,
      tahunPelajaran: kelas.tahunPelajaran,
      tingkat: kelas.tingkat.toString(),
      confirmData: false
    });
    setShowTambah(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
      console.log('Hapus kelas:', id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.confirmData) {
      alert('Mohon centang konfirmasi data sebelum menyimpan');
      return;
    }
    console.log('Submit data:', formData);
    setFormData({
      namaKelas: '',
      waliKelas: '',
      tahunPelajaran: '',
      tingkat: '',
      confirmData: false
    });
    setShowTambah(false);
    setSelectedKelas(null);
  };

  const handleReset = () => {
    setFormData({
      namaKelas: '',
      waliKelas: '',
      tahunPelajaran: '',
      tingkat: '',
      confirmData: false
    });
  };

  const handleFilter = () => {
    setShowFilter(false);
    setCurrentPage(1);
  };

  const filteredKelas = dummyKelas.filter(kelas => {
    const matchSearch = kelas.namaKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       kelas.waliKelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterTingkat === '' || kelas.tingkat.toString() === filterTingkat;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredKelas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKelas = filteredKelas.slice(startIndex, endIndex);

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
            className={`px-3 py-1 border border-gray-300 rounded transition ${
              currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100"
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

  if (showTambah) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Kelas</h1>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedKelas ? 'Edit Data Kelas' : 'Tambah Data Kelas'}
              </h2>
              <button
                onClick={() => {
                  setShowTambah(false);
                  setSelectedKelas(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaKelas"
                  value={formData.namaKelas}
                  onChange={handleInputChange}
                  placeholder="Ketik Nama Kelas"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                />
              </div>
              <div></div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Wali Kelas</label>
                <select
                  name="waliKelas"
                  value={formData.waliKelas}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="">-- Pilih --</option>
                  {dummyWaliKelas.map((wali, idx) => (
                    <option key={idx} value={wali}>{wali}</option>
                  ))}
                </select>
              </div>
              <div></div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tahun Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  name="tahunPelajaran"
                  value={formData.tahunPelajaran}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="">-- Pilih --</option>
                  {tahunPelajaranOptions.map((tahun, idx) => (
                    <option key={idx} value={tahun}>{tahun}</option>
                  ))}
                </select>
              </div>
              <div></div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tingkat <span className="text-red-500">*</span>
                </label>
                <select
                  name="tingkat"
                  value={formData.tingkat}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                >
                  <option value="">-- Pilih --</option>
                  {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                    <option key={tingkat} value={tingkat}>{tingkat}</option>
                  ))}
                </select>
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
                  setSelectedKelas(null);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Kelas</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={handleTambahKelas}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Tambah Kelas
              </button>
            </div>
            <button
              onClick={() => setShowFilter(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Filter size={20} />
              Filter Data
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
                  <th className="px-4 py-3 text-left">ID Kelas</th>
                  <th className="px-4 py-3 text-left">Nama Kelas</th>
                  <th className="px-4 py-3 text-left">Wali Kelas</th>
                  <th className="px-4 py-3 text-left">Tingkat</th>
                  <th className="px-4 py-3 text-left">Jumlah Siswa</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentKelas.map((kelas, index) => (
                  <tr
                    key={kelas.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">{kelas.idKelas}</td>
                    <td className="px-4 py-3">{kelas.namaKelas}</td>
                    <td className="px-4 py-3">{kelas.waliKelas}</td>
                    <td className="px-4 py-3">{kelas.tingkat}</td>
                    <td className="px-4 py-3">{kelas.jumlahSiswa}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(kelas)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(kelas.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Trash2 size={16} />
                          Hapus
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
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredKelas.length)} dari {filteredKelas.length} data
            </div>
            <div className="flex gap-1">{renderPagination()}</div>
          </div>
        </div>
      </div>

      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-semibold">Filter Data</h2>
              <button
                onClick={() => setShowFilter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tingkat Kelas</label>
                  <select
                    value={filterTingkat}
                    onChange={(e) => setFilterTingkat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  >
                    <option value="">-- Semua Tingkat --</option>
                    {[1, 2, 3, 4, 5, 6].map((tingkat) => (
                      <option key={tingkat} value={tingkat}>Tingkat {tingkat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleFilter}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
                  >
                    Terapkan
                  </button>
                  <button
                    onClick={() => {
                      setFilterTingkat('');
                      setShowFilter(false);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}