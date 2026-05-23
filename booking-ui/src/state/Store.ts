export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Train {
  id: number;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  availableSeats: number;
  fare: number;
}

export interface Booking {
  id: number;
  userId: number;
  trainId: number;
  trainName: string;
  source: string;
  destination: string;
  seatsBooked: number;
  bookingDate: string;
  totalFare: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentStatus: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentMode: 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING';
  paymentDate: string;
  transactionId: string;
}

export interface State {
  currentUser: User | null;
  users: User[];
  trains: Train[];
  bookings: Booking[];
  payments: Record<number, Payment[]>;
  searchQuery: { source: string; destination: string };
  health: {
    gateway: 'UP' | 'DOWN';
    userService: 'UP' | 'DOWN';
    trainService: 'UP' | 'DOWN';
    bookingService: 'UP' | 'DOWN';
    paymentService: 'UP' | 'DOWN';
  };
  activeView: 'dashboard' | 'trains' | 'monitor';
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' }>;
  theme: 'light' | 'dark';
  loading: boolean;
}

type Listener = (state: State) => void;

class Store {
  private state: State = {
    currentUser: null,
    users: [],
    trains: [],
    bookings: [],
    payments: {},
    searchQuery: { source: '', destination: '' },
    health: {
      gateway: 'DOWN',
      userService: 'DOWN',
      trainService: 'DOWN',
      bookingService: 'DOWN',
      paymentService: 'DOWN',
    },
    activeView: 'dashboard',
    toasts: [],
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
    loading: false,
  };

  private listeners: Set<Listener> = new Set();

  constructor() {
    this.applyTheme();
  }

  public getState(): State {
    return { ...this.state };
  }

  public setState(updates: Partial<State>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public updateHealth(key: keyof State['health'], status: 'UP' | 'DOWN'): void {
    const health = { ...this.state.health, [key]: status };
    this.setState({ health });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public addToast(message: string, type: 'success' | 'error' = 'success'): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toasts = [...this.state.toasts, { id, message, type }];
    this.setState({ toasts });

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  public removeToast(id: string): void {
    const toasts = this.state.toasts.filter(t => t.id !== id);
    this.setState({ toasts });
  }

  public toggleTheme(): void {
    const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    this.setState({ theme: nextTheme });
    this.applyTheme();
  }

  private applyTheme(): void {
    const theme = this.state.theme;
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export const store = new Store();
