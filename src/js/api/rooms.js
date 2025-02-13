import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function fetchUserRooms() {
    const token = Cookies.get('auth.web-chat');
    const response = await api.get('/users/rooms', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.rooms; 
}
