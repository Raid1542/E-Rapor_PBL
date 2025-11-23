"use client"

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Filter, X } from 'lucide-react';

const DataPembelajaran = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleTambah = () => {
    setIsEditing(false);
    setFormPembelajaran({ kelas: '', mataPelajaran: '', guru: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setSelectedPembelajaran(item);
    setFormPembelajaran({
      kelas: item.kelas,
      mataPelajaran: item.mataPelajaran,
      guru: item.guru
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setDataPembelajaran(dataPembelajaran.filter(item => item.id !== id));
    }
  };

  const handleSimpan = () => {
    if (formPembelajaran.kelas && formPembelajaran.mataPelajaran && formPembelajaran.guru) {
      if (isEditing) {
        const updatedData = dataPembelajaran.map(item =>
          item.id === selectedPembelajaran.id
            ? { ...item, ...formPembelajaran }
            : item
        );
        setDataPembelajaran(updatedData);
        alert('Data berhasil diupdate!');
      } else {
        const newData = {
          id: dataPembelajaran.length + 1,
          ...formPembelajaran
        };
        setDataPembelajaran([...dataPembelajaran, newData]);
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
    setSelectedPembelajaran(null);
    setFormPembelajaran({ kelas: '', mataPelajaran: '', guru: '' });
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Pembelajaran</h1>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Data Pembelajaran' : 'Tambah Data Pembelajaran'}
            </h2>
            <button
              onClick={handleBatal}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formPembelajaran.kelas}
                onChange={(e) => setFormPembelajaran({...formPembelajaran, kelas: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((kelas) => (
                  <option key={kelas} value={kelas}>{kelas}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formPembelajaran.mataPelajaran}
                onChange={(e) => setFormPembelajaran({...formPembelajaran, mataPelajaran: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {mataPelajaranList.map((mapel) => (
                  <option key={mapel} value={mapel}>{mapel}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guru Pengampu <span className="text-red-500">*</span>
              </label>
              <select
                value={formPembelajaran.guru}
                onChange={(e) => setFormPembelajaran({...formPembelajaran, guru: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Guru --</option>
                {guruList.map((guru) => (
                  <option key={guru} value={guru}>{guru}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input type="checkbox" className="w-4 h-4" />
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
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
    </>
  );
};

export default DataPembelajaran;