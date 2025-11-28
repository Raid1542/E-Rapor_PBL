require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true 
}));

app.use(express.json());

// Gunakan route auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Gunakan route admin
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Route uji coba
app.get('/', (req, res) => {
    res.send('Backend E-Rapor SDIT Ulil Albab berjalan!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di port ${PORT}`);
});