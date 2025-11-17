import { api } from './api';

export async function LogOut() {
    const response = await api.post(`/oauth/logout`);
    return response.data;
}
