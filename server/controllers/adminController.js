const XLSX = require('xlsx');
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
        const adminList = rows.map(row => {
            let tanggal_lahir = '';
            if (row.tanggal_lahir) {
                // Jika row.tanggal_lahir adalah objek Date
                if (row.tanggal_lahir instanceof Date) {
                    const d = row.tanggal_lahir;
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    tanggal_lahir = `${yyyy}-${mm}-${dd}`;
                } else if (typeof row.tanggal_lahir === 'string') {
                    // Jika string, ambil hanya bagian tanggal (sebelum 'T')
                    tanggal_lahir = row.tanggal_lahir.split('T')[0];
                }
            }

            return {
                id: row.id,
                nama: row.nama,
                email: row.email,
                statusAdmin: row.statusAdmin,
                niy: row.niy || '',
                nuptk: row.nuptk || '',
                tempat_lahir: row.tempat_lahir || '',
                tanggal_lahir: tanggal_lahir, // ✅ Pasti string YYYY-MM-DD
                jenis_kelamin: row.jenis_kelamin || '',
                alamat: row.alamat || '',
                no_telepon: row.no_telepon || ''
            };
        });
        res.json({ success: true, data: adminList });
    } catch (err) {
        console.error('Error get admin:', err);
        res.status(500).json({ message: 'Gagal mengambil data admin' });
    }
};

const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await userModel.findById(id);
        if (!admin) return res.status(404).json({ message: 'Admin tidak ditemukan' });

        const [guruRows] = await db.execute(
            'SELECT niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon FROM guru WHERE user_id = ?',
            [id]
        );
        const guru = guruRows[0] || {};

        res.json({
            success: true,
            data: {
                id: admin.id_user,
                nama: admin.nama_lengkap,
                email: admin.email_sekolah,
                statusAdmin: admin.status === 'aktif' ? 'AKTIF' : 'NONAKTIF',
                niy: guru.niy || '',
                nuptk: guru.nuptk || '',
                jenis_kelamin: guru.jenis_kelamin || '',
                alamat: guru.alamat || '',
                no_telepon: guru.no_telepon || '',
                tempat_lahir: guru.tempat_lahir || '',
                tanggal_lahir: guru.tanggal_lahir || null
            }
        });
    } catch (err) {
        console.error('Error get admin by ID:', err);
        res.status(500).json({ message: 'Gagal mengambil detail admin' });
    }
};

const tambahAdmin = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ✅ Langsung kirim req.body ke model — semua field lengkap
        const id_user = await userModel.createAdmin(req.body, connection);

        await connection.commit();
        res.status(201).json({ message: 'Admin berhasil ditambahkan', id: id_user });
    } catch (err) {
        await connection.rollback();
        console.error('Error tambah admin:', err.message);
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
        await userModel.updateAdmin(id, req.body, connection);

        await connection.commit();
        res.json({ message: 'Data admin berhasil diperbarui' });
    } catch (err) {
        await connection.rollback();
        console.error('Error edit admin:', err.message);
        res.status(500).json({ message: 'Gagal memperbarui data admin' });
    } finally {
        connection.release();
    }
};

const hapusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        await userModel.deleteUserById(id);
        res.json({ message: 'Admin berhasil dihapus' });
    } catch (err) {
        console.error('Error hapus admin:', err.message);
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
    if (!email_sekolah || !nama_lengkap) {
        return res.status(400).json({ message: 'Email dan nama wajib diisi' });
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
        const DEFAULT_PASSWORD = process.env.DEFAULT_GURU_PASSWORD || 'sekolah123';
        const userData = { email_sekolah, password: DEFAULT_PASSWORD, nama_lengkap, status: 'aktif' };
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
        status,
        niy,
        nuptk,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon,
        roles,
        password
    } = req.body;

    if (roles !== undefined) {
        if (!Array.isArray(roles)) {
            return res.status(400).json({ message: 'Roles harus berupa array' });
        }
        const normalizedRoles = roles.map(r => typeof r === 'string' ? r.trim().toLowerCase() : '').filter(r => r);
        const allowedRoles = ['guru kelas', 'guru bidang studi'];
        const validRoles = normalizedRoles.filter(r => allowedRoles.includes(r));
        if (validRoles.length === 0) {
            return res.status(400).json({ message: 'Role tidak valid' });
        }
        // Gunakan validRoles di updateGuru
    }

    try {
        const userData = { email_sekolah, nama_lengkap, password, status };
        const guruData = { niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon };
        await guruModel.updateGuru(id, userData, guruData, roles);
        res.json({ message: 'Data guru berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data guru' });
    }
};

const importGuru = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (!req.file) {
            return res.status(400).json({ message: 'File Excel diperlukan' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) {
            throw new Error('File Excel kosong');
        }

        const requiredFields = ['email_sekolah', 'nama_lengkap'];
        const firstRow = data[0];
        for (const field of requiredFields) {
            if (!(field in firstRow)) {
                throw new Error(`Kolom wajib "${field}" tidak ditemukan di Excel`);
            }
        }

        for (const row of data) {
            if (!row.email_sekolah || !row.nama_lengkap) {
                throw new Error(`Data tidak lengkap pada baris: ${JSON.stringify(row)}`);
            }

            // ✅ VALIDASI & KONVERSI TANGGAL DI DALAM LOOP
            let tanggal_lahir = row.tanggal_lahir || '';
            if (typeof tanggal_lahir === 'number') {
                const date = new Date((tanggal_lahir - 25569) * 86400 * 1000);
                if (isNaN(date.getTime())) {
                    tanggal_lahir = null;
                } else {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    tanggal_lahir = `${yyyy}-${mm}-${dd}`;
                }
            } else if (typeof tanggal_lahir === 'string') {
                tanggal_lahir = tanggal_lahir.trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_lahir)) {
                    tanggal_lahir = null;
                }
            } else {
                tanggal_lahir = null;
            }

            const roles = row.roles
                ? row.roles.toString().split(',').map(r => r.trim())
                : ['guru kelas'];
            const validRoles = roles.filter(r => ['guru kelas', 'guru bidang studi'].includes(r));
            const password = row.password || 'sekolah123!';

            const userData = {
                email_sekolah: row.email_sekolah,
                password: password,
                nama_lengkap: row.nama_lengkap
            };
            const guruData = {
                niy: row.niy || null,
                nuptk: row.nuptk || null,
                tempat_lahir: row.tempat_lahir || null,
                tanggal_lahir: tanggal_lahir, // ✅ Bisa null atau 'YYYY-MM-DD'
                jenis_kelamin: row.jenis_kelamin || 'Laki-laki',
                alamat: row.alamat || null,
                no_telepon: row.no_telepon || null
            };

            await guruModel.createGuru(userData, guruData, validRoles);
        }

        await connection.commit();
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Import data guru berhasil', total: data.length });
    } catch (err) {
        await connection.rollback();
        console.error('Error import guru:', err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: err.message || 'Gagal mengimport data guru' });
    } finally {
        connection.release();
    }
};

// Ambil data sekolah
const getSekolah = async (req, res) => {
    try {
        const sekolah = await sekolahModel.getSekolah();
        if (!sekolah) {
            return res.status(404).json({ message: 'Data sekolah belum diatur' });
        }

        // ✅ PERBAIKAN: Return format yang konsisten dengan frontend
        res.json({
            success: true,
            data: sekolah  // ← UBAH dari 'sekolah' jadi 'data'
        });
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

        // ✅ Kirim hanya field yang dikirim (sudah benar)
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

// Upload logo sekolah
const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File logo diperlukan' });
        }

        const logoPath = `/uploads/${req.file.filename}`;

        // ✅ Gunakan sekolahModel untuk konsistensi (opsional tapi direkomendasikan)
        const [rows] = await db.execute('SELECT id FROM sekolah WHERE id = 1');
        if (rows.length > 0) {
            await db.execute('UPDATE sekolah SET logo_path = ? WHERE id = 1', [logoPath]);
        } else {
            await db.execute(
                `INSERT INTO sekolah (id, nama_sekolah, npsn, nss, alamat, kode_pos, telepon, email, website, kepala_sekolah, niy_kepala_sekolah, logo_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    1,
                    'SDIT Ulil Albab',
                    '0000000000',
                    '00000000',
                    'Alamat Sekolah',
                    '00000',
                    '0000000000',
                    'info@sekolah.sch.id',
                    'https://sekolah.sch.id',
                    'Kepala Sekolah',
                    '0000000000000000',
                    logoPath
                ]
            );
        }

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
    importGuru,
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