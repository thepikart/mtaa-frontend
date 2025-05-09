import { create } from 'zustand';
import { User, CreateAccountProps, BankAccountProps, NotificationsProps } from '../types/models';
import * as SecureStore from 'expo-secure-store';
import UserService from '@/services/UserService';
import EventService from '@/services/EventService';
import messaging from '@react-native-firebase/messaging';

interface UserState {
    user: User | null;
    token: string | null;
    bankAccount: boolean;
    notifications: NotificationsProps;
    registered: Number[];
    created: Number[],
}

interface UserActions {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean; message?: string }>;
    createAccount: (data: CreateAccountProps) => Promise<{ success: boolean; message?: string }>;
    loadUserFromToken: () => Promise<{ success: boolean; message?: string }>;
    editUser: (data: FormData) => Promise<{ success: boolean; message?: string }>;
    getBankAccount: () => Promise<{ success: boolean; message?: string; data?: BankAccountProps }>;
    setBankAccount: (data: BankAccountProps) => Promise<{ success: boolean; message?: string }>;
    updateNotifications: (data: NotificationsProps) => Promise<{ success: boolean; message?: string }>;
    getPhoto: (userId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
    getUserProfile: (userId: number) => Promise<{ success: boolean; message?: string; data?: User }>;
    registerForNotifications: () => Promise<{ success: boolean; message?: string }>;
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
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
    registered: [],
    created: [],
    login: async (email, password) => {
        try {
            const { user, token, bankAccount, notifications, refreshToken } = await UserService.login(email, password);
            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            set({ user, token, bankAccount, notifications });
            const userId = get().user?.id;
            if (userId) {
                try {
                    const userPhoto = await UserService.getUserPhoto(userId);
                    set({ user: { ...user, photo: userPhoto } });
                }
                catch (error) {
                    set({ user: { ...user, photo: undefined } });
                }
            }
            const events = await EventService.getAllMyEvents();
            set({ registered: events.registered, created: events.created });
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
            const { user, token, refreshToken } = await UserService.createAccount(data);
            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            set({ user, token, bankAccount: false });
            const userId = get().user?.id;
            if (userId) {
                try {
                    const userPhoto = await UserService.getUserPhoto(userId);
                    set({ user: { ...user, photo: userPhoto } });
                }
                catch (error) {
                    set({ user: { ...user, photo: undefined } });
                }
            }
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
                const { user, bankAccount, notifications } = await UserService.getMe();
                set({ user, token, bankAccount, notifications });
                try {
                    const userPhoto = await UserService.getUserPhoto(user.id);
                    set({ user: { ...user, photo: userPhoto } });
                }
                catch (error) {
                }
                const events = await EventService.getAllMyEvents();
                set({ registered: events.registered, created: events.created });
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
            const userId = get().user?.id;
            if (userId) {
                try {
                    const userPhoto = await UserService.getUserPhoto(userId);
                    set({ user: { ...user, photo: userPhoto } });
                }
                catch (error) {
                    set({ user: { ...user, photo: undefined } });
                }
            }
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
    },
    getUserProfile: async (userId) => {
        try {
            const response = await UserService.getUserProfile(userId);
            var userProfile = response.user;
            try {
                const userPhoto = await UserService.getUserPhoto(userId);
                userProfile.photo = userPhoto;
            }
            catch (error) {
                userProfile.photo = null;
            }
            return { success: true, data: userProfile };
        }
        catch (error) {
            console.log(error);
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to load user profile.';
            return { success: false, message: errorMessage };
        }
    },
    registerForNotifications: async () => {
        const user = get().user;
        if (!user) {
          return { success: false, message: 'User not found.' };
        }
      
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if (!enabled) {
          console.warn('FCM permission not granted');
          return { success: false, message: 'Permission for push notifications not granted' };
        }
      
        try {
          const token = await messaging().getToken();
          const response = await UserService.registerForNotifications(token);
          return { success: true, message: 'Notifications registered successfully!' };
        }
        catch (error) {
          const errorMessage = (error as any)?.response?.data?.message || 'Failed to register for notifications.';
          return { success: false, message: errorMessage };
        }
      }
}));