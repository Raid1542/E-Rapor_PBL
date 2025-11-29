const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

// Ambil data sekolah (selalu id = 1)
const getSekolah = async () => {
    const [rows] = await db.execute('SELECT * FROM sekolah WHERE id = 1');
    return rows[0] || null;
};

// Update data sekolah
const updateSekolah = async (newData) => {
    try {
        // Ambil data sekolah yang sudah ada
        const existing = await getSekolah();


        // Gabungkan: gunakan newData jika ada, jika tidak, pertahankan nilai lama
        const merged = {
            nama_sekolah: newData.nama_sekolah ?? current.nama_sekolah,
            npsn: newData.npsn ?? current.npsn,
            nss: newData.nss ?? current.nss,
            alamat: newData.alamat ?? current.alamat,
            kode_pos: newData.kode_pos ?? current.kode_pos,
            telepon: newData.telepon ?? current.telepon,
            email: newData.email ?? current.email,
            website: newData.website ?? current.website,
            kepala_sekolah: newData.kepala_sekolah ?? current.kepala_sekolah,
            niy_kepala_sekolah: newData.niy_kepala_sekolah ?? current.niy_kepala_sekolah,
            logo_path: newData.logo_path ?? current.logo_path
        };

        // Sekarang semua field pasti tidak null
        const [result] = await db.execute(
            `UPDATE sekolah SET 
                nama_sekolah = ?,
                npsn = ?,
                nss = ?,
                alamat = ?,
                kode_pos = ?,
                telepon = ?,
                email = ?,
                website = ?,
                kepala_sekolah = ?,
                niy_kepala_sekolah = ?,
                logo_path = ?
            WHERE id = 1`,
            Object.values(merged)
        );

        // Jika tidak ada yang di-update (karena belum ada data), lakukan INSERT
        if (result.affectedRows === 0) {
            await db.execute(
                `INSERT INTO sekolah (
                    id, nama_sekolah, npsn, nss, alamat, kode_pos, telepon, email, website,
                    kepala_sekolah, niy_kepala_sekolah, logo_path
                ) VALUES (
                    1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )`,
                Object.values(merged)
            );
        }

        console.log('Update/Insert berhasil');
    } catch (err) {
        console.error('Error updateSekolah:', err);
        throw err;
    }
};

module.exports = {
    getSekolah,
    updateSekolah
};