"use client"

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Filter, X } from 'lucide-react';

const DataPembelajaran = () => {
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPembelajaran, setSelectedPembelajaran] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const mataPelajaranList = [
    'Pendidikan Agama Islam',
    'Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'IPAS',
    'Seni Budaya',
    'Bahasa Inggris',
    'Bahasa Arab',
    'Penjaskes',
    'Seni Budaya Melayu',
    'Tahfizt',
    'Tilawah',
    'Koding & KA'
  ];

  const kelasList = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
  
  const guruList = [
    'Dian Mapel, S.Pd',
    'Cahyono Nashiruddin S.T.',
    'Karman Kawaca Kurniawan S.Pd'
  ];

  const [dataPembelajaran, setDataPembelajaran] = useState([
    { id: 1, mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti', kelas: 'Kelas 1', guru: 'Dian Mapel, S.Pd' },
    { id: 2, mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti', kelas: 'Kelas 2', guru: 'Cahyono Nashiruddin S.T.' },
    { id: 3, mataPelajaran: 'Pendidikan Pancasila', kelas: 'Kelas 1', guru: 'Dian Mapel, S.Pd' },
    { id: 4, mataPelajaran: 'Bahasa Indonesia', kelas: 'Kelas 1', guru: 'Dian Mapel, S.Pd' },
    { id: 5, mataPelajaran: 'Ilmu Pengetahuan Alam', kelas: 'Kelas 1', guru: 'Dian Mapel, S.Pd' },
    { id: 6, mataPelajaran: 'Ilmu Pengetahuan Sosial', kelas: 'Kelas 1', guru: 'Karman Kawaca Kurniawan S.Pd' }
  ]);

  const [formPembelajaran, setFormPembelajaran] = useState({
    kelas: '',
    mataPelajaran: '',
    guru: ''
  });

  const handleEditPembelajaran = (item) => {
    setSelectedPembelajaran(item);
    setFormPembelajaran({
      kelas: item.kelas,
      mataPelajaran: item.mataPelajaran,
      guru: item.guru
    });
    setShowEditModal(true);
  };

  const handleTambahPembelajaran = () => {
    setFormPembelajaran({
      kelas: '',
      mataPelajaran: '',
      guru: ''
    });
    setShowTambahModal(true);
  };

  const handleDeletePembelajaran = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setDataPembelajaran(dataPembelajaran.filter(item => item.id !== id));
    }
  };

  const handleSimpanTambah = () => {
    if (formPembelajaran.kelas && formPembelajaran.mataPelajaran && formPembelajaran.guru) {
      const newData = {
        id: dataPembelajaran.length + 1,
        ...formPembelajaran
      };
      setDataPembelajaran([...dataPembelajaran, newData]);
      setShowTambahModal(false);
      alert('Data berhasil ditambahkan!');
    } else {
      alert('Mohon lengkapi semua field yang wajib diisi!');
    }
  };

  const handleSimpanEdit = () => {
    const updatedData = dataPembelajaran.map(item =>
      item.id === selectedPembelajaran.id
        ? { ...item, ...formPembelajaran }
        : item
    );
    setDataPembelajaran(updatedData);
    setShowEditModal(false);
    alert('Data berhasil diupdate!');
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Pembelajaran</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleTambahPembelajaran}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Tambah Pembelajaran
            </button>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Filter size={20} />
              Filter Data
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Tampilkan</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">No.</th>
                  <th className="px-6 py-4 text-left font-semibold">Mata Pelajaran</th>
                  <th className="px-6 py-4 text-left font-semibold">Kelas</th>
                  <th className="px-6 py-4 text-left font-semibold">Guru Pengampu</th>
                  <th className="px-6 py-4 text-left font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataPembelajaran.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item.mataPelajaran}</td>
                    <td className="px-6 py-4">{item.kelas}</td>
                    <td className="px-6 py-4">{item.guru}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPembelajaran(item)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePembelajaran(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition"
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
              Menampilkan 1 - 6 dari 6 data
            </div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">«</button>
              <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Pembelajaran */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Tambah Data Pembelajaran</h2>
              <button
                onClick={() => setShowTambahModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4 flex items-center justify-between">
                <span>* adalah kolom yang wajib diisi!</span>
                <button className="text-blue-600 hover:text-blue-800">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.kelas}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, kelas: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih --</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas} value={kelas}>{kelas}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.mataPelajaran}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, mataPelajaran: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih --</option>
                  {mataPelajaranList.map((mapel) => (
                    <option key={mapel} value={mapel}>{mapel}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pengampu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.guru}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, guru: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih --</option>
                  {guruList.map((guru) => (
                    <option key={guru} value={guru}>{guru}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSimpanTambah}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded transition"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Pembelajaran */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Edit Data Pembelajaran</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4 flex items-center justify-between">
                <span>* adalah kolom yang wajib diisi!</span>
                <button className="text-blue-600 hover:text-blue-800">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.kelas}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, kelas: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {kelasList.map((kelas) => (
                    <option key={kelas} value={kelas}>{kelas}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.mataPelajaran}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, mataPelajaran: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mataPelajaranList.map((mapel) => (
                    <option key={mapel} value={mapel}>{mapel}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pengampu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPembelajaran.guru}
                  onChange={(e) => setFormPembelajaran({...formPembelajaran, guru: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {guruList.map((guru) => (
                    <option key={guru} value={guru}>{guru}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSimpanEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded transition"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPembelajaran;