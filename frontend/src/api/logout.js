import { api } from './api';

export async function LogOut() {
    try {
        const response = await api.post(`/oauth/logout`);
        return response.data;
    } catch (error) {
        console.error('[LogOut] Error:', error);
        throw error;
    }
}
