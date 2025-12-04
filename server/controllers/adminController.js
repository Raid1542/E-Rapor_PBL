const XLSX = require('xlsx');
const userModel = require('../models/userModel');
const guruModel = require('../models/guruModel');
const sekolahModel = require('../models/sekolahModel');
const siswaModel = require('../models/siswaModel');
const tahunAjaranModel = require('../models/tahunAjaranModel');
const kelasModel = require('../models/kelasModel');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// ============== ADMIN ==============
const getAdmin = async (req, res) => {
    try {
        const rows = await userModel.getAdminList();
        const adminList = rows.map(row => {
            let tanggal_lahir = '';
            if (row.tanggal_lahir) {
                if (row.tanggal_lahir instanceof Date) {
                    const d = row.tanggal_lahir;
                    tanggal_lahir = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                } else if (typeof row.tanggal_lahir === 'string') {
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
                tanggal_lahir: tanggal_lahir,
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

// ============== GURU ==============
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
        if (!guru) return res.status(404).json({ message: 'Guru tidak ditemukan' });
        res.json({ success: true, data: guru });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil detail guru' });
    }
};

const tambahGuru = async (req, res) => {
    const { nama_lengkap, email_sekolah, roles = [], niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon } = req.body;
    if (!email_sekolah || !nama_lengkap) {
        return res.status(400).json({ message: 'Email dan nama wajib diisi' });
    }
    if (!Array.isArray(roles)) {
        return res.status(400).json({ message: 'Roles harus berupa array' });
    }
    const normalizedRoles = roles.map(role => typeof role === 'string' ? role.trim().toLowerCase() : '').filter(Boolean);
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
    const { email_sekolah, nama_lengkap, status, niy, nuptk, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_telepon, roles, password } = req.body;
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
        if (!req.file) return res.status(400).json({ message: 'File Excel diperlukan' });
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (data.length === 0) throw new Error('File Excel kosong');
        const requiredFields = ['email_sekolah', 'nama_lengkap'];
        const firstRow = data[0];
        for (const field of requiredFields) {
            if (!(field in firstRow)) throw new Error(`Kolom wajib "${field}" tidak ditemukan`);
        }
        for (const row of data) {
            if (!row.email_sekolah || !row.nama_lengkap) throw new Error(`Data tidak lengkap`);
            let tanggal_lahir = row.tanggal_lahir || '';
            if (typeof tanggal_lahir === 'number') {
                const date = new Date((tanggal_lahir - 25569) * 86400 * 1000);
                if (!isNaN(date.getTime())) {
                    tanggal_lahir = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                } else {
                    tanggal_lahir = null;
                }
            } else if (typeof tanggal_lahir === 'string') {
                tanggal_lahir = tanggal_lahir.trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_lahir)) tanggal_lahir = null;
            } else {
                tanggal_lahir = null;
            }
            const roles = (row.roles ? row.roles.toString().split(',').map(r => r.trim()) : ['guru kelas']);
            const validRoles = roles.filter(r => ['guru kelas', 'guru bidang studi'].includes(r));
            const password = row.password || 'sekolah123!';
            const userData = { email_sekolah: row.email_sekolah, password, nama_lengkap: row.nama_lengkap };
            const guruData = {
                niy: row.niy || null,
                nuptk: row.nuptk || null,
                tempat_lahir: row.tempat_lahir || null,
                tanggal_lahir,
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
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message || 'Gagal mengimport data guru' });
    } finally {
        connection.release();
    }
};

// ============== SEKOLAH ==============
const getSekolah = async (req, res) => {
    try {
        const sekolah = await sekolahModel.getSekolah();
        if (!sekolah) return res.status(404).json({ message: 'Data sekolah belum diatur' });
        res.json({ success: true, data: sekolah });
    } catch (err) {
        console.error('Error get sekolah:', err);
        res.status(500).json({ message: 'Gagal mengambil data sekolah' });
    }
};

const editSekolah = async (req, res) => {
    try {
        const { namaSekolah, npsn, nss, alamat, kodePos, telepon, email, website, kepalaSekolah, niyKepalaSekolah } = req.body;
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

const uploadLogo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File logo diperlukan' });
        const logoPath = `/uploads/${req.file.filename}`;
        const [rows] = await db.execute('SELECT id FROM sekolah WHERE id = 1');
        if (rows.length > 0) {
            await db.execute('UPDATE sekolah SET logo_path = ? WHERE id = 1', [logoPath]);
        } else {
            await db.execute(`
                INSERT INTO sekolah (id, nama_sekolah, npsn, nss, alamat, kode_pos, telepon, email, website, kepala_sekolah, niy_kepala_sekolah, logo_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [1, 'SDIT Ulil Albab', '0000000000', '00000000', 'Alamat Sekolah', '00000', '0000000000', 'info@sekolah.sch.id', 'https://sekolah.sch.id', 'Kepala Sekolah', '0000000000000000', logoPath]);
        }
        res.json({ message: 'Logo berhasil diupdate', logoPath });
    } catch (err) {
        console.error('Error upload logo:', err);
        res.status(500).json({ message: 'Gagal mengupload logo' });
    }
};

// ============== SISWA ==============
const getSiswa = async (req, res) => {
    try {
        const siswaList = await siswaModel.getAllSiswa();
        res.json({ success: true, data: siswaList });
    } catch (err) {
        console.error('Error get siswa:', err);
        res.status(500).json({ message: 'Gagal mengambil data siswa' });
    }
};

const getSiswaById = async (req, res) => {
    try {
        const { id } = req.params;
        const siswa = await siswaModel.getSiswaById(id);
        if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        res.json({ success: true, data: siswa });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil detail siswa' });
    }
};

const getKelasIdByName = async (namaKelas) => {
    const [rows] = await db.execute('SELECT id_kelas FROM kelas WHERE nama_kelas = ?', [namaKelas]);
    if (rows.length === 0) {
        throw new Error(`Kelas "${namaKelas}" tidak ditemukan`);
    }
    return rows[0].id_kelas;
};

const tambahSiswa = async (req, res) => {
    const { nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, kelas_id } = req.body;
    if (!nis || !nisn || !nama_lengkap || !kelas_id) {
        return res.status(400).json({ message: 'NIS, NISN, Nama, dan Kelas wajib diisi' });
    }
    try {
        const kelasIdInt = await getKelasIdByName(kelas_id);

        // Ambil tahun ajaran aktif
        const [activeTA] = await db.execute(`
            SELECT id_tahun_ajaran 
            FROM tahun_ajaran 
            WHERE status = 'aktif' 
            LIMIT 1
        `);
        const taId = activeTA[0]?.id_tahun_ajaran;
        if (!taId) {
            return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
        }

        // Simpan ke tabel siswa
        const id = await siswaModel.createSiswa({
            nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat,
            kelas_id: kelasIdInt, status: 'aktif'
        });

        // Simpan relasi ke siswa_kelas
        await db.execute(`
            INSERT INTO siswa_kelas (siswa_id, kelas_id, tahun_ajaran_id)
            VALUES (?, ?, ?)
        `, [id, kelasIdInt, taId]);

        res.status(201).json({ message: 'Siswa berhasil ditambahkan', id });
    } catch (err) {
        console.error('Error tambah siswa:', err.message);
        res.status(500).json({ message: err.message || 'Gagal menambah siswa' });
    }
};

const editSiswa = async (req, res) => {
    const { id } = req.params;
    const { nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, kelas_id: namaKelas, status } = req.body;
    try {
        const kelasIdInt = await getKelasIdByName(namaKelas);
        const finalStatus = status !== undefined ? status : 'aktif';

        // Update data siswa
        const updated = await siswaModel.updateSiswa(id, {
            nis, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat,
            kelas_id: kelasIdInt, status: finalStatus
        });

        if (!updated) return res.status(404).json({ message: 'Siswa tidak ditemukan' });

        // Ambil tahun ajaran aktif
        const [activeTA] = await db.execute(`
            SELECT id_tahun_ajaran 
            FROM tahun_ajaran 
            WHERE status = 'aktif' 
            LIMIT 1
        `);
        const taId = activeTA[0]?.id_tahun_ajaran;
        if (!taId) {
            return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
        }

        // Hapus relasi lama
        await db.execute(`
            DELETE FROM siswa_kelas 
            WHERE siswa_id = ? AND tahun_ajaran_id = ?
        `, [id, taId]);

        // Buat relasi baru
        await db.execute(`
            INSERT INTO siswa_kelas (siswa_id, kelas_id, tahun_ajaran_id)
            VALUES (?, ?, ?)
        `, [id, kelasIdInt, taId]);

        res.json({ message: 'Data siswa berhasil diperbarui' });
    } catch (err) {
        console.error('Error edit siswa:', err);
        if (err.message?.includes('tidak ditemukan')) {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Gagal memperbarui data siswa' });
    }
};

const importSiswa = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        if (!req.file) return res.status(400).json({ message: 'File Excel diperlukan' });
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (data.length === 0) throw new Error('File Excel kosong');
        const requiredFields = ['nis', 'nisn', 'nama_lengkap', 'kelas_id'];
        const firstRow = data[0];
        for (const field of requiredFields) {
            if (!(field in firstRow)) throw new Error(`Kolom wajib "${field}" tidak ditemukan`);
        }
        for (const row of data) {
            if (!row.nis || !row.nisn || !row.nama_lengkap || !row.kelas_id) throw new Error(`Data tidak lengkap`);
            let tanggal_lahir = row.tanggal_lahir || '';
            if (typeof tanggal_lahir === 'number') {
                const date = new Date((tanggal_lahir - 25569) * 86400 * 1000);
                if (!isNaN(date.getTime())) {
                    tanggal_lahir = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                } else {
                    tanggal_lahir = null;
                }
            } else if (typeof tanggal_lahir === 'string') {
                tanggal_lahir = tanggal_lahir.trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_lahir)) tanggal_lahir = null;
            } else {
                tanggal_lahir = null;
            }
            const kelasIdInt = await getKelasIdByName(String(row.kelas_id).trim());
            await siswaModel.createSiswa({
                nis: row.nis, nisn: row.nisn, nama_lengkap: row.nama_lengkap,
                tempat_lahir: row.tempat_lahir || '', tanggal_lahir, jenis_kelamin: row.jenis_kelamin || '',
                alamat: row.alamat || '', kelas_id: kelasIdInt, status: 'aktif'
            }, connection);
        }
        await connection.commit();
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Import data siswa berhasil', total: data.length });
    } catch (err) {
        await connection.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: err.message || 'Gagal mengimport data siswa' });
    } finally {
        connection.release();
    }
};

// ============== TAHUN AJARAN ==============
const getTahunAjaran = async (req, res) => {
    try {
        const data = await tahunAjaranModel.getAllTahunAjaran();
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error get tahun ajaran:', err);
        res.status(500).json({ message: 'Gagal mengambil data tahun ajaran' });
    }
};

const tambahTahunAjaran = async (req, res) => {
    try {
        const { tahun1, tahun2, semester, tanggal_pembagian_rapor } = req.body;
        if (!tahun1 || !tahun2 || !semester) {
            return res.status(400).json({ message: 'Tahun dan semester wajib diisi' });
        }
        const tahun_ajaran = `${tahun1}/${tahun2}`;
        const success = await tahunAjaranModel.createTahunAjaran({
            tahun_ajaran, semester, tanggal_pembagian_rapor
        });
        if (!success) return res.status(500).json({ message: 'Gagal membuat tahun ajaran baru' });
        res.status(201).json({ message: 'Tahun ajaran berhasil ditambahkan' });
    } catch (err) {
        console.error('Error tambah tahun ajaran:', err);
        res.status(500).json({ message: 'Gagal menambah tahun ajaran' });
    }
};

const updateTahunAjaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { tahun1, tahun2, semester, tanggal_pembagian_rapor } = req.body;
        if (!tahun1 || !tahun2 || !semester) {
            return res.status(400).json({ message: 'Tahun dan semester wajib diisi' });
        }
        const tahun_ajaran = `${tahun1}/${tahun2}`;
        const success = await tahunAjaranModel.updateTahunAjaranById(id, {
            tahun_ajaran, semester, tanggal_pembagian_rapor
        });
        if (!success) return res.status(404).json({ message: 'Tahun ajaran tidak ditemukan' });
        res.json({ message: 'Data tahun ajaran berhasil diperbarui' });
    } catch (err) {
        console.error('Error update tahun ajaran:', err);
        res.status(500).json({ message: 'Gagal memperbarui data tahun ajaran' });
    }
};

// ============== KELAS ==============
const getKelas = async (req, res) => {
    try {
        const [activeTA] = await db.execute(`
            SELECT id_tahun_ajaran 
            FROM tahun_ajaran 
            WHERE status = 'aktif' 
            LIMIT 1
        `);
        const taId = activeTA[0]?.id_tahun_ajaran;
        if (!taId) {
            return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
        }

        // ✅ Perbaikan: langsung JOIN ke user via user_id (tanpa tabel guru)
        const [rows] = await db.execute(`
    SELECT 
        k.id_kelas AS id,
        k.nama_kelas,
        k.fase,
        COALESCE(u.nama_lengkap, '-') AS wali_kelas,
        COALESCE(gk.user_id, NULL) AS wali_kelas_user_id,  -- ✅ Tambahkan ini
        COUNT(sk.id_siswa) AS jumlah_siswa
    FROM kelas k
    LEFT JOIN guru_kelas gk 
        ON k.id_kelas = gk.kelas_id AND gk.tahun_ajaran_id = ?
    LEFT JOIN user u 
        ON gk.user_id = u.id_user
    LEFT JOIN siswa_kelas sk 
        ON k.id_kelas = sk.kelas_id AND sk.tahun_ajaran_id = ?
    GROUP BY k.id_kelas, k.nama_kelas, k.fase, u.nama_lengkap, gk.user_k
    ORDER BY k.id_kelas ASC
`, [taId, taId]);

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error get kelas:', err);
        res.status(500).json({ message: 'Gagal mengambil data kelas' });
    }
};

const getKelasById = async (req, res) => {
    try {
        const { id } = req.params;
        const kelas = await kelasModel.getById(id);
        if (!kelas) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        res.json({ success: true, data: kelas });
    } catch (err) {
        console.error('Error get kelas by ID:', err);
        res.status(500).json({ message: 'Gagal mengambil detail kelas' });
    }
};

const tambahKelas = async (req, res) => {
    try {
        const { nama_kelas, fase } = req.body;
        if (!nama_kelas || !fase) {
            return res.status(400).json({ message: 'Nama kelas dan fase wajib diisi' });
        }
        const existing = await kelasModel.getAll();
        const isDuplicate = existing.some(k => k.fase === fase);
        if (isDuplicate) {
            return res.status(400).json({ message: `Fase "${fase}" sudah digunakan` });
        }
        const id = await kelasModel.create({ nama_kelas, fase });
        res.status(201).json({ message: 'Kelas berhasil ditambahkan', id });
    } catch (err) {
        console.error('Error tambah kelas:', err);
        res.status(500).json({ message: 'Gagal menambah kelas' });
    }
};

const editKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kelas, fase } = req.body;
        if (!nama_kelas || !fase) {
            return res.status(400).json({ message: 'Nama kelas dan fase wajib diisi' });
        }
        const existingKelas = await kelasModel.getById(id);
        if (!existingKelas) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        const allKelas = await kelasModel.getAll();
        const isDuplicate = allKelas.some(k => k.fase === fase && k.id_kelas !== Number(id));
        if (isDuplicate) {
            return res.status(400).json({ message: `Fase "${fase}" sudah digunakan oleh kelas lain` });
        }
        const success = await kelasModel.update(id, { nama_kelas, fase });
        if (!success) return res.status(404).json({ message: 'Gagal memperbarui kelas' });
        res.json({ message: 'Data kelas berhasil diperbarui' });
    } catch (err) {
        console.error('Error edit kelas:', err);
        res.status(500).json({ message: 'Gagal memperbarui data kelas' });
    }
};

const hapusKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const kelas = await kelasModel.getById(id);
        if (!kelas) return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        const success = await kelasModel.remove(id);
        if (!success) return res.status(404).json({ message: 'Gagal menghapus kelas' });
        res.json({ message: 'Kelas berhasil dihapus' });
    } catch (err) {
        console.error('Error hapus kelas:', err);
        res.status(500).json({ message: 'Gagal menghapus kelas' });
    }
};

// ✅ Perbaikan: kirim user_id, bukan id_guru
const getGuruKelasList = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                u.id_user AS user_id,
                u.nama_lengkap AS nama
            FROM user u
            JOIN user_role ur ON u.id_user = ur.id_user
            WHERE u.status = 'aktif' 
              AND ur.role = 'guru kelas'
            ORDER BY u.nama_lengkap ASC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error get guru kelas list:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar guru kelas' });
    }
};

// ✅ Perbaikan: simpan user_id ke guru_kelas
const setWaliKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body; // ✅ terima user_id

        if (!user_id) {
            return res.status(400).json({ message: 'User ID wajib diisi' });
        }

        const [activeTA] = await db.execute(`
            SELECT id_tahun_ajaran 
            FROM tahun_ajaran 
            WHERE status = 'aktif' 
            LIMIT 1
        `);
        const taId = activeTA[0]?.id_tahun_ajaran;
        if (!taId) {
            return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
        }

        // Hapus lama
        await db.execute(`
            DELETE FROM guru_kelas 
            WHERE kelas_id = ? AND tahun_ajaran_id = ?
        `, [id, taId]);

        // Simpan user_id langsung
        await db.execute(`
            INSERT INTO guru_kelas (user_id, kelas_id, tahun_ajaran_id) 
            VALUES (?, ?, ?)
        `, [user_id, id, taId]);

        res.json({ message: 'Wali kelas berhasil diatur' });
    } catch (err) {
        console.error('Error set wali kelas:', err);
        res.status(500).json({ message: 'Gagal menetapkan wali kelas' });
    }
};

module.exports = {
    getAdmin, getAdminById, tambahAdmin, editAdmin, hapusAdmin,
    getGuru, getGuruById, tambahGuru, editGuru, importGuru,
    getSekolah, editSekolah, uploadLogo,
    getSiswa, getSiswaById, tambahSiswa, editSiswa, importSiswa,
    getTahunAjaran, tambahTahunAjaran, updateTahunAjaran,
    getKelas, getKelasById, tambahKelas, editKelas, hapusKelas,
    getGuruKelasList, setWaliKelas
};