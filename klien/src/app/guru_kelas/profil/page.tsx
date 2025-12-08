'use client';

import React, { useState } from 'react';

interface ProfilData {
  nama: string;
  nuptk: string;
  nip: string;
  jenis_kelamin: 'Pria' | 'Perempuan';
  telepon: string;
  email: string;
  alamat: string;
}

const initialData: ProfilData = {
  nama: 'Maman Walas, S.Kom',
  nuptk: 'Masukkan NUPTK',
  nip: '1900001255716203',
  jenis_kelamin: 'Perempuan',
  telepon: 'Masukkan Telepon',
  email: 'walikelas@gmail.com',
  alamat: 'Jl. Pegangsaan Timur',
};

const ProfilPage = () => {
  const [formData, setFormData] = useState<ProfilData>(initialData);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSave = () => {
    if (!isConfirmed) {
      alert('Harap centang konfirmasi');
      return;
    }
    alert('Profil disimpan! (Implementasi real dengan fetch ke API)');
    // Fetch POST ke /api/profil
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Profil</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center mb-4">
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-4" />
          <div>
            <h2 className="text-xl">{formData.nama}</h2>
            <p>Guru</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Nama *</label>
            <input
              type="text"
              value={formData.nama}
              onChange={e => setFormData({ ...formData, nama: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label>NUPTK</label>
            <input
              type="text"
              value={formData.nuptk}
              onChange={e => setFormData({ ...formData, nuptk: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label>NIP</label>
            <input
              type="text"
              value={formData.nip}
              onChange={e => setFormData({ ...formData, nip: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label>Jenis Kelamin *</label>
            <select
              value={formData.jenis_kelamin}
              onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value as 'Pria' | 'Perempuan' })}
              className="border p-2 w-full"
            >
              <option>Pria</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div>
            <label>Telepon</label>
            <input
              type="text"
              value={formData.telepon}
              onChange={e => setFormData({ ...formData, telepon: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <div className="col-span-2">
            <label>Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={e => setFormData({ ...formData, alamat: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={e => setIsConfirmed(e.target.checked)}
            className="mr-2"
          />
          <label>Saya yakin akan mengubah data tersebut</label>
        </div>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
          Simpan
        </button>
      </div>
    </div>
  );
};

export default ProfilPage;