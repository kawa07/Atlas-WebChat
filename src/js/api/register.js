import { api } from "../../lib/axios";

export async function registerUser(name, email, password) {
    const response = await api.post('/users', {
        name,
        email,
        password
    });

    return response.data;
}