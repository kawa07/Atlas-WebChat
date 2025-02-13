import axios from 'axios'

const API_URL = 'https://atlas-chat-api.onrender.com'

export const api = axios.create({
  baseURL: API_URL
})