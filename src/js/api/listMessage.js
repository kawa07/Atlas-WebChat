import Cookies from 'js-cookie';
import { deleteMessage } from './deleteMessage';
import { deleteMessageFromUI } from '../../functions/deleteMessageFromUI';
import { fetchUserProfile } from './perfil';
import { api } from "../../lib/axios";

export async function listMessages(roomId) {
    const token = Cookies.get('auth.web-chat');
    const response = await api.get(`/chats/${roomId}/messages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data.messages; 
}

export async function loadMessages(roomId) {
    try {
        const messages = await listMessages(roomId);
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.innerHTML = '';

        const profile = await fetchUserProfile();
        const userName = profile.name;

        messages.forEach((message) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message');
            messageDiv.setAttribute('data-message-id', message.id); // Define o data-message-id
            const isUserMessage = message.author_name === userName;
            messageDiv.classList.add(isUserMessage ? 'user-message' : 'received-message');
        
            const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-author">${isUserMessage ? '' : message.author_name}</span>
                    <p class="message-text">${message.content}</p>
                    <span class="message-time">${messageTime}</span>
                    ${isUserMessage ? `<img src="src/excluir.png" alt="Excluir Mensagem" class="delete-icon" data-message-id="${message.id}" />` : ''}
                </div>
            `;
            if (isUserMessage) {
                const deleteIcon = messageDiv.querySelector('.delete-icon');
                deleteIcon.addEventListener('click', async () => {
                    try {
                        await deleteMessage(roomId, message.id);
                        deleteMessageFromUI(messageDiv);
                    } catch (error) {
                        console.error("Erro ao excluir mensagem:", error);
                    }
                });
            }

            chatWindow.appendChild(messageDiv);
        });

        chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
    }
}