import api from "./api";
import { Payment } from "@/types/models";

class EventService {
    async getEventPhoto(eventId: number) {
        const response = await api.get(`/events/photo/${eventId}`, { responseType: 'arraybuffer' });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(response.data)));
        const mimeType = response.headers['content-type'];
        return `data:${mimeType};base64,${base64}`;
    }

    async getUserEventsCreated(userId: number, limit: number, offset: number) {
        const response = await api.get(`/users/${userId}/created`, { params: { limit, offset } });
        return response.data;
    }

    async getUserEventsRegistered(userId: number, limit: number, offset: number) {
        const response = await api.get(`/users/${userId}/registered`, { params: { limit, offset } });
        return response.data;
    }

    async getMyEvents( startDate: Date , endDate: Date) {
        const response = await api.get('/users/my-events', { params: { startDate, endDate } });
        return response.data;
    }

    async getAllMyEvents() {
        const response = await api.get('/users/all-my-events');
        return response.data;
    }

    async registerForEvent(eventId: number, data? : Payment) {
        const response = await api.post(`/events/${eventId}/register`, data);
        return response.data;
    }

    async cancelEventRegistration(eventId: number) {
        const response = await api.delete(`/events/${eventId}/cancel`);
        return response.data;
    }

    async getEventById(eventId: number) {
        const response = await api.get(`/events/${eventId}`);
        return response.data;
    }
}

export default new EventService();