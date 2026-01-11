/**
 * Nama File: guruBidangStudiController.js
 * Fungsi: Mengelola seluruh operasi yang hanya boleh diakses oleh guru bidang studi,
 *         termasuk profil, dashboard, pengaturan penilaian (bobot & kategori),
 *         dan manajemen nilai siswa berdasarkan mata pelajaran.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 1 Oktober 2025
 */

const db = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Middleware untuk memastikan hanya pengguna dengan role 'guru bidang studi' yang dapat mengakses endpoint.
 */
exports.ensureGuruBidangStudi = (req, res, next) => {
  if (req.user.role !== 'guru bidang studi') {
    return res
      .status(403)
      .json({ message: 'Akses ditolak: hanya untuk guru bidang studi' });
  }
  next();
};

/**
 * Mengambil data profil guru bidang studi yang sedang login.
 */
exports.getProfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const [userRows] = await db.execute(
      `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
      [userId]
    );
    const [guruRows] = await db.execute(
      `SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = {
      id: userRows[0].id_user,
      role: 'guru bidang studi',
      nama_lengkap: userRows[0].nama_lengkap,
      email_sekolah: userRows[0].email_sekolah,
      niy: guruRows[0]?.niy || null,
      nuptk: guruRows[0]?.nuptk || null,
      jenis_kelamin: guruRows[0]?.jenis_kelamin || null,
      no_telepon: guruRows[0]?.no_telepon || null,
      alamat: guruRows[0]?.alamat || null,
      profileImage: guruRows[0]?.foto_path || null,
    };

    res.json({ user });
  } catch (err) {
    console.error('Error get profil:', err);
    res.status(500).json({ message: 'Gagal mengambil profil' });
  }
};

/**
 * Memperbarui data profil guru bidang studi.
 */
exports.editProfil = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Request body tidak valid' });
    }

    const {
      nama_lengkap,
      email_sekolah,
      niy,
      nuptk,
      jenis_kelamin,
      no_telepon,
      alamat,
    } = req.body;

    if (!nama_lengkap || !email_sekolah) {
      return res.status(400).json({ message: 'Nama dan email wajib diisi' });
    }

    const userId = req.user.id;

    await db.execute(
      `UPDATE user SET nama_lengkap = ?, email_sekolah = ? WHERE id_user = ?`,
      [nama_lengkap, email_sekolah, userId]
    );

    await db.execute(
      `UPDATE guru SET niy = ?, nuptk = ?, jenis_kelamin = ?, no_telepon = ?, alamat = ? WHERE user_id = ?`,
      [niy, nuptk, jenis_kelamin, no_telepon, alamat, userId]
    );

    const [userRows] = await db.execute(
      `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
      [userId]
    );
    const [guruRows] = await db.execute(
      `SELECT niy, nuptk, jenis_kelamin, no_telepon, alamat, foto_path FROM guru WHERE user_id = ?`,
      [userId]
    );

    const user = {
      id: userRows[0].id_user,
      role: 'guru bidang studi',
      nama_lengkap: userRows[0].nama_lengkap,
      email_sekolah: userRows[0].email_sekolah,
      niy: guruRows[0].niy,
      nuptk: guruRows[0].nuptk,
      jenis_kelamin: guruRows[0].jenis_kelamin,
      no_telepon: guruRows[0].no_telepon,
      alamat: guruRows[0].alamat,
      profileImage: guruRows[0].foto_path,
    };

    res.json({ message: 'Profil berhasil diperbarui', user });
  } catch (err) {
    console.error('Error edit profil:', err);
    res.status(500).json({ message: 'Gagal memperbarui profil' });
  }
};

/**
 * Mengganti password akun guru bidang studi.
 */
exports.gantiPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password lama & baru wajib, min. 8 karakter' });
    }

    const [rows] = await db.execute(
      'SELECT password FROM user WHERE id_user = ?',
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch)
      return res.status(400).json({ message: 'Kata sandi lama salah' });

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE user SET password = ? WHERE id_user = ?', [
      newHashedPassword,
      userId,
    ]);

    res.json({ message: 'Kata sandi berhasil diubah' });
  } catch (err) {
    console.error('Error ganti password:', err);
    res.status(500).json({ message: 'Gagal mengubah kata sandi' });
  }
};

/**
 * Mengupload foto profil guru bidang studi.
 */
exports.uploadFotoProfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File foto diperlukan' });
    }

    const userId = req.user.id;
    const fotoPath = `uploads/${req.file.filename}`;

    await db.execute('UPDATE guru SET foto_path = ? WHERE user_id = ?', [
      fotoPath,
      userId,
    ]);

    const [userRows] = await db.execute(
      `SELECT id_user, nama_lengkap, email_sekolah FROM user WHERE id_user = ?`,
      [userId]
    );
    const [guruRows] = await db.execute(
      `SELECT foto_path FROM guru WHERE user_id = ?`,
      [userId]
    );

    const user = {
      id: userRows[0].id_user,
      role: 'guru bidang studi',
      nama_lengkap: userRows[0].nama_lengkap,
      email_sekolah: userRows[0].email_sekolah,
      profileImage: guruRows[0].foto_path,
    };

    res.json({ message: 'Foto profil berhasil diupload', user });
  } catch (err) {
    console.error('Error upload foto:', err);
    res.status(500).json({ message: 'Gagal mengupload foto' });
  }
};

/**
 * Mengambil data dashboard untuk guru bidang studi (tahun ajaran aktif + mata pelajaran yang diajar).
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const [taRows] = await db.execute(
      `SELECT id_tahun_ajaran, tahun_ajaran, semester 
       FROM tahun_ajaran 
       WHERE status = 'aktif' 
       LIMIT 1`
    );

    if (taRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tahun ajaran aktif tidak ditemukan.',
      });
    }

    const { id_tahun_ajaran, tahun_ajaran, semester } = taRows[0];

    const [mapelRows] = await db.execute(
      `
      SELECT 
        mp.nama_mapel AS nama,
        COUNT(DISTINCT p.kelas_id) AS total_kelas,
        COUNT(sk.siswa_id) AS total_siswa
      FROM pembelajaran p
      INNER JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
      LEFT JOIN siswa_kelas sk 
        ON p.kelas_id = sk.kelas_id 
        AND sk.tahun_ajaran_id = ?
      WHERE p.user_id = ? 
        AND p.tahun_ajaran_id = ?
        AND mp.jenis = 'pilihan'
      GROUP BY mp.id_mata_pelajaran, mp.nama_mapel
      ORDER BY mp.nama_mapel
    `,
      [id_tahun_ajaran, userId, id_tahun_ajaran]
    );

    if (mapelRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'Guru belum ditugaskan mengajar mata pelajaran apapun di tahun ajaran ini.',
      });
    }

    const mataPelajaranList = mapelRows.map(row => ({
      nama: row.nama,
      total_kelas: Number(row.total_kelas),
      total_siswa: Number(row.total_siswa),
    }));

    res.json({
      success: true,
      data: {
        tahun_ajaran,
        semester,
        mata_pelajaran_list: mataPelajaranList,
      },
    });
  } catch (err) {
    console.error('Error di getDashboardData:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data dashboard.',
    });
  }
};

/**
 * Mengambil daftar mata pelajaran yang diajar oleh guru bidang studi di tahun ajaran aktif.
 */
exports.getDaftarMapel = async (req, res) => {
  try {
    const userId = req.user.id;

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(400)
        .json({ message: 'Tahun ajaran aktif tidak ditemukan' });
    }
    const taId = taRows[0].id_tahun_ajaran;

    const [rows] = await db.execute(
      `
      SELECT 
        mp.id_mata_pelajaran AS mata_pelajaran_id,
        mp.nama_mapel,
        mp.jenis
      FROM pembelajaran p
      JOIN mata_pelajaran mp ON p.mata_pelajaran_id = mp.id_mata_pelajaran
      WHERE p.user_id = ?
        AND p.tahun_ajaran_id = ?
        AND mp.jenis = 'pilihan' 
      ORDER BY mp.nama_mapel
    `,
      [userId, taId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error getDaftarMapel:', err);
    res.status(500).json({ message: 'Gagal mengambil daftar mata pelajaran' });
  }
};

/**
 * Mengambil daftar komponen penilaian (UH, PTS, PAS, dll).
 */
exports.getKomponenPenilaian = async (req, res) => {
  try {
    const [komponen] = await db.execute(`
      SELECT id_komponen, nama_komponen, urutan
      FROM komponen_penilaian
      ORDER BY urutan ASC
    `);
    res.json({ success: true, data: komponen });
  } catch (err) {
    console.error('Error get komponen:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal mengambil komponen' });
  }
};

/**
 * Mengambil konfigurasi bobot penilaian untuk suatu mata pelajaran.
 */
exports.getBobotPenilaian = async (req, res) => {
  try {
    const { mapelId } = req.params;
    const userId = req.user.id;

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
    }
    const taId = taRows[0].id_tahun_ajaran;

    const [valid] = await db.execute(
      `
      SELECT 1 
      FROM pembelajaran 
      WHERE user_id = ? 
        AND mata_pelajaran_id = ? 
        AND tahun_ajaran_id = ?
    `,
      [userId, mapelId, taId]
    );

    if (valid.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak mengajar mata pelajaran ini',
      });
    }

    const [bobot] = await db.execute(
      `
      SELECT komponen_id, bobot
      FROM konfigurasi_mapel_komponen
      WHERE mapel_id = ? AND is_active = 1
    `,
      [mapelId]
    );

    const bobotMap = {};
    bobot.forEach(b => {
      bobotMap[b.komponen_id] = parseFloat(b.bobot) || 0;
    });

    const [komponenList] = await db.execute(`
      SELECT id_komponen, nama_komponen, urutan
      FROM komponen_penilaian
      ORDER BY urutan ASC
    `);

    const result = komponenList.map(k => ({
      komponen_id: k.id_komponen,
      bobot: bobotMap[k.id_komponen] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error get bobot:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil bobot' });
  }
};

/**
 * Memperbarui konfigurasi bobot penilaian untuk suatu mata pelajaran.
 * Termasuk validasi khusus jika periode PTS sedang aktif.
 */
exports.updateBobotPenilaian = async (req, res) => {
  try {
    const { mapelId } = req.params;
    const bobotList = req.body;
    const userId = req.user.id;

    const total = bobotList.reduce(
      (sum, b) => sum + (parseFloat(b.bobot) || 0),
      0
    );
    if (Math.abs(total - 100) > 0.1) {
      return res
        .status(400)
        .json({ success: false, message: 'Total bobot harus 100%' });
    }

    const [statusRows] = await db.execute(`
      SELECT status_pts, status_pas FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (statusRows.length === 0) {
      return res
        .status(500)
        .json({
          success: false,
          message: 'Tahun ajaran aktif tidak ditemukan',
        });
    }
    const { status_pts } = statusRows[0];
    const isPeriodePTS = status_pts === 'aktif';

    if (isPeriodePTS) {
      const [ptsKomponen] = await db.execute(`
        SELECT id_komponen FROM komponen_penilaian WHERE nama_komponen LIKE '%PTS%' LIMIT 1
      `);
      if (ptsKomponen.length === 0) {
        return res
          .status(500)
          .json({ success: false, message: 'Komponen PTS tidak ditemukan' });
      }
      const ptsKomponenId = ptsKomponen[0].id_komponen;

      const adaBobotNonPTS = bobotList.some(
        b => b.komponen_id !== ptsKomponenId && (parseFloat(b.bobot) || 0) > 0
      );
      if (adaBobotNonPTS) {
        return res.status(400).json({
          success: false,
          message:
            'Di periode PTS, hanya bobot PTS yang boleh diisi. Semua bobot lain harus 0.',
        });
      }

      const bobotPTS = bobotList.find(b => b.komponen_id === ptsKomponenId);
      if (!bobotPTS || Math.abs(parseFloat(bobotPTS.bobot) - 100) > 0.1) {
        return res.status(400).json({
          success: false,
          message: 'Di periode PTS, bobot PTS harus diatur 100%.',
        });
      }
    }

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
    }
    const taId = taRows[0].id_tahun_ajaran;

    const [valid] = await db.execute(
      `
      SELECT 1 
      FROM pembelajaran 
      WHERE user_id = ? AND mata_pelajaran_id = ? AND tahun_ajaran_id = ?
    `,
      [userId, mapelId, taId]
    );

    if (valid.length === 0) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await db.execute(
      `
      DELETE FROM konfigurasi_mapel_komponen 
      WHERE mapel_id = ?
    `,
      [mapelId]
    );

    for (const b of bobotList) {
      await db.execute(
        `
        INSERT INTO konfigurasi_mapel_komponen (mapel_id, komponen_id, bobot, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, NOW(), NOW())
      `,
        [mapelId, b.komponen_id, parseFloat(b.bobot) || 0]
      );
    }

    const [tahunAjaranRow] = await db.execute(`
      SELECT id_tahun_ajaran, semester, status_pts, status_pas
      FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (tahunAjaranRow.length > 0) {
      const ta = tahunAjaranRow[0];
      const jenis_penilaian = ta.status_pts === 'aktif' ? 'PTS' : 'PAS';
      await hitungUlangNilaiRapor(mapelId, ta.id_tahun_ajaran, ta.semester, jenis_penilaian, userId);
    }

    res.json({ success: true, message: 'Bobot penilaian berhasil disimpan dan nilai rapor telah diperbarui otomatis' });
  } catch (err) {
    console.error('Error update bobot:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan bobot' });
  }
};

/**
 * Mengambil daftar kategori nilai akademik untuk suatu mata pelajaran.
 */
exports.getKategoriAkademik = async (req, res) => {
  try {
    const { mapel_id } = req.query;
    if (!mapel_id) {
      return res
        .status(400)
        .json({ success: false, message: 'Parameter mapel_id wajib diisi' });
    }

    const mapelIdNum = parseInt(mapel_id, 10);
    if (isNaN(mapelIdNum) || mapelIdNum <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'mapel_id tidak valid' });
    }

    const [kategori] = await db.execute(
      `
      SELECT 
        id_config AS id, 
        min_nilai, 
        max_nilai, 
        deskripsi, 
        urutan
      FROM konfigurasi_nilai_rapor
      WHERE mapel_id = ?
      ORDER BY urutan ASC
    `,
      [mapelIdNum]
    );

    res.json({ success: true, data: kategori });
  } catch (err) {
    console.error('Error get kategori akademik:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal mengambil kategori akademik' });
  }
};

/**
 * Menambahkan kategori nilai akademik baru untuk suatu mata pelajaran dan tahun ajaran aktif.
 */
exports.createKategoriAkademik = async (req, res) => {
  try {
    const { min_nilai, max_nilai, deskripsi, mapel_id } = req.body;

    if (min_nilai > max_nilai || min_nilai < 0 || max_nilai > 100) {
      return res
        .status(400)
        .json({ success: false, message: 'Range nilai tidak valid' });
    }

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Tahun ajaran aktif belum diatur' });
    }
    const tahun_ajaran_id = taRows[0].id_tahun_ajaran;

    const [result] = await db.execute(
      `
      INSERT INTO konfigurasi_nilai_rapor (
        mapel_id, 
        tahun_ajaran_id, 
        min_nilai, 
        max_nilai, 
        deskripsi, 
        urutan
      )
      VALUES (?, ?, ?, ?, ?, 
        (SELECT IFNULL(MAX(urutan), 0) + 1 
         FROM (SELECT urutan 
               FROM konfigurasi_nilai_rapor 
               WHERE mapel_id = ? AND tahun_ajaran_id = ?) AS tmp)
      )
    `,
      [
        mapel_id,
        tahun_ajaran_id,
        min_nilai,
        max_nilai,
        deskripsi,
        mapel_id,
        tahun_ajaran_id,
      ]
    );

    res.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error create kategori:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal menambah kategori' });
  }
};

/**
 * Memperbarui kategori nilai akademik berdasarkan ID.
 */
exports.updateKategoriAkademik = async (req, res) => {
  try {
    const { id } = req.params;
    let { min_nilai, max_nilai, deskripsi, urutan } = req.body;

    min_nilai = Math.round(parseFloat(min_nilai));
    max_nilai = Math.round(parseFloat(max_nilai));
    urutan = parseInt(urutan) || 0;

    if (min_nilai < 0 || max_nilai > 100 || min_nilai > max_nilai) {
      return res
        .status(400)
        .json({ success: false, message: 'Rentang nilai tidak valid' });
    }

    const [result] = await db.execute(
      `
      UPDATE konfigurasi_nilai_rapor 
      SET 
        min_nilai = ?,
        max_nilai = ?,
        deskripsi = ?,
        urutan = ?
      WHERE id_config = ?
    `,
      [min_nilai, max_nilai, deskripsi, urutan, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Kategori akademik berhasil diperbarui',
    });
  } catch (err) {
    console.error('Error updateKategoriAkademik:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal memperbarui kategori' });
  }
};

/**
 * Menghapus kategori nilai akademik berdasarkan ID.
 */
exports.deleteKategoriAkademik = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      `
      DELETE FROM konfigurasi_nilai_rapor WHERE id_config = ?
    `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('Error delete kategori:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal menghapus kategori' });
  }
};

/**
 * Mengambil daftar kelas yang diajar oleh guru bidang studi di tahun ajaran aktif.
 */
exports.getDaftarKelas = async (req, res) => {
  try {
    const userId = req.user.id;

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Tidak ada tahun ajaran aktif' });
    }
    const taId = taRows[0].id_tahun_ajaran;

    const [kelasRows] = await db.execute(
      `
      SELECT DISTINCT k.id_kelas, k.nama_kelas
      FROM pembelajaran p
      JOIN kelas k ON p.kelas_id = k.id_kelas
      WHERE p.user_id = ? AND p.tahun_ajaran_id = ?
      ORDER BY k.nama_kelas
    `,
      [userId, taId]
    );

    res.json({
      success: true,
      data: kelasRows.map(row => ({
        kelas_id: row.id_kelas,
        nama_kelas: row.nama_kelas,
      })),
    });
  } catch (err) {
    console.error('Error getDaftarKelas:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal mengambil daftar kelas' });
  }
};

/**
 * Mengambil nilai siswa berdasarkan mata pelajaran dan kelas.
 */
exports.getNilaiByMapelAndKelas = async (req, res) => {
  try {
    const { mapelId, kelasId } = req.params;
    const userId = req.user.id;

    if (!mapelId || !kelasId) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'ID mata pelajaran dan kelas wajib diisi',
        });
    }

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran, semester, status_pts, status_pas
      FROM tahun_ajaran
      WHERE status = 'aktif'
      LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(500)
        .json({
          success: false,
          message: 'Tahun ajaran aktif tidak ditemukan',
        });
    }
    const {
      id_tahun_ajaran: tahun_ajaran_id,
      semester,
      status_pts,
      status_pas,
    } = taRows[0];

    let jenis_penilaian_aktif = 'PAS';
    if (status_pts === 'aktif') {
      jenis_penilaian_aktif = 'PTS';
    } else if (status_pas === 'aktif') {
      jenis_penilaian_aktif = 'PAS';
    } else {
      return res.status(403).json({
        success: false,
        message:
          'Periode penilaian tidak aktif. Tidak dapat mengambil data nilai.',
      });
    }

    const [valid] = await db.execute(
      `
      SELECT 1 FROM pembelajaran 
      WHERE user_id = ? AND mata_pelajaran_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?
    `,
      [userId, mapelId, kelasId, tahun_ajaran_id]
    );

    if (valid.length === 0) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Anda tidak mengajar mata pelajaran ini di kelas ini',
        });
    }

    const [namaKelasRow] = await db.execute(
      `SELECT nama_kelas FROM kelas WHERE id_kelas = ?`,
      [kelasId]
    );
    const kelasNama = namaKelasRow[0]?.nama_kelas || 'Kelas Tidak Diketahui';

    const [siswaRows] = await db.execute(
      `
      SELECT s.id_siswa AS id, s.nis, s.nisn, s.nama_lengkap AS nama
      FROM siswa s
      JOIN siswa_kelas sk ON s.id_siswa = sk.siswa_id
      WHERE sk.kelas_id = ? AND sk.tahun_ajaran_id = ?
      ORDER BY s.nama_lengkap
    `,
      [kelasId, tahun_ajaran_id]
    );

    const [komponenRows] = await db.execute(`
      SELECT id_komponen, nama_komponen 
      FROM komponen_penilaian 
      ORDER BY urutan
    `);

    const [bobotRows] = await db.execute(
      `
      SELECT komponen_id, bobot 
      FROM konfigurasi_mapel_komponen 
      WHERE mapel_id = ?
    `,
      [mapelId]
    );

    const [configRows] = await db.execute(
      `
      SELECT min_nilai, max_nilai, deskripsi 
      FROM konfigurasi_nilai_rapor 
      WHERE mapel_id = ?
      ORDER BY min_nilai DESC
    `,
      [mapelId]
    );

    const bobotMap = new Map();
    bobotRows.forEach(b =>
      bobotMap.set(b.komponen_id, parseFloat(b.bobot) || 0)
    );

    const uhKomponenIds = komponenRows
      .filter(k => /^UH\s+\d+$/i.test(k.nama_komponen))
      .map(k => k.id_komponen);
    const ptsKomponen = komponenRows.find(k => /PTS/i.test(k.nama_komponen));
    const pasKomponen = komponenRows.find(k => /PAS/i.test(k.nama_komponen));

    const siswaList = [];
    for (const s of siswaRows) {
      // Ambil nilai komponen untuk tampilan
      const [nilaiDetailRows] = await db.execute(
        `
        SELECT komponen_id, nilai 
        FROM nilai_detail 
        WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?
      `,
        [s.id, mapelId, tahun_ajaran_id]
      );

      const nilaiMap = {};
      nilaiDetailRows.forEach(n => (nilaiMap[n.komponen_id] = n.nilai));

      // ✅ AMBIL NILAI RAPOR LANGSUNG DARI TABEL nilai_rapor
      const [nilaiRaporRow] = await db.execute(
        `SELECT nilai_rapor, deskripsi FROM nilai_rapor 
         WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?`,
        [s.id, mapelId, tahun_ajaran_id]
      );

      let nilaiRaporBulat = 0;
      let deskripsi = 'Belum ada deskripsi';

      if (nilaiRaporRow.length > 0) {
        nilaiRaporBulat = nilaiRaporRow[0].nilai_rapor;
        deskripsi = nilaiRaporRow[0].deskripsi;
      } else {
        // Jika belum ada, hitung ulang (fallback)
        const nilaiUH = uhKomponenIds
          .map(id => nilaiMap[id])
          .filter(v => v != null);
        const rataUH =
          nilaiUH.length > 0
            ? nilaiUH.reduce((a, b) => a + b, 0) / nilaiUH.length
            : 0;
        const totalBobotUH = uhKomponenIds.reduce(
          (sum, id) => sum + (bobotMap.get(id) || 0),
          0
        );
        const nilaiPTS = ptsKomponen ? nilaiMap[ptsKomponen.id_komponen] || 0 : 0;
        const bobotPTS = ptsKomponen
          ? bobotMap.get(ptsKomponen.id_komponen) || 0
          : 0;
        const nilaiPAS = pasKomponen ? nilaiMap[pasKomponen.id_komponen] || 0 : 0;
        const bobotPAS = pasKomponen
          ? bobotMap.get(pasKomponen.id_komponen) || 0
          : 0;

        let nilaiRapor = 0;
        if (totalBobotUH > 0) nilaiRapor += rataUH * totalBobotUH;
        if (bobotPTS > 0) nilaiRapor += nilaiPTS * bobotPTS;
        if (bobotPAS > 0) nilaiRapor += nilaiPAS * bobotPAS;
        nilaiRapor =
          totalBobotUH + bobotPTS + bobotPAS > 0 ? nilaiRapor / 100 : 0;
        nilaiRaporBulat = Math.round(nilaiRapor);

        // Ambil deskripsi dari konfigurasi
        for (const config of configRows) {
          if (
            nilaiRaporBulat >= config.min_nilai &&
            nilaiRaporBulat <= config.max_nilai
          ) {
            deskripsi = config.deskripsi;
            break;
          }
        }
      }

      const nilaiRecord = {};
      komponenRows.forEach(k => {
        nilaiRecord[k.id_komponen] = nilaiMap[k.id_komponen] ?? null;
      });

      siswaList.push({
        id: s.id,
        nama: s.nama,
        nis: s.nis,
        nisn: s.nisn,
        nilai_rapor: nilaiRaporBulat,
        deskripsi: deskripsi,
        nilai: nilaiRecord,
      });
    }

    res.json({
      success: true,
      siswaList,
      komponen: komponenRows,
      kelas: kelasNama,
      jenis_penilaian_aktif,
    });
  } catch (err) {
    console.error('Error getNilaiByMapelAndKelas:', err);
    res
      .status(500)
      .json({ success: false, message: 'Gagal mengambil data nilai' });
  }
};

/**
 * Menyimpan nilai untuk satu komponen penilaian.
 */
exports.simpanNilai = async (req, res) => {
  try {
    const { siswa_id, mapel_id, komponen_id, nilai } = req.body;
    const user_id = req.user.id;

    if (!siswa_id || !mapel_id || !komponen_id || nilai === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'Semua field wajib diisi' });
    }
    if (nilai < 0 || nilai > 100) {
      return res
        .status(400)
        .json({ success: false, message: 'Nilai harus antara 0 dan 100' });
    }

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(500)
        .json({
          success: false,
          message: 'Tahun ajaran aktif tidak ditemukan',
        });
    }
    const taId = taRows[0].id_tahun_ajaran;

    const [valid] = await db.execute(
      `
      SELECT 1 FROM pembelajaran 
      WHERE user_id = ? AND mata_pelajaran_id = ? AND kelas_id IN (
        SELECT kelas_id FROM siswa_kelas 
        WHERE siswa_id = ? AND tahun_ajaran_id = ?
      ) AND tahun_ajaran_id = ?
    `,
      [user_id, mapel_id, siswa_id, taId, taId]
    );

    if (valid.length === 0) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await db.execute(
      `
      INSERT INTO nilai_detail (siswa_id, mapel_id, komponen_id, nilai, tahun_ajaran_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        nilai = VALUES(nilai),
        updated_at = NOW()
    `,
      [siswa_id, mapel_id, komponen_id, nilai, taId]
    );

    res.json({ success: true, message: 'Nilai berhasil disimpan' });
  } catch (err) {
    console.error('Error simpanNilai:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan nilai' });
  }
};

/**
 * Menyimpan nilai untuk banyak komponen sekaligus dan menghitung nilai rapor otomatis.
 */
exports.simpanNilaiKomponenBanyak = async (req, res) => {
  try {
    const { mapelId, siswaId } = req.params;
    const { nilai } = req.body;

    const mapelIdNum = parseInt(mapelId, 10);
    const siswaIdNum = parseInt(siswaId, 10);
    if (isNaN(mapelIdNum) || isNaN(siswaIdNum)) {
      return res
        .status(400)
        .json({ success: false, message: 'ID tidak valid' });
    }

    const userId = req.user.id;

    const [taRows] = await db.execute(`
      SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'aktif' LIMIT 1
    `);
    if (taRows.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Tahun ajaran aktif tidak ditemukan',
        });
    }
    const tahun_ajaran_id = taRows[0].id_tahun_ajaran;

    // Simpan semua nilai ke database
    for (const [komponenIdStr, nilaiSiswa] of Object.entries(nilai)) {
      const komponenId = parseInt(komponenIdStr, 10);
      let nilaiBulat = null;
      if (nilaiSiswa != null && !isNaN(nilaiSiswa)) {
        nilaiBulat = Math.round(parseFloat(nilaiSiswa)); 
        if (nilaiBulat < 0) nilaiBulat = 0;
        if (nilaiBulat > 100) nilaiBulat = 100;
      }

      await db.execute(
        `
        INSERT INTO nilai_detail (siswa_id, mapel_id, komponen_id, nilai, tahun_ajaran_id, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nilai = VALUES(nilai),
          updated_at = NOW()
      `,
        [
          siswaIdNum,
          mapelIdNum,
          komponenId,
          nilaiBulat,
          tahun_ajaran_id,
          userId,
        ]
      );
    }

    // Ambil data untuk perhitungan
    const [statusRows] = await db.execute(
      `SELECT status_pts, status_pas FROM tahun_ajaran WHERE id_tahun_ajaran = ?`,
      [tahun_ajaran_id]
    );
    const isPeriodePTS = statusRows[0]?.status_pts === 'aktif';

    const [komponenRows] = await db.execute(`
      SELECT id_komponen, nama_komponen FROM komponen_penilaian ORDER BY urutan
    `);
    const [bobotRows] = await db.execute(
      `SELECT komponen_id, bobot FROM konfigurasi_mapel_komponen WHERE mapel_id = ?`,
      [mapelIdNum]
    );

    const bobotMap = new Map();
    bobotRows.forEach(row =>
      bobotMap.set(row.komponen_id, parseFloat(row.bobot) || 0)
    );

    const uhKomponenIds = komponenRows
      .filter(k => /^UH\s*\d+$/i.test(k.nama_komponen))
      .map(k => k.id_komponen);
    const ptsKomponen = komponenRows.find(k => /PTS/i.test(k.nama_komponen));
    const pasKomponen = komponenRows.find(k => /PAS/i.test(k.nama_komponen));

    // Ambil nilai terbaru dari DB (pastikan konsisten)
    const [nilaiRows] = await db.execute(
      `SELECT komponen_id, nilai FROM nilai_detail WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?`,
      [siswaIdNum, mapelIdNum, tahun_ajaran_id]
    );
    const nilaiMap = new Map();
    nilaiRows.forEach(row => nilaiMap.set(row.komponen_id, row.nilai));

    // 🔍 DEBUG LOG
    console.log('🔍 DEBUG simpanNilaiKomponenBanyak:');
    console.log('   - Input nilai:', nilai);
    console.log('   - Nilai dari DB:', Object.fromEntries(nilaiMap));
    console.log('   - Bobot:', Object.fromEntries(bobotMap));
    console.log('   - Periode aktif:', isPeriodePTS ? 'PTS' : 'PAS');

    let nilaiRaporBulat = 0;
    let deskripsi = 'Belum ada deskripsi';

    if (isPeriodePTS) {
      const nilaiPTS = ptsKomponen ? nilaiMap.get(ptsKomponen.id_komponen) || 0 : 0;
      nilaiRaporBulat = Math.round(nilaiPTS); 
      console.log('   - Perhitungan PTS: nilai =', nilaiPTS, '→ bulat =', nilaiRaporBulat);
    } else {
      let totalKontribusiUH = 0;
      let totalBobotUH = 0;
      for (const id of uhKomponenIds) {
        const n = nilaiMap.get(id) || 0;
        const b = bobotMap.get(id) || 0;
        totalKontribusiUH += n * b;
        totalBobotUH += b;
      }

      const nilaiPTS = ptsKomponen ? nilaiMap.get(ptsKomponen.id_komponen) || 0 : 0;
      const bobotPTS = ptsKomponen ? bobotMap.get(ptsKomponen.id_komponen) || 0 : 0;
      const nilaiPAS = pasKomponen ? nilaiMap.get(pasKomponen.id_komponen) || 0 : 0;
      const bobotPAS = pasKomponen ? bobotMap.get(pasKomponen.id_komponen) || 0 : 0;

      const totalBobot = totalBobotUH + bobotPTS + bobotPAS;
      let nilaiRapor = 0;
      if (totalBobot > 0) {
        nilaiRapor = (totalKontribusiUH + nilaiPTS * bobotPTS + nilaiPAS * bobotPAS) / totalBobot;
      }

      nilaiRaporBulat = Math.round(nilaiRapor); 

      console.log('   - Perhitungan PAS:');
      console.log('     Total Kontribusi UH:', totalKontribusiUH);
      console.log('     Total Bobot UH:', totalBobotUH);
      console.log('     Nilai PTS:', nilaiPTS, '| Bobot:', bobotPTS);
      console.log('     Nilai PAS:', nilaiPAS, '| Bobot:', bobotPAS);
      console.log('     Total Bobot:', totalBobot);
      console.log('     Nilai Rapor Mentah:', nilaiRapor, '→ Bulat:', nilaiRaporBulat);
    }

    // Ambil deskripsi
    const [configRows] = await db.execute(
      `SELECT min_nilai, max_nilai, deskripsi 
       FROM konfigurasi_nilai_rapor 
       WHERE mapel_id = ?
       ORDER BY min_nilai DESC`,
      [mapelIdNum]
    );

    for (const config of configRows) {
      if (
        nilaiRaporBulat >= config.min_nilai &&
        nilaiRaporBulat <= config.max_nilai
      ) {
        deskripsi = config.deskripsi;
        break;
      }
    }

    // Simpan ke nilai_rapor
    const [kelasRows] = await db.execute(
      `SELECT kelas_id FROM pembelajaran 
       WHERE mata_pelajaran_id = ? AND user_id = ? AND tahun_ajaran_id = ?
       LIMIT 1`,
      [mapelIdNum, userId, tahun_ajaran_id]
    );
    if (kelasRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Kelas tidak ditemukan' });
    }
    const kelas_id = kelasRows[0].kelas_id;

    const [semesterRows] = await db.execute(`SELECT semester FROM tahun_ajaran WHERE id_tahun_ajaran = ?`, [tahun_ajaran_id]);
    const semester = semesterRows.length > 0 && (semesterRows[0].semester || '').trim().toLowerCase() === 'ganjil' ? 'Ganjil' : 'Genap';

    await db.execute(
      `INSERT INTO nilai_rapor (
        siswa_id, mapel_id, kelas_id, tahun_ajaran_id, semester,
        nilai_rapor, deskripsi, created_by_user_id, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        nilai_rapor = VALUES(nilai_rapor),
        deskripsi = VALUES(deskripsi),
        updated_at = NOW()`,
      [
        siswaIdNum,
        mapelIdNum,
        kelas_id,
        tahun_ajaran_id,
        semester,
        nilaiRaporBulat,
        deskripsi,
        userId,
      ]
    );

    res.json({
      success: true,
      message: 'Nilai komponen berhasil disimpan',
      nilai_rapor: nilaiRaporBulat,
      deskripsi: deskripsi,
    });

  } catch (err) {
    console.error('❌ Error simpanNilaiKomponenBanyak:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan nilai' });
  }
};

// Helper: Hitung ulang nilai rapor untuk semua siswa di mapel tertentu
const hitungUlangNilaiRapor = async (mapelId, tahun_ajaran_id, semester, jenis_penilaian, userId) => {
  // Ambil semua siswa yang punya nilai di mapel ini
  const [siswaRows] = await db.execute(
    `SELECT DISTINCT siswa_id FROM nilai_detail WHERE mapel_id = ? AND tahun_ajaran_id = ?`,
    [mapelId, tahun_ajaran_id]
  );

  // Ambil komponen & bobot terbaru
  const [komponenRows] = await db.execute(`
    SELECT id_komponen, nama_komponen FROM komponen_penilaian ORDER BY urutan
  `);
  const [bobotRows] = await db.execute(
    `SELECT komponen_id, bobot FROM konfigurasi_mapel_komponen WHERE mapel_id = ?`,
    [mapelId]
  );
  const bobotMap = new Map();
  bobotRows.forEach(b => bobotMap.set(b.komponen_id, parseFloat(b.bobot) || 0));

  const uhKomponenIds = komponenRows.filter(k => /^UH\s*\d+$/i.test(k.nama_komponen)).map(k => k.id_komponen);
  const ptsKomponen = komponenRows.find(k => /PTS/i.test(k.nama_komponen));
  const pasKomponen = komponenRows.find(k => /PAS/i.test(k.nama_komponen));

  // Ambil kelas_id dari pembelajaran
  const [kelasRow] = await db.execute(
    `SELECT kelas_id FROM pembelajaran WHERE mata_pelajaran_id = ? AND user_id = ? AND tahun_ajaran_id = ? LIMIT 1`,
    [mapelId, userId, tahun_ajaran_id]
  );
  const kelas_id = kelasRow[0]?.kelas_id;

  for (const s of siswaRows) {
    const siswaId = s.siswa_id;

    // Ambil nilai komponen terbaru
    const [nilaiRows] = await db.execute(
      `SELECT komponen_id, nilai FROM nilai_detail WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?`,
      [siswaId, mapelId, tahun_ajaran_id]
    );
    const nilaiMap = new Map();
    nilaiRows.forEach(n => nilaiMap.set(n.komponen_id, n.nilai));

    let nilaiRapor = 0;
    if (jenis_penilaian === 'PTS') {
      const nilaiPTS = ptsKomponen ? nilaiMap.get(ptsKomponen.id_komponen) || 0 : 0;
      nilaiRapor = nilaiPTS;
    } else {
      // Perhitungan fleksibel per komponen
      let totalKontribusiUH = 0;
      for (const id of uhKomponenIds) {
        const n = nilaiMap.get(id) || 0;
        const b = bobotMap.get(id) || 0;
        totalKontribusiUH += n * b;
      }
      const nilaiPTS = ptsKomponen ? nilaiMap.get(ptsKomponen.id_komponen) || 0 : 0;
      const bobotPTS = ptsKomponen ? bobotMap.get(ptsKomponen.id_komponen) || 0 : 0;
      const nilaiPAS = pasKomponen ? nilaiMap.get(pasKomponen.id_komponen) || 0 : 0;
      const bobotPAS = pasKomponen ? bobotMap.get(pasKomponen.id_komponen) || 0 : 0;

      const totalBobot = uhKomponenIds.reduce((sum, id) => sum + (bobotMap.get(id) || 0), 0) + bobotPTS + bobotPAS;
      if (totalBobot > 0) {
        nilaiRapor = (totalKontribusiUH + nilaiPTS * bobotPTS + nilaiPAS * bobotPAS) / totalBobot;
      }
    }

    const nilaiRaporBulat = Math.round(nilaiRapor);

    // Ambil deskripsi
    const [configRows] = await db.execute(
      `SELECT min_nilai, max_nilai, deskripsi 
       FROM konfigurasi_nilai_rapor 
       WHERE mapel_id = ? AND ? BETWEEN min_nilai AND max_nilai
       ORDER BY min_nilai DESC LIMIT 1`,
      [mapelId, nilaiRaporBulat]
    );
    const deskripsi = configRows[0]?.deskripsi || 'Belum ada deskripsi';

    // Simpan ke nilai_rapor
    await db.execute(
      `INSERT INTO nilai_rapor (
        siswa_id, mapel_id, kelas_id, tahun_ajaran_id, semester,
        nilai_rapor, deskripsi, jenis_penilaian, created_by_user_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        nilai_rapor = VALUES(nilai_rapor),
        deskripsi = VALUES(deskripsi),
        updated_at = NOW()`,
      [
        siswaId,
        mapelId,
        kelas_id,
        tahun_ajaran_id,
        semester,
        nilaiRaporBulat,
        deskripsi,
        jenis_penilaian,
        userId
      ]
    );
  }
};

/**
 * Mengambil informasi tahun ajaran aktif (termasuk status PTS/PAS).
 */
exports.getTahunAjaranAktif = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id_tahun_ajaran,
        tahun_ajaran,
        semester,
        status_pts,
        status_pas
      FROM tahun_ajaran
      WHERE status = 'aktif'
      LIMIT 1
    `);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tahun ajaran aktif belum diatur oleh admin.',
      });
    }
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('Error getTahunAjaranAktif:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil tahun ajaran aktif',
    });
  }
};
