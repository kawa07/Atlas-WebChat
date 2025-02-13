import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function createChat(name) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.post('/chats', {
        name
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.chat; 
}
