
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Koneksi ke Database
connectDB();

// Route Uji Coba
app.get('/', (req, res) => {
    res.send('Backend E-Rapor SDIT Ulil Albab berjalan!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});