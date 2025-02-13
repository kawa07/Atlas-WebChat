import Cookies from 'js-cookie';
import { api } from "../../lib/axios";

export async function deleteMessage(roomId, messageId) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.delete(`/chats/${roomId}/messages/${messageId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}
