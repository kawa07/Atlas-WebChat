import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function joinChat(roomId) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.post(`/chats/${roomId}/join`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data; 
}
