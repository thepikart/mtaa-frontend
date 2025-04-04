import api from "./api";
import { CreateAccountProps } from "@/types/models";

class UserService {
    async login (email: string, password: string) {
        const response = await api.post('/login', { email, password });
        return response.data;
    }

    async createAccount (data: CreateAccountProps) {
        const response = await api.post('/create-account', data);
        return response.data;
    }

    async getMe () {
        const response = await api.get('/me');
        return response.data;
    }

    async editUser (data: FormData) {
        try {
        const response = await api.patchForm('/users/edit', data);
        return response.data;
        }
        catch (error) {
            console.log(JSON.stringify(error));
            throw new Error("Error editing user data");
        }
    }
}

export default new UserService();