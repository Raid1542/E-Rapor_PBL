const db = require('../config/db');

const getOne = async () => {
    const [rows] = await db.execute('SELECT * FROM sekolah LIMIT 1');
    return rows[0];
};

const update = async (data) => {
    const {
        nama_sekolah,
        npsn,
        nss,
        kode_pos,
        telepon,
        alamat,
        email,
        website,
        kepala_sekolah,
        niy_kepala_sekolah,
        logo
    } = data;

    const [existing] = await db.execute('SELECT id_sekolah FROM sekolah LIMIT 1');

    if (existing.length > 0) {
        // Update
        await db.execute(
            `UPDATE sekolah SET 
        nama_sekolah = ?, 
        npsn = ?, 
        nss = ?, 
        kode_pos = ?, 
        telepon = ?, 
        alamat = ?, 
        email = ?, 
        website = ?, 
        kepala_sekolah = ?, 
        niy_kepala_sekolah = ?, 
        logo = ? 
        WHERE id_sekolah = ?`,
            [nama_sekolah, npsn, nss, kode_pos, telepon, alamat, email, website, kepala_sekolah, niy_kepala_sekolah, logo, existing[0].id_sekolah]
        );
    } else {
        // Insert
        await db.execute(
            `INSERT INTO sekolah 
        (nama_sekolah, npsn, nss, kode_pos, telepon, alamat, email, website, kepala_sekolah, niy_kepala_sekolah, logo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nama_sekolah, npsn, nss, kode_pos, telepon, alamat, email, website, kepala_sekolah, niy_kepala_sekolah, logo]
        );
    }

    return { message: 'Data sekolah berhasil disimpan' };
};

module.exports = { getOne, update};