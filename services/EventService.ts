import api from "./api";

class EventService {
    async getEventPhoto(eventId: number) {
        const response = await api.get(`/events/photo/${eventId}`, { responseType: 'arraybuffer' });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(response.data)));
        const mimeType = response.headers['content-type'];
        return `data:${mimeType};base64,${base64}`;
    }
}

export default new EventService();