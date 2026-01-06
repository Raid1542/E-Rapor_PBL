/**
 * Wrapper fetch sederhana yang:
 * - Kirim cookie (credentials: 'include')
 * - Jika respons 401 → alert + redirect ke login
 */
export const apiFetch = async (
    input: RequestInfo,
    init?: RequestInit
): Promise<Response> => {
    const response = await fetch(input, {
        ...init,
        credentials: 'include', // WAJIB: kirim cookie ke backend
    });

    // Jika backend kirim 401 (sesi expired / token tidak valid)
    if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login ulang.');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    return response;
};