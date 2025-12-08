'use client';

import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

interface Siswa {
  id: string;
  nama: string;
  nis: string;
  jenis_kelamin: 'L' | 'P';
  kokurikuler: string;
}

const initialData: Siswa[] = [
  { id: '1', nama: 'Siswa 1', nis: '12345', jenis_kelamin: 'L', kokurikuler: '' },
  { id: '2', nama: 'Siswa 2', nis: '67890', jenis_kelamin: 'P', kokurikuler: '' },
  { id: '3', nama: 'Ahmad Rizki', nis: '11223', jenis_kelamin: 'L', kokurikuler: 'Kegiatan Pramuka' },
  { id: '4', nama: 'Siti Nurhaliza', nis: '11224', jenis_kelamin: 'P', kokurikuler: 'Kegiatan PMR' },
  { id: '5', nama: 'Bagas Nasution', nis: '11225', jenis_kelamin: 'L', kokurikuler: '' },
];

export default function KokurikulerPage() {
  const [data, setData] = useState<Siswa[]>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [formKokurikuler, setFormKokurikuler] = useState<string>('');

  const filteredData = data.filter(siswa => 
    siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.nis.includes(searchQuery)
  );

  const openEdit = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setFormKokurikuler(siswa.kokurikuler);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedSiswa) {
      const updated = data.map(s => 
        s.id === selectedSiswa.id ? { ...s, kokurikuler: formKokurikuler } : s
      );
      setData(updated);
      setShowModal(false);
      setSelectedSiswa(null);
      setFormKokurikuler('');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedSiswa(null);
    setFormKokurikuler('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Kokurikuler Siswa</h1>
        
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
                  <th className="p-3 text-left">Kokurikuler</th>
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
                      {siswa.kokurikuler ? (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {siswa.kokurikuler}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => openEdit(siswa)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition inline-flex items-center justify-center"
                        title="Edit Kokurikuler"
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

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ Tentang Kokurikuler</h3>
          <p className="text-sm text-blue-800">
            <strong>Kokurikuler</strong> adalah kegiatan yang dilaksanakan untuk meningkatkan pemahaman dan penguasaan materi pembelajaran sesuai kurikulum. 
            Contoh: Kegiatan Pramuka, PMR (Palang Merah Remaja), dll.
          </p>
        </div>
      </div>

      {showModal && selectedSiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Edit Kokurikuler
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Siswa</p>
              <p className="font-semibold text-gray-800">{selectedSiswa.nama}</p>
              <p className="text-sm text-gray-500">NIS: {selectedSiswa.nis}</p>
            </div>

            <label className="block mb-2 font-medium text-gray-700">
              Kokurikuler
            </label>
            <textarea
              value={formKokurikuler}
              onChange={e => setFormKokurikuler(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Contoh: Kegiatan Pramuka, Kegiatan PMR, dll"
            />
            
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