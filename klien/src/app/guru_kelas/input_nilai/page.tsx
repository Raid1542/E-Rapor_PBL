'use client';

import React, { useState } from 'react';
import { Pencil, FileSpreadsheet, FileText } from 'lucide-react';

interface Siswa {
  id: string;
  nis: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  pabp: number;
  pp: number;
  b_indo: number;
  ipa: number;
  ips: number;
  total: number;
  rata: number;
  ranking: number;
}

interface FormValues {
  pabp: number;
  pp: number;
  b_indo: number;
  ipa: number;
  ips: number;
}

const initialData: Siswa[] = [
  { id: '1', nis: '12345', nama: 'Siswa 1', jenis_kelamin: 'L', pabp: 0, pp: 0, b_indo: 0, ipa: 0, ips: 0, total: 0, rata: 0, ranking: 0 },
  { id: '2', nis: '67890', nama: 'Siswa 2', jenis_kelamin: 'P', pabp: 0, pp: 0, b_indo: 0, ipa: 0, ips: 0, total: 0, rata: 0, ranking: 0 },
  { id: '3', nis: '11223', nama: 'Ahmad Rizki', jenis_kelamin: 'L', pabp: 85, pp: 88, b_indo: 90, ipa: 87, ips: 89, total: 439, rata: 87.8, ranking: 1 },
  { id: '4', nis: '11224', nama: 'Siti Nurhaliza', jenis_kelamin: 'P', pabp: 90, pp: 85, b_indo: 88, ipa: 84, ips: 86, total: 433, rata: 86.6, ranking: 2 },
  { id: '5', nis: '11225', nama: 'Bagas Nasution', jenis_kelamin: 'L', pabp: 78, pp: 80, b_indo: 82, ipa: 79, ips: 81, total: 400, rata: 80, ranking: 3 },
];

export default function InputNilaiPage() {
  const [data, setData] = useState<Siswa[]>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({ pabp: 0, pp: 0, b_indo: 0, ipa: 0, ips: 0 });

  const updateCalculations = (updatedData: Siswa[]) => {
    const withTotal = updatedData.map(s => ({
      ...s,
      total: s.pabp + s.pp + s.b_indo + s.ipa + s.ips,
      rata: (s.pabp + s.pp + s.b_indo + s.ipa + s.ips) / 5,
    }));
    const sorted = [...withTotal].sort((a, b) => b.rata - a.rata);
    const withRanking = sorted.map((s, index) => ({ ...s, ranking: index + 1 }));
    setData(withRanking);
  };

  const openEdit = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setFormValues({ pabp: siswa.pabp, pp: siswa.pp, b_indo: siswa.b_indo, ipa: siswa.ipa, ips: siswa.ips });
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedSiswa) {
      const updated = data.map(s => s.id === selectedSiswa.id ? { ...s, ...formValues } : s);
      updateCalculations(updated);
      setShowModal(false);
      setSelectedSiswa(null);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedSiswa(null);
  };

  const filteredData = data.filter(siswa => 
    siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.nis.includes(searchQuery)
  );

  const handleExport = (type: string) => {
    alert(`Export ke ${type.toUpperCase()} (implementasi real dengan library seperti xlsx atau jsPDF)`);
  };

  const getRankingColor = (ranking: number): string => {
    if (ranking === 1) return 'bg-yellow-400 text-yellow-900';
    if (ranking === 2) return 'bg-gray-300 text-gray-900';
    if (ranking === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-blue-100 text-blue-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Input Nilai Siswa</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleExport('excel')} 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </button>
            <button 
              onClick={() => handleExport('pdf')} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition inline-flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" />
              Export PDF
            </button>
            <input
              type="text"
              placeholder="🔍 Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left whitespace-nowrap">No.</th>
                  <th className="p-3 text-left whitespace-nowrap">NIS</th>
                  <th className="p-3 text-left whitespace-nowrap">NAMA</th>
                  <th className="p-3 text-center whitespace-nowrap">L/P</th>
                  <th className="p-3 text-center bg-blue-600 whitespace-nowrap">PABP</th>
                  <th className="p-3 text-center bg-blue-600 whitespace-nowrap">PP</th>
                  <th className="p-3 text-center bg-blue-600 whitespace-nowrap">B.INDO</th>
                  <th className="p-3 text-center bg-blue-600 whitespace-nowrap">IPA</th>
                  <th className="p-3 text-center bg-blue-600 whitespace-nowrap">IPS</th>
                  <th className="p-3 text-center bg-green-700 whitespace-nowrap">TOTAL</th>
                  <th className="p-3 text-center bg-green-700 whitespace-nowrap">RATA-RATA</th>
                  <th className="p-3 text-center bg-purple-700 whitespace-nowrap">RANKING</th>
                  <th className="p-3 text-center whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((siswa, index) => (
                  <tr key={siswa.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 text-gray-600">{siswa.nis}</td>
                    <td className="p-3 font-medium">{siswa.nama}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        siswa.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {siswa.jenis_kelamin}
                      </span>
                    </td>
                    <td className="p-3 text-center font-medium">{siswa.pabp || '-'}</td>
                    <td className="p-3 text-center font-medium">{siswa.pp || '-'}</td>
                    <td className="p-3 text-center font-medium">{siswa.b_indo || '-'}</td>
                    <td className="p-3 text-center font-medium">{siswa.ipa || '-'}</td>
                    <td className="p-3 text-center font-medium">{siswa.ips || '-'}</td>
                    <td className="p-3 text-center font-bold text-green-700">{siswa.total}</td>
                    <td className="p-3 text-center font-bold text-green-700">{siswa.rata.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankingColor(siswa.ranking)}`}>
                        {siswa.ranking}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => openEdit(siswa)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition inline-flex items-center justify-center"
                        title="Edit Nilai"
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Input Nilai
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Siswa</p>
              <p className="font-semibold text-gray-800">{selectedSiswa.nama}</p>
              <p className="text-sm text-gray-500">NIS: {selectedSiswa.nis}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">PABP</label>
                <input 
                  type="number" 
                  value={formValues.pabp} 
                  onChange={e => setFormValues({ ...formValues, pabp: Number(e.target.value) })} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">PP</label>
                <input 
                  type="number" 
                  value={formValues.pp} 
                  onChange={e => setFormValues({ ...formValues, pp: Number(e.target.value) })} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">B.INDO</label>
                <input 
                  type="number" 
                  value={formValues.b_indo} 
                  onChange={e => setFormValues({ ...formValues, b_indo: Number(e.target.value) })} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">IPA</label>
                <input 
                  type="number" 
                  value={formValues.ipa} 
                  onChange={e => setFormValues({ ...formValues, ipa: Number(e.target.value) })} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">IPS</label>
                <input 
                  type="number" 
                  value={formValues.ips} 
                  onChange={e => setFormValues({ ...formValues, ips: Number(e.target.value) })} 
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
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