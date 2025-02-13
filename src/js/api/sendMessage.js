import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function sendMessage(roomId, content) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.post(`/chats/${roomId}/messages`, {
        content
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.message;
}
