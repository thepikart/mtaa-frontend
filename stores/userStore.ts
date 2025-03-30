import { create } from 'zustand';
import { User, CreateAccountProps } from '../types/models';
import * as SecureStore from 'expo-secure-store';
import UserService from '@/services/UserService';

interface UserState {
    user: User | null;
    token: string | null;
}

interface UserActions {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    createAccount: (data: CreateAccountProps) => Promise<{ success: boolean; message?: string }>;
    loadUserFromToken: () => Promise<{ success: boolean; message?: string }>;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
    user: null,
    token: null,
    login: async (email, password) => {
        try {
            const { user, token } = await UserService.login(email, password);
            await SecureStore.setItemAsync('token', token);
            set({ user, token });
            return { success: true };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Login failed.';
            return { success: false, message: errorMessage };
        }
    },
    logout: async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            set({ user: null, token: null }); 
        }
        catch (error) {
            console.error('Logout failed.', error);
        }
    },
    createAccount: async (data) => {
        try {
            console.log(data);
            const { user, token } = await UserService.createAccount(data);
            await SecureStore.setItemAsync('token', token);
            set({ user, token });
            return { success: true };
        }
        catch (error) {
            console.error('Account creation failed.', error);
            const errorMessage = (error as any)?.response?.data?.message || 'Account creation failed.';
            return { success: false, message: errorMessage };
        }
    },
    loadUserFromToken: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const user = await UserService.getMe();
                set({ user, token });
                return { success: true };
            }
            else {
                set({ user: null, token: null });
                return { success: false, message: 'No token found.' };
            }
        }
        catch (error) {
            await SecureStore.deleteItemAsync('token');
            set({ user: null, token: null });
            return { success: false, message: 'Failed to load user from token.' };
        }
    }
}));