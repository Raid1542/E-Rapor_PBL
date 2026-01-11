/**
 * Nama File: apiFetch.ts
 * Fungsi: Wrapper untuk fetch API yang menangani error autentikasi global.
 *         Menampilkan alert jika sesi berakhir dan mengarahkan ke halaman login.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 08 Januari 2026
 */

export async function apiFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    // Jangan set Content-Type jika body adalah FormData
    const isFormData = options.body instanceof FormData;
    const defaultHeaders: HeadersInit = {};

    if (!isFormData) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const headers = {
        ...defaultHeaders,
        ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        try {
            const data = await res.json();
            if (data.message === 'Token telah kadaluarsa') {
                alert('⚠️ Sesi Anda telah berakhir. Silakan login kembali.');
            } else {
                alert('Akses ditolak. Silakan login.');
            }
        } catch (e) {
            alert('Sesi berakhir. Silakan login ulang.');
        }

        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';

        throw new Error('Unauthorized');
    }

    return res;
}