import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function deleteChat(roomId) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.delete(`/chats/${roomId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.chat; 
}
