const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let connection;

const connectDB = async () => {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('✅ Terhubung ke MariaDB');
    } catch (error) {
        console.error('❌ Gagal terhubung ke MariaDB:', error.message);
        process.exit(1); // Keluar jika gagal koneksi
    }
};

// Fungsi untuk mendapatkan koneksi
const getConnection = () => {
    return connection;
};

module.exports = { connectDB, getConnection };