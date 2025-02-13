import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function fetchUserProfile() {
    const token = Cookies.get('auth.web-chat');
    const response = await api.get('/users/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.user;
}