import { store } from '../state/Store';
import type { User, Train, Booking, Payment } from '../state/Store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    store.setState({ loading: true });

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch {
          // Response was not JSON
        }
        throw new Error(errorMsg);
      }

      // Handle empty/no-content response
      if (response.status === 204) {
        return {} as T;
      }

      const text = await response.text();
      try {
        return text ? (JSON.parse(text) as T) : ({} as T);
      } catch {
        return text as unknown as T;
      }
    } catch (error: any) {
      const message = error.message || 'Network request failed';
      store.addToast(message, 'error');
      throw error;
    } finally {
      store.setState({ loading: false });
    }
  }

  // ─── Users ───────────────────────────────────────────────────────────────
  public async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  public async createUser(user: Omit<User, 'id'> & { password?: string }): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  public async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ─── Trains ──────────────────────────────────────────────────────────────
  public async getTrains(): Promise<Train[]> {
    return this.request<Train[]>('/trains');
  }

  public async createTrain(train: Omit<Train, 'id'>): Promise<Train> {
    return this.request<Train>('/trains', {
      method: 'POST',
      body: JSON.stringify(train),
    });
  }

  // ─── Bookings ────────────────────────────────────────────────────────────
  public async getBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings');
  }

  public async createBooking(userId: number, trainId: number, seatsBooked: number): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ userId, trainId, seatsBooked }),
    });
  }

  public async cancelBooking(id: number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // ─── Payments ────────────────────────────────────────────────────────────
  public async processPayment(bookingId: number, amount: number, paymentMode: Payment['paymentMode']): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, paymentMode }),
    });
  }

  public async getPaymentsForBooking(bookingId: number): Promise<Payment[]> {
    return this.request<Payment[]>(`/payments/booking/${bookingId}`);
  }

  public async refundPayment(paymentId: number): Promise<Payment> {
    return this.request<Payment>(`/payments/${paymentId}/refund`, {
      method: 'PUT',
    });
  }

  // ─── Health check ────────────────────────────────────────────────────────
  public async checkHealth(): Promise<void> {
    // Ping gateway
    try {
      const res = await fetch(`${BASE_URL}/actuator/health`, { signal: AbortSignal.timeout(3000) });
      store.updateHealth('gateway', res.ok ? 'UP' : 'DOWN');
    } catch {
      store.updateHealth('gateway', 'DOWN');
    }

    // Ping services by hitting their basic endpoints or actuator healths
    const services: Array<{ key: keyof ReturnType<typeof store.getState>['health']; path: string }> = [
      { key: 'userService', path: '/users' },
      { key: 'trainService', path: '/trains' },
      { key: 'bookingService', path: '/bookings' },
      { key: 'paymentService', path: '/payments/booking/0' },
    ];

    for (const service of services) {
      try {
        const res = await fetch(`${BASE_URL}${service.path}`, { signal: AbortSignal.timeout(3000) });
        // Since CORS is open, if we get back ANY response (even 404 or 403 or ok), it means service is listening
        store.updateHealth(service.key, res.status < 500 ? 'UP' : 'DOWN');
      } catch {
        store.updateHealth(service.key, 'DOWN');
      }
    }
  }
}

export const client = new ApiClient();
