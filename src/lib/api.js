const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle error response
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { status: response.status, message: errorData.message || 'Terjadi kesalahan' };
    }

    const data = await response.json();
    return { status: response.status, data };
};

// Tambahkan export default
export default api;