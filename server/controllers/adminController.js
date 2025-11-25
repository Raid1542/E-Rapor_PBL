const userModel = require('../models/userModel');
const guruModel = require('../models/guruModel');
const { hashPassword } = require('../utils/hash');

const tambahAdmin = async (req, res) => {
    try {
        const id = await userModel.createUser({ ...req.body, role: 'Admin' });
        res.status(201).json({ message: 'Admin berhasil ditambahkan', id });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah admin' });
    }
};

const editAdmin = async (req, res) => {
    try {
        await userModel.updateUser(req.params.id, req.body);
        res.json({ message: 'Data admin berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data admin' });
    }
};

const getGuru = async (req, res) => {
    try {
        const guruList = await guruModel.getAllGuru();
        res.json({ success: true, data: guruList });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data guru' });
    }
};

const tambahGuru = async (req, res) => {
    const {
        nama_lengkap,
        email_sekolah,
        password,
        role = 'Guru Kelas',
        niy,
        nuptk,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        no_telepon
    } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        const userData = { email_sekolah, password: hashedPassword, nama_lengkap, role };
        const guruData = { niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon };

        const userId = await guruModel.createGuru(userData, guruData);
        res.status(201).json({ message: 'Data guru berhasil ditambahkan', id: userId });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menambah data guru' });
    }
};

const editGuru = async (req, res) => {
    try {
        await userModel.updateUser(req.params.id, req.body);
        res.json({ message: 'Data guru berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui data guru' });
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
    tambahAdmin,
    editAdmin,
    getGuru,
    tambahGuru,
    editGuru,
    tambahSiswa,
    editSiswa,
    aturKelas,
    kelolaEkskul,
    lihatRapor,
    aturTahunAjaran,
    aturMataPelajaran
};