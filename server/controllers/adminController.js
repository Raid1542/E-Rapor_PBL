const XLSX = require('xlsx');
const userModel = require('../models/userModel');
const guruModel = require('../models/guruModel');
const sekolahModel = require('../models/sekolahModel');
const tahunAjaranModel = require('../models/tahunAjaranModel');
const siswaModel = require('../models/siswaModel');
const kelasModel = require('../models/kelasModel');
const mapelModel = require('../models/mapelModel');
const pembelajaranModel = require('../models/pembelajaranModel');
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
        const [rows] = await db.execute(`
            SELECT 
                u.id_user,
                u.nama_lengkap,
                u.email_sekolah,
                u.status,
                g.id_guru,
                g.niy,
                g.nuptk,
                g.tempat_lahir,
                g.tanggal_lahir,
                g.jenis_kelamin,
                g.alamat,
                g.no_telepon,
                ur.role
            FROM user u
            INNER JOIN guru g ON u.id_user = g.user_id
            INNER JOIN user_role ur ON u.id_user = ur.id_user
            WHERE ur.role IN ('guru kelas', 'guru bidang studi')
            ORDER BY u.nama_lengkap ASC, ur.role ASC
        `);

        const guruMap = new Map();
        for (const row of rows) {
            const {
                id_user,
                nama_lengkap,
                email_sekolah,
                status,
                id_guru,
                niy,
                nuptk,
                tempat_lahir,
                tanggal_lahir,
                jenis_kelamin,
                alamat,
                no_telepon,
                role
            } = row;

            if (!guruMap.has(id_user)) {
                guruMap.set(id_user, {
                    id: id_user,
                    nama: nama_lengkap,
                    email: email_sekolah,
                    status: status,
                    niy: niy,
                    nuptk: nuptk,
                    tempat_lahir: tempat_lahir,
                    tanggal_lahir: tanggal_lahir,
                    jenis_kelamin: jenis_kelamin,
                    alamat: alamat,
                    no_telepon: no_telepon,
                    roles: []
                });
            }
            if (role && !guruMap.get(id_user).roles.includes(role)) {
                guruMap.get(id_user).roles.push(role);
            }
        }

        const guruList = Array.from(guruMap.values());
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
        console.error('Error get guru by ID:', err);
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
        console.error('Error edit guru:', err);
        res.status(500).json({ message: 'Gagal memperbarui data guru' });
    }
};

const importGuru = async (req, res) => {
    const connection = await db.getConnection();
    try {
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

        await connection.beginTransaction();
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
            await guruModel.createGuru(userData, guruData, validRoles, connection);
        }

        await connection.commit();
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Import data guru berhasil', total: data.length });
    } catch (err) {
        await connection.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('Import guru error:', err);
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
        const { tahun_ajaran_id } = req.query;
        if (!tahun_ajaran_id) {
            return res.status(400).json({ message: 'Tahun ajaran wajib dipilih' });
        }
        const siswaList = await siswaModel.getSiswaByTahunAjaran(tahun_ajaran_id);
        res.json({ success: true, data: siswaList });
    } catch (err) {
        console.error('Error get siswa:', err);
        res.status(500).json({ message: 'Gagal mengambil data siswa' });
    }
};

const getSiswaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [activeTA] = await db.execute(`
            SELECT id_tahun_ajaran 
            FROM tahun_ajaran 
            WHERE status = 'aktif' 
            LIMIT 1
        `);
        const taId = activeTA[0]?.id_tahun_ajaran;
        const siswa = await siswaModel.getSiswaById(id, taId);
        if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        res.json({ success: true, data: siswa });
    } catch (err) {
        console.error('Error get siswa by ID:', err);
        res.status(500).json({ message: 'Gagal mengambil detail siswa' });
    }
};

const tambahSiswa = async (req, res) => {
    try {
        const {
            nis,
            nisn,
            nama_lengkap,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            alamat,
            kelas_id,
            tahun_ajaran_id
        } = req.body;

        if (tahun_ajaran_id != req.tahunAjaranAktifId) {
            return res.status(403).json({
                message: 'Operasi hanya diperbolehkan di tahun ajaran aktif.'
            });
        }

        const parsedKelasId = Number(kelas_id);
        if (isNaN(parsedKelasId) || parsedKelasId <= 0) {
            return res.status(400).json({ message: 'kelas_id tidak valid' });
        }

        const siswaId = await siswaModel.createSiswa({
            nis,
            nisn,
            nama_lengkap,
            tempat_lahir: tempat_lahir || null,
            tanggal_lahir: tanggal_lahir || null,
            jenis_kelamin,
            alamat: alamat || null,
            kelas_id: parsedKelasId,
            status: 'aktif'
        }, tahun_ajaran_id);

        res.status(201).json({ success: true, message: 'Data siswa berhasil ditambahkan', id: siswaId });
    } catch (err) {
        console.error('Error tambah siswa:', err);
        res.status(500).json({ message: 'Gagal menambah data siswa' });
    }
};

const editSiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nis,
            nisn,
            nama_lengkap,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            alamat,
            kelas_id,
            status
        } = req.body;

        const tahunAjaranId = req.tahunAjaranAktifId;
        if (!tahunAjaranId) {
            return res.status(400).json({ message: 'Tidak ada tahun ajaran aktif' });
        }

        const [siswaRows] = await db.execute(`
            SELECT sk.tahun_ajaran_id 
            FROM siswa s
            JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
            WHERE s.id_siswa = ? AND sk.tahun_ajaran_id = ?
        `, [id, tahunAjaranId]);

        if (siswaRows.length === 0) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan di tahun ajaran aktif' });
        }

        const parsedKelasId = Number(kelas_id);
        if (isNaN(parsedKelasId) || parsedKelasId <= 0) {
            return res.status(400).json({ message: 'kelas_id tidak valid' });
        }

        const updated = await siswaModel.updateSiswa(id, {
            nis,
            nisn,
            nama_lengkap,
            tempat_lahir: tempat_lahir || null,
            tanggal_lahir: tanggal_lahir || null,
            jenis_kelamin,
            alamat: alamat || null,
            kelas_id: parsedKelasId,
            status: status || 'aktif'
        }, tahunAjaranId);

        if (!updated) {
            return res.status(404).json({ message: 'Gagal memperbarui data siswa' });
        }

        res.json({ success: true, message: 'Data siswa berhasil diperbarui' });
    } catch (err) {
        console.error('Error edit siswa:', err);
        res.status(500).json({ message: 'Gagal memperbarui data siswa' });
    }
};

const importSiswa = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!req.file) return res.status(400).json({ message: 'File Excel diperlukan' });

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (data.length === 0) throw new Error('File Excel kosong');

        const tahunAjaranId = req.tahunAjaranAktifId;
        if (!tahunAjaranId) {
            throw new Error('Tidak ada tahun ajaran aktif');
        }

        await connection.beginTransaction();

        for (const row of data) {
            if (!row.nis || !row.nisn || !row.nama_lengkap || !row.kelas_id) {
                throw new Error('Kolom wajib (nis, nisn, nama_lengkap, kelas_id) tidak lengkap');
            }

            let tanggal_lahir = row.tanggal_lahir || null;
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
            }

            const [kelasRows] = await connection.execute(
                'SELECT id_kelas FROM kelas WHERE nama_kelas = ?',
                [String(row.kelas_id).trim()]
            );
            if (kelasRows.length === 0) {
                throw new Error(`Kelas "${row.kelas_id}" tidak ditemukan`);
            }
            const kelasId = kelasRows[0].id_kelas;

            await siswaModel.createSiswa({
                nis: row.nis,
                nisn: row.nisn,
                nama_lengkap: row.nama_lengkap,
                tempat_lahir: row.tempat_lahir || null,
                tanggal_lahir,
                jenis_kelamin: row.jenis_kelamin || 'Laki-laki',
                alamat: row.alamat || null,
                kelas_id: kelasId,
                status: 'aktif'
            }, tahunAjaranId, connection);
        }

        await connection.commit();
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Import data siswa berhasil', total: data.length });
    } catch (err) {
        await connection.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('Import siswa error:', err);
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
        // ✅ Ambil tahun_ajaran_id dari query, bukan hanya aktif
        const { tahun_ajaran_id } = req.query;
        if (!tahun_ajaran_id) {
            return res.status(400).json({ message: 'Tahun ajaran wajib dipilih' });
        }

        const [rows] = await db.execute(`
            SELECT 
                k.id_kelas AS id,
                k.nama_kelas,
                k.fase,
                COALESCE(u.nama_lengkap, '-') AS wali_kelas,
                COUNT(sk.siswa_id) AS jumlah_siswa
            FROM kelas k
            INNER JOIN (
                SELECT DISTINCT kelas_id FROM guru_kelas WHERE tahun_ajaran_id = ?
                UNION
                SELECT DISTINCT kelas_id FROM siswa_kelas WHERE tahun_ajaran_id = ?
            ) active_classes ON k.id_kelas = active_classes.kelas_id
            LEFT JOIN guru_kelas gk ON k.id_kelas = gk.kelas_id AND gk.tahun_ajaran_id = ?
            LEFT JOIN user u ON gk.user_id = u.id_user
            LEFT JOIN siswa_kelas sk ON k.id_kelas = sk.kelas_id AND sk.tahun_ajaran_id = ?
            GROUP BY k.id_kelas, k.nama_kelas, k.fase, u.nama_lengkap
            ORDER BY k.nama_kelas ASC
        `, [tahun_ajaran_id, tahun_ajaran_id, tahun_ajaran_id, tahun_ajaran_id]);

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

const getKelasForDropdown = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                id_kelas AS id,
                nama_kelas AS nama,
                fase
            FROM kelas
            ORDER BY nama_kelas ASC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error get kelas for dropdown:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar kelas' });
    }
};

const tambahKelas = async (req, res) => {
    try {
        const { nama_kelas, fase } = req.body;
        if (!nama_kelas || !fase) {
            return res.status(400).json({ message: 'Nama kelas dan fase wajib diisi' });
        }
        const existing = await kelasModel.getAll();
        const isDuplicate = existing.some(k => k.nama_kelas === nama_kelas);
        if (isDuplicate) {
            return res.status(400).json({ message: `Kelas dengan nama "${nama_kelas}" sudah ada` });
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
        const isDuplicate = allKelas.some(k => k.nama_kelas === nama_kelas && k.id_kelas !== Number(id));
        if (isDuplicate) {
            return res.status(400).json({ message: `Nama kelas "${nama_kelas}" sudah digunakan` });
        }
        const success = await kelasModel.update(id, { nama_kelas, fase });
        if (!success) return res.status(404).json({ message: 'Gagal memperbarui kelas' });
        res.json({ message: 'Data kelas berhasil diperbarui' });
    } catch (err) {
        console.error('Error edit kelas:', err);
        res.status(500).json({ message: 'Gagal memperbarui data kelas' });
    }
};

// ============== GURU KELAS ==============

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

const setWaliKelas = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

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

        await db.execute(`
            DELETE FROM guru_kelas 
            WHERE kelas_id = ? AND tahun_ajaran_id = ?
        `, [id, taId]);

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

// ============== MATA PELAJARAN ==============

const getMataPelajaran = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        if (!tahun_ajaran_id || isNaN(Number(tahun_ajaran_id))) {
            return res.status(400).json({ message: 'tahun_ajaran_id wajib diisi dan harus angka' });
        }

        const rows = await mapelModel.getAllByTahunAjaran(Number(tahun_ajaran_id));
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error get mata pelajaran:', err);
        res.status(500).json({ message: 'Gagal mengambil data mata pelajaran' });
    }
};

const getMataPelajaranById = async (req, res) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (isNaN(idNum)) {
            return res.status(400).json({ message: 'ID tidak valid' });
        }

        const rows = await mapelModel.getById(idNum);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('Error get mata pelajaran by ID:', err);
        res.status(500).json({ message: 'Gagal mengambil detail mata pelajaran' });
    }
};

const tambahMataPelajaran = async (req, res) => {
    try {
        console.log('=== Tambah Mata Pelajaran ===');
        console.log('Req Body:', req.body);
        console.log('Req Params:', req.params);

        const { kode_mapel, nama_mapel, jenis, kurikulum, tahun_ajaran_id } = req.body;

        if (!kode_mapel || !nama_mapel || !jenis || !kurikulum || !tahun_ajaran_id) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        const allowedJenis = ['wajib', 'bidang studi'];
        if (!allowedJenis.includes(jenis)) {
            return res.status(400).json({ message: 'Jenis tidak valid' });
        }

        const taId = Number(tahun_ajaran_id);
        if (isNaN(taId)) {
            return res.status(400).json({ message: 'tahun_ajaran_id harus angka' });
        }

        const taValid = await mapelModel.isTahunAjaranValid(taId);
        if (!taValid) {
            return res.status(400).json({ message: 'Tahun ajaran tidak valid' });
        }

        const isDuplicate = await mapelModel.isKodeMapelExist(kode_mapel.trim().toUpperCase(), taId);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Kode mapel sudah digunakan di tahun ajaran ini' });
        }

        // ✅ TANPA DESTRUCTURING
        const result = await mapelModel.create({
            kode_mapel: kode_mapel.trim().toUpperCase(),
            nama_mapel: nama_mapel.trim(),
            jenis,
            kurikulum: kurikulum.trim(),
            tahun_ajaran_id: taId
        });

        res.status(201).json({
            message: 'Mata pelajaran berhasil ditambahkan',
            id: result.insertId
        });

    } catch (err) {
        console.error('Error tambah mata pelajaran:', err);
        res.status(500).json({ message: 'Gagal menambah mata pelajaran' });
    }
};

const editMataPelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);

        if (isNaN(idNum)) {
            return res.status(400).json({ message: 'ID tidak valid' });
        }

        const { kode_mapel, nama_mapel, jenis, kurikulum } = req.body;

        // ✅ Trim semua input
        const trimmedKodeMapel = (kode_mapel || '').toString().trim();
        const trimmedNamaMapel = (nama_mapel || '').toString().trim();
        const trimmedJenis = (jenis || '').toString().trim();
        const trimmedKurikulum = (kurikulum || '').toString().trim();

        // ✅ Validasi field wajib
        if (!trimmedKodeMapel || !trimmedNamaMapel || !trimmedJenis || !trimmedKurikulum) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // ✅ Validasi jenis
        const allowedJenis = ['wajib', 'bidang studi'];
        if (!allowedJenis.includes(trimmedJenis)) {
            return res.status(400).json({ message: 'Jenis tidak valid. Harus "wajib" atau "bidang studi".' });
        }

        // ✅ Ambil data lama untuk dapatkan tahun_ajaran_id
        const [oldMapel] = await db.execute(
            'SELECT tahun_ajaran_id FROM mata_pelajaran WHERE id_mata_pelajaran = ?',
            [idNum]
        );

        if (oldMapel.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }

        const taId = oldMapel[0].tahun_ajaran_id;

        // ✅ Cek duplikat (abaikan ID saat ini)
        const isDuplicate = await mapelModel.isKodeMapelExist(trimmedKodeMapel.toUpperCase(), taId, idNum);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Kode mapel sudah digunakan di tahun ajaran ini' });
        }

        // ✅ Update data
        const result = await mapelModel.update(idNum, {
            kode_mapel: trimmedKodeMapel.toUpperCase(),
            nama_mapel: trimmedNamaMapel,
            jenis: trimmedJenis,
            kurikulum: trimmedKurikulum,
            tahun_ajaran_id: taId
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }

        res.json({ message: 'Data mata pelajaran berhasil diperbarui' });
    } catch (err) {
        console.error('Error edit mata pelajaran:', err);
        res.status(500).json({ message: 'Gagal memperbarui data mata pelajaran' });
    }
};

const hapusMataPelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (isNaN(idNum)) {
            return res.status(400).json({ message: 'ID tidak valid' });
        }

        // Cek apakah masih dipakai di tabel nilai
        const [nilaiRows] = await db.execute(
            'SELECT id_nilai FROM nilai WHERE mapel_id = ? LIMIT 1',
            [idNum]
        );
        if (nilaiRows.length > 0) {
            return res.status(400).json({ message: 'Tidak bisa dihapus: mata pelajaran ini sudah digunakan di data nilai' });
        }

        const result = await mapelModel.delete(idNum);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
        }

        res.json({ message: 'Mata pelajaran berhasil dihapus' });
    } catch (err) {
        console.error('Error hapus mata pelajaran:', err);
        res.status(500).json({ message: 'Gagal menghapus mata pelajaran' });
    }
};

// ============== DATA PEMBELAJARAN ==============

const getPembelajaran = async (req, res) => {
    try {
        pembelajaranModel.getAll((err, results) => {
            if (err) {
                console.error('Error get pembelajaran:', err);
                return res.status(500).json({ message: 'Gagal mengambil data pembelajaran' });
            }
            res.json({ success: true, data: results });
        });
    } catch (err) {
        console.error('Error get pembelajaran:', err);
        res.status(500).json({ message: 'Gagal mengambil data pembelajaran' });
    }
};

const tambahPembelajaran = async (req, res) => {
    try {
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = req.body;

        // Validasi input wajib
        if (!user_id || !mapel_id || !kelas_id || !tahun_ajaran_id) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // Validasi: apakah mata pelajaran valid untuk tahun ajaran ini?
        const isValidMapel = await new Promise((resolve, reject) => {
            pembelajaranModel.isValidMapelForTahunAjaran(mapel_id, tahun_ajaran_id, (err, valid) => {
                if (err) reject(err);
                else resolve(valid);
            });
        });

        if (!isValidMapel) {
            return res.status(400).json({ message: 'Mata pelajaran tidak valid untuk tahun ajaran yang dipilih' });
        }

        // Cek duplikasi
        const isDuplicate = await new Promise((resolve, reject) => {
            pembelajaranModel.isDuplicate(user_id, mapel_id, kelas_id, tahun_ajaran_id, (err, duplicate) => {
                if (err) reject(err);
                else resolve(duplicate);
            });
        });

        if (isDuplicate) {
            return res.status(400).json({ message: 'Penugasan guru untuk mapel ini di kelas dan tahun ajaran tersebut sudah ada' });
        }

        // Simpan data
        pembelajaranModel.create({ user_id, mapel_id, kelas_id, tahun_ajaran_id }, (err, result) => {
            if (err) {
                console.error('Error tambah pembelajaran:', err);
                return res.status(500).json({ message: 'Gagal menambah data pembelajaran' });
            }
            res.status(201).json({ message: 'Data pembelajaran berhasil ditambahkan', id: result.insertId });
        });
    } catch (err) {
        console.error('Error tambah pembelajaran:', err);
        res.status(500).json({ message: 'Gagal menambah data pembelajaran' });
    }
};

const editPembelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, mapel_id, kelas_id, tahun_ajaran_id } = req.body;

        if (!user_id || !mapel_id || !kelas_id || !tahun_ajaran_id) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // Validasi mata pelajaran untuk tahun ajaran
        const isValidMapel = await new Promise((resolve, reject) => {
            pembelajaranModel.isValidMapelForTahunAjaran(mapel_id, tahun_ajaran_id, (err, valid) => {
                if (err) reject(err);
                else resolve(valid);
            });
        });

        if (!isValidMapel) {
            return res.status(400).json({ message: 'Mata pelajaran tidak valid untuk tahun ajaran yang dipilih' });
        }

        // Cek duplikasi (abaikan ID saat ini)
        const [existing] = await db.execute(
            'SELECT user_id, mapel_id, kelas_id, tahun_ajaran_id FROM guru_bidang_studi WHERE id_guru_bidang_studi = ?',
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Data pembelajaran tidak ditemukan' });
        }

        const isSame = (
            existing[0].user_id == user_id &&
            existing[0].mapel_id == mapel_id &&
            existing[0].kelas_id == kelas_id &&
            existing[0].tahun_ajaran_id == tahun_ajaran_id
        );

        if (!isSame) {
            const isDuplicate = await new Promise((resolve, reject) => {
                pembelajaranModel.isDuplicate(user_id, mapel_id, kelas_id, tahun_ajaran_id, (err, duplicate) => {
                    if (err) reject(err);
                    else resolve(duplicate);
                });
            });

            if (isDuplicate) {
                return res.status(400).json({ message: 'Penugasan tersebut sudah ada' });
            }
        }

        pembelajaranModel.update(id, { user_id, mapel_id, kelas_id, tahun_ajaran_id }, (err, result) => {
            if (err) {
                console.error('Error edit pembelajaran:', err);
                return res.status(500).json({ message: 'Gagal memperbarui data pembelajaran' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Data pembelajaran tidak ditemukan' });
            }
            res.json({ message: 'Data pembelajaran berhasil diperbarui' });
        });
    } catch (err) {
        console.error('Error edit pembelajaran:', err);
        res.status(500).json({ message: 'Gagal memperbarui data pembelajaran' });
    }
};

const hapusPembelajaran = async (req, res) => {
    try {
        const { id } = req.params;
        pembelajaranModel.delete(id, (err, result) => {
            if (err) {
                console.error('Error hapus pembelajaran:', err);
                return res.status(500).json({ message: 'Gagal menghapus data pembelajaran' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Data pembelajaran tidak ditemukan' });
            }
            res.json({ message: 'Data pembelajaran berhasil dihapus' });
        });
    } catch (err) {
        console.error('Error hapus pembelajaran:', err);
        res.status(500).json({ message: 'Gagal menghapus data pembelajaran' });
    }
};

// ============== DROPDOWN UNTUK FORM PEMBELAJARAN ==============

const getGuruBidangStudiForDropdown = async (req, res) => {
    try {
        const results = await pembelajaranModel.getGuruBidangStudiList();
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error get guru bidang studi dropdown:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar guru bidang studi' });
    }
};

const getMapelForDropdown = async (req, res) => {
    try {
        const { tahun_ajaran_id } = req.query;
        if (!tahun_ajaran_id || isNaN(Number(tahun_ajaran_id))) {
            return res.status(400).json({ message: 'tahun_ajaran_id wajib diisi dan harus angka' });
        }

        pembelajaranModel.getMapelByTahunAjaran(Number(tahun_ajaran_id), (err, results) => {
            if (err) {
                console.error('Error get mapel dropdown:', err);
                return res.status(500).json({ message: 'Gagal mengambil daftar mata pelajaran' });
            }
            res.json({ success: true, data: results });
        });
    } catch (err) {
        console.error('Error get mapel dropdown:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar mata pelajaran' });
    }
};

// Dropdown kelas dan tahun ajaran sudah ada di fungsi lain, bisa reuse
const getTahunAjaranForDropdown = async (req, res) => {
    try {
        const data = await tahunAjaranModel.getAllTahunAjaran();
        res.json({ success: true, data });
    } catch (err) {
        console.error('Error get tahun ajaran dropdown:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar tahun ajaran' });
    }
};

module.exports = {
    getAdmin, getAdminById, tambahAdmin, editAdmin, hapusAdmin,
    getGuru, getGuruById, tambahGuru, editGuru, importGuru,
    getSekolah, editSekolah, uploadLogo,
    getSiswa, getSiswaById, tambahSiswa, editSiswa, importSiswa,
    getTahunAjaran, tambahTahunAjaran, updateTahunAjaran,
    getKelas, getKelasById, tambahKelas, editKelas, getKelasForDropdown,
    getGuruKelasList, setWaliKelas,
    getMataPelajaran, getMataPelajaranById, tambahMataPelajaran, editMataPelajaran, hapusMataPelajaran,
    getPembelajaran, tambahPembelajaran, editPembelajaran, hapusPembelajaran,
    getGuruBidangStudiForDropdown, getMapelForDropdown, getTahunAjaranForDropdown
};