import './styles/style.css';
import { store } from './state/Store';
import { client } from './api/Client';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TrainFinder } from './pages/TrainFinder';
import { BookingModal } from './components/BookingModal';
import { PaymentDrawer } from './components/PaymentDrawer';
import { SystemMonitor } from './pages/SystemMonitor';

// Mount shell structure in app root
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="aurora-backdrop"></div>
  <div id="navbar-mount"></div>
  <main id="main-mount" style="flex: 1; padding: 2rem 0;"></main>
  <div id="booking-modal-mount"></div>
  <div id="payment-drawer-mount"></div>
  <div id="toast-mount" class="toast-container"></div>
`;

// Initialize persistent global components
new Navbar(document.querySelector('#navbar-mount')!);
new BookingModal(document.querySelector('#booking-modal-mount')!);
new PaymentDrawer(document.querySelector('#payment-drawer-mount')!);

// View controller router
const mainMount = document.querySelector('#main-mount') as HTMLElement;
let activeComponent: any = null;
let currentViewName = '';

store.subscribe((state) => {
  if (state.activeView !== currentViewName) {
    currentViewName = state.activeView;
    if (activeComponent) {
      activeComponent.destroy();
    }

    if (currentViewName === 'dashboard') {
      activeComponent = new Dashboard(mainMount);
    } else if (currentViewName === 'trains') {
      activeComponent = new TrainFinder(mainMount);
    } else if (currentViewName === 'monitor') {
      activeComponent = new SystemMonitor(mainMount);
    }
  }
});

// Toast renderer handler
const toastMount = document.querySelector('#toast-mount') as HTMLElement;
let lastToastsJson = '';

store.subscribe((state) => {
  const currentJson = JSON.stringify(state.toasts);
  if (currentJson === lastToastsJson) return; // avoid unnecessary DOM redraws
  lastToastsJson = currentJson;

  toastMount.innerHTML = state.toasts
    .map(
      (t) => `
      <div class="toast toast-${t.type}" data-id="${t.id}">
        <span style="font-weight: 700; font-size: 1.1rem; flex-shrink: 0;">
          ${t.type === 'success' ? '✓' : '✕'}
        </span>
        <span style="font-size: 0.9rem;">${t.message}</span>
      </div>
    `
    )
    .join('');

  // Register toast close on click
  toastMount.querySelectorAll('.toast').forEach((toastEl) => {
    toastEl.addEventListener('click', () => {
      const id = toastEl.getAttribute('data-id');
      if (id) store.removeToast(id);
    });
  });
});

// Core data bootstrap function
async function bootstrapApp() {
  // First run health check to update connection indicators
  await client.checkHealth();

  // Parallel fetch initial DB states
  try {
    const [users, trains, bookings] = await Promise.all([
      client.getUsers().catch(() => []),
      client.getTrains().catch(() => []),
      client.getBookings().catch(() => []),
    ]);

    // Fetch payment records for each booking loaded
    const payments: Record<number, any[]> = {};
    for (const booking of bookings) {
      try {
        payments[booking.id] = await client.getPaymentsForBooking(booking.id);
      } catch {
        payments[booking.id] = [];
      }
    }

    // Load first user as default active if users exist
    const currentUser = users.length > 0 ? users[0] : null;

    store.setState({
      users,
      trains,
      bookings,
      payments,
      currentUser,
    });

     if (currentUser) {
       store.addToast(`Authenticated as ${currentUser.name}`, 'success');
     } else {
       store.addToast('Welcome to My Ticket Booking App. Register a profile to begin.', 'success');
     }
  } catch (err) {
    store.addToast('Initial server connectivity offline. Running sandbox simulation.', 'error');
  }
}

// Execute bootstrap
bootstrapApp();

// Periodic background check of microservice nodes (every 12 seconds)
setInterval(() => {
  client.checkHealth();
}, 12000);
