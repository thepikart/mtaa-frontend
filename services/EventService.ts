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

    async getRecommendedEvents() {
        const response = await api.get("/events/recommended");
        return response.data;
      }
      
      async getEventsNear() {
        const response = await api.get("/events/near", {
          params: {
            lat: 48.15,
            lon: 17.11,
            radius: 10,
          },
        });
        return response.data;
      }
      
      async getUpcomingEvents() {
        const response = await api.get("/events/upcoming");
        return response.data;
      }

        async searchEvents(query: string) {
        const response = await api.get("/events/search", { params: { q: query } });
        return response.data;
    }

    async getComments(eventId: number, limit = 20, offset = 0) {
        const { data } = await api.get(`/events/${eventId}/comments`, {
          params: { limit, offset },
        });
      
        return Array.isArray(data) ? data : [];
      }
  
      
      async getAttendees(eventId: number) {
        const { data } = await api.get(`/events/${eventId}/attendees`);
        return Array.isArray(data) ? data : data.attendees || [];
      }
    
      async createComment(eventId: number, content: string) {
        const { data } = await api.post(`/events/${eventId}/comments`, { content });
        return data;
      }
    
      async deleteComment(eventId: number, commentId: number) {
        const { data } = await api.delete(
          `/events/${eventId}/comments/${commentId}`
        );
        return data;
      }

      async createEvent(form: FormData) {
          const { data } = await api.post("/events", form, {
          headers: { "Content-Type": "multipart/form-data" },
          });
          return data;
          }
          
        async updateEvent(eventId: number, form: FormData) {
          await api.put(`/events/${eventId}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        
        async deleteEvent(eventId: number) {
          await api.delete(`/events/${eventId}`);
        }

        async geocodeCity(city: string): Promise<{ lat: string; lon: string }> {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`
          );
          const list = (await resp.json()) as Array<{ lat: string; lon: string }>;
          if (!list.length) throw new Error('City not found');
          return { lat: list[0].lat, lon: list[0].lon };
        }
        async getEventsByCategory(category: string, limit: number = 10, offset: number = 0) {
          const response = await api.get(`/events/category/${category}`, {
            params: { limit, offset }
          });
          return response.data;
        }
      
}

export default new EventService();
