/**
 * Nama File: apiFetch.ts
 * Fungsi: Wrapper untuk fetch API yang menangani error autentikasi global.
 *         Menampilkan alert jika sesi berakhir dan mengarahkan ke halaman login.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 08 Januari 2026
 */

export async function apiFetch(url: string, options: RequestInit = {}) {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');

    // Tambahkan header Authorization jika ada token
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // Jalankan fetch
    const res = await fetch(url, { ...options, headers });

    // Jika respons status 401 (Unauthorized)
    if (res.status === 401) {
        try {
            const data = await res.json();
            // Cek apakah pesan dari backend = "Token telah kadaluarsa"
            if (data.message === 'Token telah kadaluarsa') {
                // Tampilkan alert sesi berakhir
                alert('⚠️ Sesi Anda telah berakhir. Silakan login kembali.');
            } else {
                // Error umum (token tidak valid, dll)
                alert('Akses ditolak. Silakan login.');
            }
        } catch (e) {
            // Jika tidak bisa parse JSON, tetap tampilkan alert umum
            alert('Sesi berakhir. Silakan login ulang.');
        }

        // Hapus data login
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        // Redirect ke login
        window.location.href = '/login';

        // Hentikan eksekusi
        throw new Error('Unauthorized');
    }

    return res;
}