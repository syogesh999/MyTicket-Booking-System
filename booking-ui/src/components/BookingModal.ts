import { BaseComponent } from './BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class BookingModal extends BaseComponent {
  private activeTrain: { id: number; name: string; fare: number } | null = null;
  private seatCount = 1;

  constructor(container: HTMLElement) {
    super(container);
    this.registerGlobalEvents();
  }

  private registerGlobalEvents(): void {
    window.addEventListener('open-booking-modal', (e: any) => {
      this.activeTrain = e.detail;
      this.seatCount = 1;
      this.openModal();
    });
  }

  private openModal(): void {
    const modal = this.container.querySelector('#booking-modal') as HTMLElement;
    if (modal) {
      modal.classList.add('active');
      this.updateDetails();
    }
  }

  private closeModal(): void {
    const modal = this.container.querySelector('#booking-modal') as HTMLElement;
    if (modal) {
      modal.classList.remove('active');
      this.activeTrain = null;
    }
  }

  private updateDetails(): void {
    if (!this.activeTrain) return;

    const trainNameEl = this.container.querySelector('#modal-train-name');
    const fareEl = this.container.querySelector('#modal-fare-calc');
    const totalEl = this.container.querySelector('#modal-total-fare');

    if (trainNameEl) trainNameEl.textContent = this.activeTrain.name;
    if (fareEl) {
      fareEl.textContent = `${this.seatCount} seats x ₹${this.activeTrain.fare}`;
    }
    if (totalEl) {
      totalEl.textContent = `₹${(this.seatCount * this.activeTrain.fare).toLocaleString('en-IN')}`;
    }
  }

  public render(state: State): void {
    const user = state.currentUser;

    this.container.innerHTML = `
      <div class="modal-overlay" id="booking-modal">
        <div class="glass-card modal-content" style="max-width: 460px;">
          <div class="modal-header">
            <h3>Confirm Seat Reservation</h3>
            <button class="modal-close" id="booking-modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="booking-train-summary" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
              <span class="text-secondary" style="font-size: 0.75rem; text-transform: uppercase;">Selected Route</span>
              <h4 id="modal-train-name" style="margin-top: 0.25rem; font-size: 1.15rem;">Rajdhani Express</h4>
            </div>

            <div class="form-group">
              <label for="booking-seats">Number of Passengers</label>
              <input type="number" id="booking-seats" class="input-field" min="1" max="10" value="${this.seatCount}" required />
            </div>

            <div class="passenger-details-preview" style="margin: 1.25rem 0; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
                <span class="text-secondary">Passenger Name</span>
                <strong>${user ? user.name : 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span class="text-secondary">Email</span>
                <strong>${user ? user.email : 'N/A'}</strong>
              </div>
            </div>

            <!-- Real-time Fare Card -->
            <div class="fare-billing-card" style="display: flex; justify-content: space-between; align-items: center; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--border-radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span class="text-secondary" style="font-size: 0.8rem;" id="modal-fare-calc">1 seat x ₹0</span>
                <h5 style="margin: 0; font-size: 0.9rem;">Total Ticket Price</h5>
              </div>
              <span class="amount" id="modal-total-fare" style="font-size: 1.6rem; font-weight: 700; color: var(--accent-primary);">₹0</span>
            </div>

            <button class="btn btn-primary" id="btn-booking-confirm" style="width: 100%;">
              Create Booking Reservation
            </button>
          </div>
        </div>
      </div>
    `;
  }

  protected postRender(): void {
    const closeBtn = this.container.querySelector('#booking-modal-close');
    const modal = this.container.querySelector('#booking-modal') as HTMLElement;
    const seatsInput = this.container.querySelector('#booking-seats') as HTMLInputElement;
    const confirmBtn = this.container.querySelector('#btn-booking-confirm');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    if (seatsInput) {
      seatsInput.addEventListener('input', () => {
        let val = Number(seatsInput.value);
        if (val < 1) val = 1;
        if (val > 10) val = 10;
        this.seatCount = val;
        this.updateDetails();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const user = store.getState().currentUser;
        if (!user || !this.activeTrain) return;

        try {
          confirmBtn.setAttribute('disabled', 'true');
          confirmBtn.textContent = 'Allocating Seats...';

          // Call API
          const booking = await client.createBooking(user.id, this.activeTrain.id, this.seatCount);
          store.addToast(`Seats Allocated! Booking #${booking.id} created successfully.`, 'success');
          
          this.closeModal();

          // Sync database states
          const bookings = await client.getBookings();
          const trains = await client.getTrains();
          const payments: Record<number, any[]> = {};
          for (const b of bookings) {
            payments[b.id] = await client.getPaymentsForBooking(b.id);
          }
          store.setState({ bookings, trains, payments });

          // Auto-trigger Payment Drawer for checkout
          setTimeout(() => {
            const event = new CustomEvent('open-payment-drawer', {
              detail: { bookingId: booking.id, amount: booking.totalFare },
            });
            window.dispatchEvent(event);
          }, 400);

        } catch (err) {
          // Toast handles errors
        } finally {
          confirmBtn.removeAttribute('disabled');
          confirmBtn.textContent = 'Create Booking Reservation';
        }
      });
    }
  }
}
