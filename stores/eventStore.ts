import { create } from 'zustand';
import EventService from '@/services/EventService';

interface EventActions {
    getEventPhoto: (eventId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
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
}));