import { create } from 'zustand';
import EventService from '@/services/EventService';
import { Event, Payment } from '../types/models';
import { useUserStore } from './userStore';

interface EventActions {
    getEventPhoto: (eventId: number) => Promise<{ success: boolean; message?: string; data?: string }>;
    getUserEventsCreated: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    getUserEventsRegistered: (userId: number, limit: number, offset: number) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    getMyEvents: (startDate: Date, endDate: Date) => Promise<{ success: boolean; message?: string; data?: any[] }>,
    registerForEvent: (eventId: number, data?: Payment) => Promise<{ success: boolean; message?: string, deleted?: boolean }>,
    cancelEventRegistration: (eventId: number) => Promise<{ success: boolean; message?: string }>,
    getEventById: (eventId: number) => Promise<{ success: boolean; message?: string; data?: any }>,
    createEvent: (data: FormData) => Promise<{ success: boolean; message?: string, id?: number }>,
    createComment: (eventId: number, data: string) => Promise<{ success: boolean; message?: string; data?: any }>,
    deleteEvent: (eventId: number) => Promise<{ success: boolean; message?: string }>,
}

interface EventState {
    eventToPay: Event | null;
    setEventToPay: (event: Event | null) => void;
}

export const useEventStore = create<EventState & EventActions>((set) => ({
    eventToPay: null,
    setEventToPay: (event: Event | null) => set({ eventToPay: event }),

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
            return { success: true, data: eventsWithPhotos };
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
            return { success: true, data: eventsWithPhotos };
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
            return { success: true, data: eventsWithPhotos };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch my events.';
            return { success: false, message: errorMessage };
        }
    },
    registerForEvent: async (eventId, data) => {
        try {
            const response = await EventService.registerForEvent(eventId, data);
            return { success: true, message: response.message };
        } catch (error) {
            if ((error as any)?.response?.status === 404) {
                const errorMessage = (error as any)?.response?.data?.message || 'Failed to register for event.';
                return { success: false, message: errorMessage, deleted: true };
            }
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to register for event.';
            return { success: false, message: errorMessage };
        }
    },
    cancelEventRegistration: async (eventId) => {
        try {
            const response = await EventService.cancelEventRegistration(eventId);
            return { success: true, message: response.message };
        } catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to cancel event registration.';
            return { success: false, message: errorMessage };
        }
    },
    getEventById: async (eventId) => {
        try {
            const response = await EventService.getEventById(eventId);
            var eventWithPhoto: Event | undefined;
            try {
                const photoResponse = await EventService.getEventPhoto(eventId);
                eventWithPhoto = {
                    ...response,
                    photo: photoResponse,
                };
            }
            catch (error) {
                eventWithPhoto = {
                    ...response,
                    photo: undefined,
                };
            }
            return { success: true, data: eventWithPhoto };
        } catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to fetch event.';
            return { success: false, message: errorMessage };
        }
    },
    createEvent: async (data) => {
        try {
            const response = await EventService.createEvent(data);
            return { success: true, id: response.id };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.error || 'Failed to create event.';
            return { success: false, message: errorMessage };
        }
    },
    createComment: async (eventId, data) => {
        try {
            const response = await EventService.createComment(eventId, data);
            return { success: true, data: response };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to create comment.';
            return { success: false, message: errorMessage };
        }
    },
    deleteEvent: async (eventId) => {
        try {
            const response = await EventService.deleteEvent(eventId);
            return { success: true, message: response.message };
        }
        catch (error) {
            const errorMessage = (error as any)?.response?.data?.message || 'Failed to delete event.';
            return { success: false, message: errorMessage };
        }
    },
}));