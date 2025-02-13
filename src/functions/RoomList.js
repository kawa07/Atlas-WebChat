import { fetchUserRooms } from "../js/api/rooms";
import { listChats } from "../js/api/listChats";
import { joinChat } from "../js/api/joinChat";
import { socket } from "../lib/websocket";

export async function updateRoomsList() {
    try {
        const roomsList = document.getElementById('rooms-list');
        const searchInput = document.getElementById('search-input'); // Pega o campo de pesquisa
        
        if (!roomsList || !searchInput) {
            console.error("Elemento roomsList ou searchInput não encontrado no DOM.");
            return;
        }

        const userRooms = await fetchUserRooms();
        const userRoomIds = userRooms.map(room => room.id);
    
        const availableRooms = await listChats();
        
        // Função para renderizar as salas de acordo com o filtro
        function renderRooms() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredRooms = availableRooms
                .filter(room => !userRoomIds.includes(room.id))  // Exclui as salas já do usuário
                .filter(room => room.name.toLowerCase().includes(searchTerm));  // Filtra pelo nome da sala

            roomsList.innerHTML = ''; // Limpa a lista

            // Renderiza as salas filtradas
            filteredRooms.forEach((room) => {
                const roomDiv = document.createElement('div');
                roomDiv.classList.add('room');
                roomDiv.innerHTML = 
                    `<span>${room.name}</span>
                    <button class="btn btn-primary join-button" data-room-id="${room.id}">Entrar</button>`;
                roomsList.appendChild(roomDiv);
            });

            const joinButtons = document.querySelectorAll('.join-button');
            joinButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    const roomId = e.target.dataset.roomId;
                    try {
                        await joinChat(roomId);
                        socket.emit('join_room', roomId);
                        location.reload(); 
                    } catch (error) {
                        console.error("Erro ao entrar na sala:", error);
                    }
                });
            });
        }

        // Atualiza a lista de salas enquanto o usuário digita
        searchInput.addEventListener('input', renderRooms);

        // Renderiza as salas pela primeira vez
        renderRooms();
    
    } catch (error) {
        console.error("Erro ao listar salas:", error);
    }
}