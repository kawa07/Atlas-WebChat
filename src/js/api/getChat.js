import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function getChat(roomId) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.get(`/chats/${roomId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.room; 
}
