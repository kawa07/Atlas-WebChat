import Cookies from 'js-cookie'
import { api } from "../../lib/axios"

export async function login(email, password) {
    const response = await api.post('/sessions', {
      email, password
    })
    const { access_token} = response.data
      return { 
        access_token 
      }
}