const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tambahkan logging
pool.getConnection()
    .then(() => {
        console.log('✅ Koneksi ke MariaDB berhasil');
    })
    .catch((err) => {
        console.error('❌ Gagal koneksi ke MariaDB:', err.message);
        process.exit(1); // Hentikan server jika koneksi gagal
    });

module.exports = pool;