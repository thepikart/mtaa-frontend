import api from "./api";

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
}

export default new EventService();