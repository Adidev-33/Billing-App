const API_BASE_URL = '/api';

export const apiRequest = async (url, method = 'GET', body = null) => {
    try {
        const options = { 
            method, 
            headers: { 'Content-Type': 'application/json' } 
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${url}`, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Server Error: ${response.status}`);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true, message: 'Operation successful.' };
        }

        return await response.json();
    } catch (error) {
        console.error(`API Request Failed: ${method} ${url}`, error);
        alert(`Error: ${error.message}`);
        return null;
    }
};