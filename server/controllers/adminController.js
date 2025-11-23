const db = require('../config/db');
const userModel = require('../models/userModel');

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

const tambahGuru = async (req, res) => {
    try {
        const id = await userModel.createUser({ ...req.body, role: 'Guru Kelas' });
        res.status(201).json({ message: 'Data guru berhasil ditambahkan', id });
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