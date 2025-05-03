import { create } from 'zustand';
import EventService from '@/services/EventService';

interface EventActions {
    getEventPhoto: (eventId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
    getUserEventsCreated: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    getUserEventsRegistered: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    getMyEvents: (startDate: Date, endDate: Date) => Promise<{ success: boolean; message?: string; data?: any[] }>,
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
            const events = response.createdEvents;
    
            const eventsWithPhotos = await Promise.all(events.map(async (event: any) => {
                try {
                    const photoResponse = await EventService.getEventPhoto(event.id);
                    return {
                        ...event,
                        photo: photoResponse,
                    };
                }
                catch (error) {
                    return {
                        ...event,
                        photo: undefined,
                    };
                }
            }));
            return { success: true, data:eventsWithPhotos };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch user events.';
            return { success: false, message: errorMessage };
        }
    },
    getUserEventsRegistered: async (userId, limit, offset) => {
        try {
            const response = await EventService.getUserEventsRegistered(userId, limit, offset);
            const events = response.registeredEvents;
    
            const eventsWithPhotos = await Promise.all(events.map(async (event: any) => {
                try {
                    const photoResponse = await EventService.getEventPhoto(event.id);
                    return {
                        ...event,
                        photo: photoResponse,
                    };
                }
                catch (error) {
                    return {
                        ...event,
                        photo: undefined,
                    };
                }
            }));
            return { success: true, data:eventsWithPhotos };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch user events.';
            return { success: false, message: errorMessage };
        }
    },
    getMyEvents: async (startDate, endDate) => {
        try {
            const response = await EventService.getMyEvents(startDate, endDate);
            const events = response.events;
    
            const eventsWithPhotos = await Promise.all(events.map(async (event: any) => {
                try {
                    const photoResponse = await EventService.getEventPhoto(event.id);
                    return {
                        ...event,
                        photo: photoResponse,
                    };
                }
                catch (error) {
                    return {
                        ...event,
                        photo: undefined,
                    };
                }
            }));
            return { success: true, data:eventsWithPhotos };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch my events.';
            return { success: false, message: errorMessage };
        }
    },
}));