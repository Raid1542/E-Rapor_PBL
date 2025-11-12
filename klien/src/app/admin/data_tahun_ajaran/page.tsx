"use client"

import React, { useState } from 'react';
import { Calendar, Pencil } from 'lucide-react';

const DataTahunPelajaran = () => {
  const [showEditModal, setShowEditModal] = useState(false);

  const [tahunPelajaran, setTahunPelajaran] = useState([
    {
      id: 1,
      tahun: '2024/2025',
      semester: 'Genap',
      tempatPembagian: 'Tangerang',
      tanggalPembagian: 'Senin, 16 Juni 2025'
    }
  ]);

  const [formTahun, setFormTahun] = useState({
    tahun1: '2024',
    tahun2: '2025',
    semester: 'Genap',
    tempatPembagian: 'Tangerang',
    tanggalPembagian: '06/16/2025'
  });

  const handleSimpan = () => {
    const updatedData = tahunPelajaran.map(item => ({
      ...item,
      tahun: `${formTahun.tahun1}/${formTahun.tahun2}`,
      semester: formTahun.semester,
      tempatPembagian: formTahun.tempatPembagian,
      tanggalPembagian: formTahun.tanggalPembagian
    }));
    setTahunPelajaran(updatedData);
    setShowEditModal(false);
    alert('Data berhasil disimpan!');
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Tahun Pelajaran</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold">No.</th>
                  <th className="px-6 py-4 text-left font-semibold">Tahun Pelajaran</th>
                  <th className="px-6 py-4 text-left font-semibold">Semester</th>
                  <th className="px-6 py-4 text-left font-semibold">Tempat Pembagian Raport</th>
                  <th className="px-6 py-4 text-left font-semibold">Tanggal Pembagian Raport</th>
                  <th className="px-6 py-4 text-left font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tahunPelajaran.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item.tahun}</td>
                    <td className="px-6 py-4">{item.semester}</td>
                    <td className="px-6 py-4">{item.tempatPembagian}</td>
                    <td className="px-6 py-4">{item.tanggalPembagian}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded flex items-center gap-1 transition"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan 1 - 1 dari 1 data
          </div>
        </div>
      </div>

      {/* Modal Edit Tahun Pelajaran */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Data Tapel</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                <div className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                  i
                </div>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Pelajaran <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={formTahun.tahun1}
                    onChange={(e) => setFormTahun({...formTahun, tahun1: e.target.value})}
                    className="border border-gray-300 rounded px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                  />
                  <span className="text-2xl font-bold">/</span>
                  <input
                    type="text"
                    value={formTahun.tahun2}
                    onChange={(e) => setFormTahun({...formTahun, tahun2: e.target.value})}
                    className="border border-gray-300 rounded px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2025"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTahun.semester}
                  onChange={(e) => setFormTahun({...formTahun, semester: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Genap">Genap</option>
                  <option value="Ganjil">Ganjil</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat Pembagian Raport
                </label>
                <input
                  type="text"
                  value={formTahun.tempatPembagian}
                  onChange={(e) => setFormTahun({...formTahun, tempatPembagian: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tangerang"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pembagian Raport
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formTahun.tanggalPembagian}
                    onChange={(e) => setFormTahun({...formTahun, tanggalPembagian: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="06/16/2025"
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Saya yakin sudah mengisi dengan benar</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSimpan}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded transition"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setFormTahun({
                      tahun1: '2024',
                      tahun2: '2025',
                      semester: 'Genap',
                      tempatPembagian: 'Tangerang',
                      tanggalPembagian: '06/16/2025'
                    });
                  }}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-2 rounded transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTahunPelajaran;