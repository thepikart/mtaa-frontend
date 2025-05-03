import { create } from 'zustand';
import EventService from '@/services/EventService';

interface EventActions {
    getEventPhoto: (eventId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
    getUserEventsCreated: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    getUserEventsRegistered: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
}

export const useEventStore = create<EventActions>((set) => ({
    getEventPhoto: async (eventId) => {
        try {
            const response = await EventService.getEventPhoto(eventId);
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch event photo.';
            return { success: false, message: errorMessage };
        }
    },
    getUserEventsCreated: async (userId, limit, offset) => {
        try {
            const response = await EventService.getUserEventsCreated(userId, limit, offset);
            return { success: true, data: response.createdEvents };
        } catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch user events.';
            return { success: false, message: errorMessage };
        }
    },
    getUserEventsRegistered: async (userId, limit, offset) => {
        try {
            const response = await EventService.getUserEventsRegistered(userId, limit, offset);
            return { success: true, data: response.registeredEvents };
        } catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch user events.';
            return { success: false, message: errorMessage };
        }
    },
}));