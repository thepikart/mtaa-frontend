import { create } from 'zustand';
import { User, CreateAccountProps, BankAccountProps, Notifications } from '../types/models';
import * as SecureStore from 'expo-secure-store';
import UserService from '@/services/UserService';

interface UserState {
    user: User | null;
    token: string | null;
    bankAccount: boolean;
    notifications: Notifications;
}

interface UserActions {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean; message?: string }>;
    createAccount: (data: CreateAccountProps) => Promise<{ success: boolean; message?: string }>;
    loadUserFromToken: () => Promise<{ success: boolean; message?: string }>;
    editUser: (data: FormData) => Promise<{ success: boolean; message?: string }>;
    getBankAccount: () => Promise<{ success: boolean; message?: string; data?: BankAccountProps }>;
    setBankAccount: (data: BankAccountProps) => Promise<{ success: boolean; message?: string }>;
    updateNotifications: (data: Notifications) => Promise<{ success: boolean; message?: string }>;
    getPhoto: (userId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
    user: null,
    token: null,
    bankAccount: false,
    notifications: {
        my_attendees: false,
        my_comments: false,
        my_time: false,
        reg_attendees: false,
        reg_comments: false,
        reg_time: false
    },
    login: async (email, password) => {
        try {
            const { user, token, bankAccount, notifications } = await UserService.login(email, password);
            await SecureStore.setItemAsync('token', token);
            set({ user, token, bankAccount, notifications });
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
                const {user, bankAccount, notifications} = await UserService.getMe();
                set({ user, token, bankAccount, notifications });
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
    updateNotifications: async (data) => {
        try {
            await UserService.updateNotifications(data);
            set({ notifications: data });
            return { success: true };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to update notifications.';
            return { success: false, message: errorMessage };
        }
    },
    getPhoto: async (userId) => {
        try {
            const data = await UserService.getUserPhoto(userId);
            return { success: true, data: data };
        }
        catch (error) {
            console.log(error);
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to load user photo.';
            return { success: false, message: errorMessage };
        }
    }
}));