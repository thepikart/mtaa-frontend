import api from "./api";
import { CreateAccountProps, BankAccountProps, Notifications } from "@/types/models";

class UserService {
    async login(email: string, password: string) {
        console.log(api.defaults.baseURL);
        const response = await api.post('/login', { email, password });
        return response.data;
    }

    async createAccount(data: CreateAccountProps) {
        const response = await api.post('/create-account', data);
        return response.data;
    }

    async getMe() {
        const response = await api.get('/me');
        return response.data;
    }

    async editUser(data: FormData) {
        try {
            const response = await api.patchForm('/users/edit', data);
            return response.data;
        }
        catch (error) {
            console.log(JSON.stringify(error));
            throw new Error("Error editing user data");
        }
    }

    async getBankAccount() {
        const response = await api.get('/users/bank-account');
        return response.data;
    }

    async setBankAccount(data: BankAccountProps) {
        const response = await api.put('/users/bank-account', data);
        return response.data;
    }

    async updateNotifications(data: Notifications) {
        const response = await api.patch('/users/notifications', data);
        return response.data;
    }

    async getUserPhoto(userId: number) {
        const response = await api.get(`/users/photo/${userId}`, { responseType: 'arraybuffer' });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(response.data)));
        const mimeType = response.headers['content-type'];
        return `data:${mimeType};base64,${base64}`;
    }
}

export default new UserService();