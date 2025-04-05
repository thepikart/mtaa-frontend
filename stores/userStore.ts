import { create } from 'zustand';
import { User, CreateAccountProps, BankAccountProps } from '../types/models';
import * as SecureStore from 'expo-secure-store';
import UserService from '@/services/UserService';

interface UserState {
    user: User | null;
    token: string | null;
    bankAccount: boolean;
}

interface UserActions {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean; message?: string }>;
    createAccount: (data: CreateAccountProps) => Promise<{ success: boolean; message?: string }>;
    loadUserFromToken: () => Promise<{ success: boolean; message?: string }>;
    editUser: (data: FormData) => Promise<{ success: boolean; message?: string }>;
    getBankAccount: () => Promise<{ success: boolean; message?: string; data?: BankAccountProps }>;
    setBankAccount: (data: BankAccountProps) => Promise<{ success: boolean; message?: string }>;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
    user: null,
    token: null,
    bankAccount: false,
    login: async (email, password) => {
        try {
            const { user, token, bankAccount } = await UserService.login(email, password);
            await SecureStore.setItemAsync('token', token);
            set({ user, token, bankAccount });
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
            return { success: true };
        }
        catch (error) {
            return { success: false, message: 'Logout failed.' };
        }
    },
    createAccount: async (data) => {
        try {
            const { user, token } = await UserService.createAccount(data);
            await SecureStore.setItemAsync('token', token);
            set({ user, token, bankAccount: false });
            return { success: true };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Account creation failed.';
            return { success: false, message: errorMessage };
        }
    },
    loadUserFromToken: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const {user, bankAccount} = await UserService.getMe();
                set({ user, token, bankAccount });
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
    },
    editUser: async (data) => {
        try {
            const user = await UserService.editUser(data);
            set((state) => ({ user: { ...state.user, ...user } }));
            return { success: true };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'User update failed.';
            return { success: false, message: errorMessage };
        }
    },
    getBankAccount: async () => {
        try {
            const result = await UserService.getBankAccount();
            set({ bankAccount: true });
            return { success: true, data: result.bankAccount };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to load bank account details.';
            return { success: false, message: errorMessage };
        }
    },
    setBankAccount: async (data) => {
        try {
            await UserService.setBankAccount(data);
            set({ bankAccount: true });
            return { success: true };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to update bank account.';
            return { success: false, message: errorMessage };
        }
    },
}));