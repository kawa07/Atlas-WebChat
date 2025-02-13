import { registerUser } from "./src/js/api/register";
import { login } from "./src/js/api/login";
import { fetchUserProfile } from "./src/js/api/perfil";
import { createChat } from "./src/js/api/createChat"; 
import { fetchUserRooms } from './src/js/api/rooms';
import { getChat } from './src/js/api/getChat';
import { listChats } from './src/js/api/listChats'; 
import { joinChat } from './src/js/api/joinChat';
import { deleteChat } from './src/js/api/deleteChat';
import { sendMessage } from "./src/js/api/sendMessage";
import { deleteMessage } from "./src/js/api/deleteMessage";
import { listMessages, loadMessages } from "./src/js/api/listMessage";
import {showNotification} from "./src/functions/showNotification";
import { updateRoomsList } from "./src/functions/RoomList"; 
import {socket} from './src/lib/websocket';
import Cookies from "js-cookie";

let connectedRooms = [];

document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    await updateRoomsList();
    
    const token = Cookies.get("auth.web-chat");
    if (token && window.location.pathname.includes('index.html')) {
        try {
            const profile = await fetchUserProfile();
            document.getElementById("user-name").innerText = profile.name;
        } catch (error) {
            console.error("Erro ao buscar perfil do usuário:", error);
        }
    }

    if (loginForm) {
        const errorMessage = document.createElement('div');
        errorMessage.style.color = 'red';
        errorMessage.style.display = 'none';
        loginForm.appendChild(errorMessage);

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const { access_token } = await login(email, password);
                Cookies.set("auth.web-chat", access_token);
                window.location.href = 'index.html';
            } catch (error) {
                errorMessage.innerText = error.response && error.response.status === 401
                    ? "Usuário não encontrado. Verifique seu e-mail e senha."
                    : "Ocorreu um erro. Tente novamente.";
                errorMessage.style.display = 'block';
            }
        });
    }

    if (registerForm) {
        const registerErrorMessage = document.createElement('div');
        registerErrorMessage.style.color = 'green';
        registerErrorMessage.style.display = 'none';
        registerForm.appendChild(registerErrorMessage);

        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                const { access_token } = await registerUser(name, email, password);
                Cookies.set("auth.web-chat", access_token);
                registerErrorMessage.innerText = "Cadastro efetuado com sucesso! Faça seu login.";
                registerErrorMessage.style.display = 'block';
            } catch (error) {
                console.error(error);
                registerErrorMessage.innerText = "Ocorreu um erro. Tente novamente.";
                registerErrorMessage.style.display = 'block';
            }
        });
    }

    const chatHeader = document.getElementById("chat-header");
    const chatInput = document.getElementById("chat-input");
    const welcomeMessage = document.getElementById("welcome-message");

    let activeRoomId = null;

   
    
    async function deleteMessageFromUI(messageDiv) {
        messageDiv.remove();
    }
    

    window.loadChat = async function (roomId) {
        try {
            const chat = await getChat(roomId);
            activeRoomId = roomId;
            document.getElementById("chat-room-name").innerText = chat.name;
            welcomeMessage.style.display = "none";
            chatHeader.style.display = "block";
            chatInput.style.display = "flex";

            // Carregar mensagens da sala selecionada
            await loadMessages(roomId);

            let deleteButton = document.getElementById("delete-chat-button");
            if (deleteButton) {
                deleteButton.remove();
            }

            const profile = await fetchUserProfile();

            if (chat.ownerId === profile.id) {
                deleteButton = document.createElement("button");
                deleteButton.id = "delete-chat-button";
                deleteButton.innerHTML = `<img src="src/excluir.png" alt="Excluir Sala">`; 
                deleteButton.classList.add("delete-button"); 
                chatHeader.appendChild(deleteButton);
            
                deleteButton.addEventListener("click", async () => {
                    try {
                        const roomInfo = await getChat(roomId);  // Obter informações antes de excluir
                        await deleteChat(roomId);  // Excluir a sala no servidor
                
                        // Emitir um evento 'delete_room' com as informações da sala
                        socket.emit("delete_room", {
                            roomId: roomInfo.id,
                            roomName: roomInfo.name
                        });
                
                        // Remover o elemento da sala da interface
                        const roomElement = document.querySelector(`[data-room-id="${roomId}"]`);
                        if (roomElement) {
                            roomElement.remove();
                        }
                
            
                        await updateRoomsList();
            
                        setTimeout(() => {
                            location.reload();
                        }, 3000);
                    } catch (error) {
                        console.error("Erro ao excluir a sala:", error);
                        showNotification("Ocorreu um erro ao tentar excluir a sala.", true);
                    }
                });
            }
            
        } catch (error) {
            console.error("Erro ao carregar chat:", error);
        }
    };
    
    async function sendChatMessage() {
        const message = messageInput.value;
    
        if (!message || !activeRoomId) {
            return;
        }
    
        try {
            // Envie a mensagem para o servidor
            const newMessage = await sendMessage(activeRoomId, message);
            messageInput.value = ''; // Limpa o campo de entrada após o envio
    
            // Adicionar a nova mensagem diretamente no chat
            const profile = await fetchUserProfile();
            const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', 'user-message');
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-author"></span>
                    <p class="message-text">${message}</p>
                    <span class="message-time">${messageTime}</span>
                    <img src="src/excluir.png" alt="Excluir Mensagem" class="delete-icon" data-message-id="${newMessage.id}" />
                </div>
            `;
    
            // Adiciona o evento de exclusão ao ícone
            const deleteIcon = messageDiv.querySelector('.delete-icon');
            deleteIcon.addEventListener('click', async () => {
                try {
                    await deleteMessage(activeRoomId, newMessage.id);
                    deleteMessageFromUI(messageDiv);
                } catch (error) {
                    console.error("Erro ao excluir mensagem:", error);
                }
            });
    
            // Adicione a nova mensagem na janela do chat e role para a última mensagem
            const chatWindow = document.querySelector('.chat-window');
            chatWindow.appendChild(messageDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
    
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    }
    

    const contactsContainer = document.querySelector('.contacts-container');

    try {
        const rooms = await fetchUserRooms();

        contactsContainer.innerHTML = '';

        rooms.forEach((room) => {
            const contactDiv = document.createElement('div');
            contactDiv.classList.add('contact');
            contactDiv.setAttribute('data-room-id', room.id);
            contactDiv.addEventListener("click", () => loadChat(room.id));

            contactDiv.innerHTML = `
                <img src="src/images.jfif" alt="Sala ${room.name}" class="contact-pic">
                <div class="contact-info">
                    <h4>${room.name}</h4>
                </div>
            `;

            contactsContainer.appendChild(contactDiv);
        });

    } catch (error) {
        console.error("Erro ao carregar contatos:", error);
    }

   const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", () => {
        Cookies.remove('auth.web-chat');
        window.location.href = 'login.html';
    });

    const createRoomButton = document.getElementById("create-room-button");
    const createRoomPopup = document.getElementById("create-room-popup");
    const roomNameInput = document.getElementById("room-name-input");
    const createRoomSubmit = document.getElementById("create-room-submit");
    const closePopupButton = document.getElementById("close-popup");

    createRoomButton.addEventListener("click", () => {
        createRoomPopup.style.display = "block";
    });

    closePopupButton.addEventListener("click", () => {
        createRoomPopup.style.display = "none";
    });

    createRoomSubmit.addEventListener("click", async () => {
        const roomName = roomNameInput.value;

        try {
            await createChat(roomName);
            createRoomPopup.style.display = "none";
            roomNameInput.value = '';
            location.reload(); // Recarrega a página para mostrar a nova sala
        } catch (error) {
            console.error("Erro ao criar sala:", error);
        }
    });

    const roomsList = document.getElementById('rooms-list');
    
    try {
        const userRooms = await fetchUserRooms();
        const userRoomIds = userRooms.map(room => room.id);

        const availableRooms = await listChats(); 
        const filteredRooms = availableRooms.filter(room => !userRoomIds.includes(room.id));

        roomsList.innerHTML = '';

        filteredRooms.forEach((room) => {
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');
            roomDiv.innerHTML = `
                <span>${room.name}</span>
                <button class="btn btn-primary join-button" data-room-id="${room.id}">Entrar</button>
            `;
            roomsList.appendChild(roomDiv);
        });

        const joinButtons = document.querySelectorAll('.join-button');
        joinButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const roomId = e.target.dataset.roomId;
                try {
                    await joinChat(roomId);

                    socket.emit("join_room", roomId); 

                    location.reload(); // Recarrega a página para atualizar as salas

                } catch (error) {
                    console.error("Erro ao entrar na sala:", error);
                    
                }
            });
        });

    } catch (error) {
        console.error("Erro ao listar salas:", error);
    }

    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');

    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendChatMessage();
        }
    });

    sendButton.addEventListener("click", () => {
        sendChatMessage();
    });

   
});

// WEBSOCKET X-X-X-X-X-X

socket.on('connect', async () => {
    socket.on('new_message', async (data) => {
        const profile = await fetchUserProfile(); 
        if (data.message.owner_id !== profile.id) { 
            await loadMessages(data.message.room_id);
        }
    });


    socket.on('user_joined', async (data) => {
        const roomInfo = await getChat(data.roomId);
        console.log(`${data.user.name} entrou na sala ${roomInfo.name}`);
        showNotification(`${data.user.name} entrou na sala ${roomInfo.name}`);
    });

    socket.on('new_room', async (data) => {
        await updateRoomsList();
        console.log(`Nova sala "${data.room.name}" foi criada.`);
    });

    socket.on('delete_room', async (data) => {
        console.log("Dados recebidos:", data);
        const roomId = data.roomId;
        const roomName = data.roomName;  

        console.log(`Uma de suas salas foi excluída pelo proprietário`);
        showNotification(`Uma de suas salas foi excluída pelo proprietário`);

        // Remover a sala da interface
        const roomElement = document.querySelector(`[data-room-id="${roomId}"]`);
        if (roomElement) {
            roomElement.remove();
        }
    
        // Atualizar a lista de salas no cliente
        await updateRoomsList();
    
    });
    
    
    socket.on('delete_message', async (data) => {
        const messageDiv = document.querySelector(`[data-message-id="${data.messageId}"]`);
        async function deleteMessageFromUI(messageDiv) {
            messageDiv.remove();
        }
        if (messageDiv) {
            deleteMessageFromUI(messageDiv);
        }
        console.log("Uma mensagem foi excluída.");
    });

    const userRooms = await fetchUserRooms();
    userRooms.forEach(room => {
        socket.emit('join_room', room.id);
    });
});