'use client';

import React, { useState } from 'react';
import { Pencil, CheckCircle, XCircle } from 'lucide-react';

interface Siswa {
  id: string;
  nama: string;
  nis: string;
  jenis_kelamin: 'L' | 'P';
  catatan: string;
  naik_tingkat: boolean;
}

const initialData: Siswa[] = [
  { id: '1', nama: 'Siswa 1', nis: '12345', jenis_kelamin: 'L', catatan: '', naik_tingkat: true },
  { id: '2', nama: 'Siswa 2', nis: '67890', jenis_kelamin: 'P', catatan: '', naik_tingkat: false },
  { id: '3', nama: 'Ahmad Rizki', nis: '11223', jenis_kelamin: 'L', catatan: 'Siswa yang aktif dan rajin', naik_tingkat: true },
  { id: '4', nama: 'Siti Nurhaliza', nis: '11224', jenis_kelamin: 'P', catatan: 'Prestasi akademik baik', naik_tingkat: true },
  { id: '5', nama: 'Bagas Nasution', nis: '11225', jenis_kelamin: 'L', catatan: 'Perlu bimbingan lebih', naik_tingkat: false },
];

export default function CatatanWaliKelasPage() {
  const [data, setData] = useState<Siswa[]>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [formCatatan, setFormCatatan] = useState<string>('');
  const [formNaik, setFormNaik] = useState<boolean>(false);

  const filteredData = data.filter(siswa => 
    siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.nis.includes(searchQuery)
  );

  const openEdit = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setFormCatatan(siswa.catatan);
    setFormNaik(siswa.naik_tingkat);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedSiswa) {
      const updated = data.map(s => 
        s.id === selectedSiswa.id ? { ...s, catatan: formCatatan, naik_tingkat: formNaik } : s
      );
      setData(updated);
      setShowModal(false);
      setSelectedSiswa(null);
      setFormCatatan('');
      setFormNaik(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedSiswa(null);
    setFormCatatan('');
    setFormNaik(false);
  };

  const countNaikTingkat = filteredData.filter(s => s.naik_tingkat).length;
  const countTidakNaik = filteredData.filter(s => !s.naik_tingkat).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Catatan Wali Kelas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-800">{filteredData.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Naik Tingkat</p>
                <p className="text-2xl font-bold text-green-600">{countNaikTingkat}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tidak Naik</p>
                <p className="text-2xl font-bold text-red-600">{countTidakNaik}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Cari nama atau NIS siswa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">No.</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">NIS</th>
                  <th className="p-3 text-center">L/P</th>
                  <th className="p-3 text-left">Catatan</th>
                  <th className="p-3 text-center">Naik Tingkat</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((siswa, index) => (
                  <tr key={siswa.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{siswa.nama}</td>
                    <td className="p-3 text-gray-600">{siswa.nis}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        siswa.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {siswa.jenis_kelamin}
                      </span>
                    </td>
                    <td className="p-3">
                      {siswa.catatan ? (
                        <span className="text-gray-700">{siswa.catatan}</span>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada catatan</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {siswa.naik_tingkat ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          <XCircle className="h-4 w-4" />
                          Tidak
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => openEdit(siswa)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition inline-flex items-center justify-center"
                        title="Edit Catatan"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Tidak ada data siswa yang ditemukan
            </div>
          )}
        </div>
      </div>

      {showModal && selectedSiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Edit Catatan Siswa
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Siswa</p>
              <p className="font-semibold text-gray-800">{selectedSiswa.nama}</p>
              <p className="text-sm text-gray-500">NIS: {selectedSiswa.nis}</p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Catatan Wali Kelas
              </label>
              <textarea
                value={formCatatan}
                onChange={e => setFormCatatan(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Tulis catatan untuk siswa..."
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Status Kenaikan Tingkat
              </label>
              <select
                value={formNaik ? 'ya' : 'tidak'}
                onChange={e => setFormNaik(e.target.value === 'ya')}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ya">✓ Naik Tingkat</option>
                <option value="tidak">✗ Tidak Naik Tingkat</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSave} 
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Simpan
              </button>
              <button 
                onClick={handleCancel} 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}