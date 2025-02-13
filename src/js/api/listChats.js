import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function listChats(name) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.get('/chats', {
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    return response.data.rooms; 
}
