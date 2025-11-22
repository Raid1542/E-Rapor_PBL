"use client";

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Filter, X, Settings } from 'lucide-react';

const DataMataPelajaran = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const kelompokList = [
    'Mata Pelajaran Wajib',
    'Seni dan Budaya',
    'Muatan Lokal'
  ];

  const [dataMapel, setDataMapel] = useState([
    { id: 1, namaMapel: 'Pendidikan Agama Islam dan Budi Pekerti', singkatan: 'PAIBP', kelompok: 'Mata Pelajaran Wajib' },
    { id: 2, namaMapel: 'Pendidikan Pancasila', singkatan: 'PP', kelompok: 'Mata Pelajaran Wajib' },
    { id: 3, namaMapel: 'Bahasa Indonesia', singkatan: 'BINDO', kelompok: 'Mata Pelajaran Wajib' },
    { id: 4, namaMapel: 'Ilmu Pengetahuan Alam', singkatan: 'IPA', kelompok: 'Mata Pelajaran Wajib' },
    { id: 5, namaMapel: 'Ilmu Pengetahuan Sosial', singkatan: 'IPS', kelompok: 'Mata Pelajaran Wajib' },
    { id: 6, namaMapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', singkatan: 'PJOK', kelompok: 'Mata Pelajaran Wajib' },
    { id: 7, namaMapel: 'Seni Tari', singkatan: 'TARI', kelompok: 'Seni dan Budaya' },
    { id: 8, namaMapel: 'Seni Musik', singkatan: 'MUSIK', kelompok: 'Seni dan Budaya' },
    { id: 9, namaMapel: 'Seni Teater', singkatan: 'TEATER', kelompok: 'Seni dan Budaya' },
    { id: 10, namaMapel: 'Seni Lukis', singkatan: 'LUKIS', kelompok: 'Seni dan Budaya' },
    { id: 11, namaMapel: 'Matematika', singkatan: 'MTK', kelompok: 'Mata Pelajaran Wajib' }
  ]);

  const [formMapel, setFormMapel] = useState({
    namaMapel: '',
    singkatan: '',
    kelompok: ''
  });

  // Filter data berdasarkan search
  const filteredData = dataMapel.filter(item =>
    item.namaMapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.singkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kelompok.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleTambah = () => {
    setIsEditing(false);
    setFormMapel({ namaMapel: '', singkatan: '', kelompok: '' });
    setIsConfirmed(false);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setSelectedMapel(item);
    setFormMapel({
      namaMapel: item.namaMapel,
      singkatan: item.singkatan,
      kelompok: item.kelompok
    });
    setIsConfirmed(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setDataMapel(dataMapel.filter(item => item.id !== id));
    }
  };

  const handleSimpan = () => {
    if (!isConfirmed) {
      alert('Harap konfirmasi data terlebih dahulu!');
      return;
    }
    if (formMapel.namaMapel && formMapel.singkatan && formMapel.kelompok) {
      if (isEditing) {
        const updatedData = dataMapel.map(item =>
          item.id === selectedMapel.id ? { ...item, ...formMapel } : item
        );
        setDataMapel(updatedData);
        alert('Data berhasil diupdate!');
      } else {
        const newData = {
          id: Math.max(...dataMapel.map(d => d.id)) + 1,
          ...formMapel
        };
        setDataMapel([...dataMapel, newData]);
        alert('Data berhasil ditambahkan!');
      }
      handleBatal();
    } else {
      alert('Mohon lengkapi semua field yang wajib diisi!');
    }
  };

  const handleBatal = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedMapel(null);
    setFormMapel({ namaMapel: '', singkatan: '', kelompok: '' });
    setIsConfirmed(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Mata Pelajaran</h1>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Data Mata Pelajaran' : 'Tambah Data Mata Pelajaran'}
            </h2>
            <button onClick={handleBatal} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formMapel.namaMapel}
                onChange={(e) => setFormMapel({...formMapel, namaMapel: e.target.value})}
                placeholder="Masukkan nama mata pelajaran"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Singkatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formMapel.singkatan}
                onChange={(e) => setFormMapel({...formMapel, singkatan: e.target.value.toUpperCase()})}
                placeholder="Contoh: MTK, IPA, IPS"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelompok Mapel <span className="text-red-500">*</span>
              </label>
              <select
                value={formMapel.kelompok}
                onChange={(e) => setFormMapel({...formMapel, kelompok: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelompok --</option>
                {kelompokList.map((kel) => (
                  <option key={kel} value={kel}>{kel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSimpan}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg transition"
              >
                Simpan
              </button>
              <button
                onClick={handleBatal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-2 rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleTambah}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Tambah Mapel
          </button>
          <div className="flex gap-2">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Filter size={20} />
              Filter Data
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Settings size={20} />
              Kelompok Mapel
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
                <th className="px-4 py-3 text-left font-semibold w-16">No.</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Mapel</th>
                <th className="px-4 py-3 text-left font-semibold w-32">Singkatan</th>
                <th className="px-4 py-3 text-left font-semibold">Kelompok</th>
                <th className="px-4 py-3 text-left font-semibold w-48">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3">{item.namaMapel}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{item.singkatan}</td>
                  <td className="px-4 py-3">{item.kelompok}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition text-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition text-sm"
                      >
                        <Trash2 size={14} />
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
            Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50"
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded transition ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMataPelajaran;