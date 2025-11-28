const userModel = require('../models/userModel');
const guruModel = require('../models/guruModel');
const sekolahModel = require('../models/sekolahModel');
const path = require('path');
const fs = require('fs');
const { hashPassword } = require('../utils/hash');
const db = require('../config/db');

const getAdmin = async (req, res) => {
    try {
        const rows = await userModel.getAdminList();
        const adminList = rows.map(row => ({
            id: row.id_user,
            nama: row.nama_lengkap,
            email: row.email_sekolah,
            statusAdmin: row.status === 'aktif' ? 'AKTIF' : 'NONAKTIF',
            niy: row.niy || '',
            nuptk: row.nuptk || '',
            jenisKelamin: row.jenis_kelamin === 'Perempuan' ? 'PEREMPUAN' : 'LAKI-LAKI',
            lp: row.jenis_kelamin === 'Perempuan' ? 'P' : 'L',
            alamat: row.alamat,
            no_telepon: row.telepon
        }));
        res.json({ success: true, data: adminList });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data admin' });
    }
};

const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await userModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin tidak ditemukan' });
        }

        // Ambil data profil dari tabel guru
        const [guruRows] = await db.execute(
            'SELECT niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon FROM guru WHERE user_id = ?',
            [id]
        );
        const guru = guruRows[0] || {};

        const response = {
            id: admin.id_user,
            nama: admin.nama_lengkap,
            email: admin.email_sekolah,
            statusAdmin: admin.status === 'aktif' ? 'AKTIF' : 'NONAKTIF',
            niy: guru.niy || '',
            nuptk: guru.nuptk || '',
            jenisKelamin: guru.jenis_kelamin === 'Perempuan' ? 'PEREMPUAN' : (guru.jenis_kelamin || 'LAKI-LAKI'),
            lp: guru.jenis_kelamin === 'Perempuan' ? 'P' : 'L',
            alamat: guru.alamat || '',
            no_telepon: guru.no_telepon || '',
            tempat_lahir: guru.tempat_lahir || '',
            tanggal_lahir: guru.tanggal_lahir || '',
        };

        res.json({ success: true, data: response });
    } catch (err) {
        console.error('Error get admin by ID:', err);
        res.status(500).json({ message: 'Gagal mengambil detail admin' });
    }
};

const tambahAdmin = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { email_sekolah, password, nama_lengkap, ...profil } = req.body;

        // Buat user + role admin
        const id_user = await userModel.createAdmin({ email_sekolah, password, nama_lengkap }, connection);

        // Simpan profil ke tabel guru (jika ada data)
        if (profil.niy || profil.nuptk || profil.alamat) {
            await connection.execute(
                `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_user, profil.niy, profil.nuptk, profil.tempat_lahir, profil.tanggal_lahir, profil.jenis_kelamin, profil.alamat, profil.no_telepon]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Admin berhasil ditambahkan', id: id_user });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: 'Gagal menambah admin' });
    } finally {
        connection.release();
    }
};

const editAdmin = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            email_sekolah,
            nama_lengkap,
            status,
            niy,
            nuptk,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            alamat,
            no_telepon
        } = req.body;

        // 1. Update tabel `user`
        await connection.execute(
            `UPDATE user 
                SET email_sekolah = ?, nama_lengkap = ?, status = ? 
                WHERE id_user = ?`,
            [email_sekolah, nama_lengkap, status, id]
        );

        // 2. Cek apakah sudah ada data di tabel `guru` untuk user ini
        const [guruRows] = await connection.execute(
            'SELECT 1 FROM guru WHERE user_id = ?',
            [id]
        );

        if (guruRows.length > 0) {
            // Jika ada → UPDATE
            await connection.execute(
                `UPDATE guru 
                SET niy = ?, nuptk = ?, tempat_lahir = ?, tanggal_lahir = ?, 
                    jenis_kelamin = ?, alamat = ?, no_telepon = ?
                WHERE user_id = ?`,
                [niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon, id]
            );
        } else {
            // Jika belum ada → INSERT (opsional, tergantung kebijakan)
            await connection.execute(
                `INSERT INTO guru (user_id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon]
            );
        }

        await connection.commit();
        res.json({ message: 'Data admin berhasil diperbarui' });

    } catch (err) {
        await connection.rollback();
        console.error('Error edit admin:', err);
        res.status(500).json({ message: 'Gagal memperbarui data admin' });
    } finally {
        connection.release();
    }
};

const hapusAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Hapus dari tabel user_role dulu
        await db.execute('DELETE FROM user_role WHERE id_user = ?', [id]);

        // Hapus dari tabel guru (jika ada)
        await db.execute('DELETE FROM guru WHERE user_id = ?', [id]);

        // Hapus dari tabel user
        await db.execute('DELETE FROM user WHERE id_user = ?', [id]);

        res.json({ message: 'Admin berhasil dihapus' });
    } catch (err) {
        console.error('Error hapus admin:', err);
        res.status(500).json({ message: 'Gagal menghapus admin' });
    }
};

const getGuru = async (req, res) => {
    try {
        const guruList = await guruModel.getAllGuru();
        res.json({ success: true, data: guruList });
    } catch (err) {
        console.error('Error get guru:', err);
        res.status(500).json({ message: 'Gagal mengambil data guru' });
    }
};

const getGuruById = async (req, res) => {
    try {
        const { id } = req.params;
        const guru = await guruModel.getGuruById(id);
        if (!guru) {
            return res.status(404).json({ message: 'Guru tidak ditemukan' });
        }
        res.json({ success: true, data: guru });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil detail guru' });
    }
};

const tambahGuru = async (req, res) => {
    const {
        nama_lengkap,
        email_sekolah,
        password,
        roles = [],
        niy,
        nuptk,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon
    } = req.body;

    // Validasi wajib
    if (!email_sekolah || !password || !nama_lengkap) {
        return res.status(400).json({ message: 'Email, password, dan nama wajib diisi' });
    }

    // ✅ 1. Pastikan roles adalah array
    if (!Array.isArray(roles)) {
        return res.status(400).json({ message: 'Roles harus berupa array' });
    }

    // ✅ 2. Normalize roles (trim + lowercase)
    const normalizedRoles = roles.map(role => {
        if (typeof role !== 'string') return '';
        return role.trim().toLowerCase();
    }).filter(role => role.length > 0); // Hapus string kosong

    // ✅ 3. Validasi role
    const allowedRoles = ['guru kelas', 'guru bidang studi'];
    const validRoles = normalizedRoles.filter(role => allowedRoles.includes(role));

    if (validRoles.length === 0) {
        return res.status(400).json({ message: 'Pilih minimal satu hak akses yang valid' });
    }

    try {
        const userData = { email_sekolah, password, nama_lengkap };
        const guruData = { niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon };
        const userId = await guruModel.createGuru(userData, guruData, validRoles);
        res.status(201).json({ message: 'Guru berhasil ditambahkan', id: userId });
    } catch (err) {
        console.error('Error tambah guru:', err);
        res.status(500).json({ message: 'Gagal menambah guru' });
    }
};

const editGuru = async (req, res) => {
    const { id } = req.params;
    const {
        email_sekolah,
        nama_lengkap,
        niy,
        nuptk,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon
    } = req.body;

    try {
        const userData = { email_sekolah, nama_lengkap };
        const guruData = { niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon };
        await guruModel.updateGuru(id, userData, guruData);
        res.json({ message: 'Data guru berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data guru' });
    }
};

const hapusGuru = async (req, res) => {
    try {
        const { id } = req.params;
        await guruModel.deleteGuru(id);
        res.json({ message: 'Guru berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus guru' });
    }
};

// Ambil data sekolah
const getSekolah = async (req, res) => {
    try {
        const sekolah = await sekolahModel.getSekolah();
        if (!sekolah) {
            return res.status(404).json({ message: 'Data sekolah belum diatur' });
        }
        res.json({ success: true, data: sekolah });
    } catch (err) {
        console.error('Error get sekolah:', err);
        res.status(500).json({ message: 'Gagal mengambil data sekolah' });
    }
};

// Edit data sekolah (partial update aman)
const editSekolah = async (req, res) => {
    try {
        const {
            namaSekolah,
            npsn,
            nss,
            alamat,
            kodePos,
            telepon,
            email,
            website,
            kepalaSekolah,
            niyKepalaSekolah
        } = req.body;

        // Kirim hanya field yang dikirim dari frontend
        const data = {};
        if (namaSekolah !== undefined) data.nama_sekolah = namaSekolah;
        if (npsn !== undefined) data.npsn = npsn;
        if (nss !== undefined) data.nss = nss;
        if (alamat !== undefined) data.alamat = alamat;
        if (kodePos !== undefined) data.kode_pos = kodePos;
        if (telepon !== undefined) data.telepon = telepon;
        if (email !== undefined) data.email = email;
        if (website !== undefined) data.website = website;
        if (kepalaSekolah !== undefined) data.kepala_sekolah = kepalaSekolah;
        if (niyKepalaSekolah !== undefined) data.niy_kepala_sekolah = niyKepalaSekolah;

        await sekolahModel.updateSekolah(data);
        res.json({ message: 'Data sekolah berhasil diperbarui' });
    } catch (err) {
        console.error('Error update sekolah:', err);
        res.status(500).json({ message: 'Gagal memperbarui data sekolah' });
    }
};

// Upload logo sekolah — hanya kirim logo_path
const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File logo diperlukan' });
        }

        const logoPath = `/uploads/${req.file.filename}`;

        // ✅ Hanya kirim logo_path — biarkan model isi sisanya dari data lama
        await sekolahModel.updateSekolah({ logo_path: logoPath });

        res.json({ message: 'Logo berhasil diupdate', logoPath });
    } catch (err) {
        console.error('Error upload logo:', err);
        res.status(500).json({ message: 'Gagal mengupload logo' });
    }
};

const tambahSiswa = async (req, res) => {
    const { nis, nisn, nama_lengkap, kelas_id } = req.body;
    try {
        await db.execute(
            'INSERT INTO siswa (nis, nisn, nama_lengkap, kelas_id, status) VALUES (?, ?, ?, ?, "aktif")',
            [nis, nisn, nama_lengkap, kelas_id]
        );
        res.status(201).json({ message: 'Data siswa berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah data siswa' });
    }
};

const editSiswa = async (req, res) => {
    const { nis, nisn, nama_lengkap, kelas_id } = req.body;
    try {
        await db.execute(
            'UPDATE siswa SET nis = ?, nisn = ?, nama_lengkap = ?, kelas_id = ? WHERE id_siswa = ?',
            [nis, nisn, nama_lengkap, kelas_id, req.params.id]
        );
        res.json({ message: 'Data siswa berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data siswa' });
    }
};

const aturKelas = async (req, res) => { };
const kelolaEkskul = async (req, res) => { };
const lihatRapor = async (req, res) => { };
const aturTahunAjaran = async (req, res) => { };
const aturMataPelajaran = async (req, res) => { };

module.exports = {
    getAdmin,
    getAdminById,
    tambahAdmin,
    editAdmin,
    hapusAdmin,
    getGuru,
    getGuruById,
    tambahGuru,
    editGuru,
    hapusGuru,
    getSekolah,
    editSekolah,
    uploadLogo,
    tambahSiswa,
    editSiswa,
    aturKelas,
    kelolaEkskul,
    lihatRapor,
    aturTahunAjaran,
    aturMataPelajaran
};