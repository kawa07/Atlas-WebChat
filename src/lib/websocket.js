import { io } from 'socket.io-client';

const socket = io('https://atlas-chat-api.onrender.com'); // conectar ao servidor Socket.IO

export { socket };