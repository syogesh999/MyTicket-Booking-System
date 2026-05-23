import { BaseComponent } from './BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class Dashboard extends BaseComponent {
  public render(state: State): void {
    const user = state.currentUser;

    if (!user) {
      this.renderEmptyState();
      return;
    }

    // Filter bookings for the current user
    const userBookings = state.bookings.filter((b) => b.userId === user.id);
    
    // Calculate metrics
    const totalBookings = userBookings.length;
    const activeBookings = userBookings.filter((b) => b.status === 'CONFIRMED');
    const activeCount = activeBookings.length;
    
    // Calculate total spent (only on confirmed & paid bookings)
    let totalSpent = 0;
    userBookings.forEach((b) => {
      if (b.status === 'CONFIRMED') {
        const payments = state.payments[b.id] || [];
        const isPaid = payments.some((p) => p.paymentStatus === 'SUCCESS');
        if (isPaid) {
          totalSpent += b.totalFare;
        }
      }
    });

    this.container.innerHTML = `
      <div class="container animate-fade-in">
        <!-- Hero passenger header -->
        <div class="hero-passenger glass-card">
          <div class="passenger-profile">
            <div class="avatar">
              <span>${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </div>
            <div>
              <h2>Welcome back, ${user.name}</h2>
              <p class="text-secondary">${user.email} &bull; ${user.phone}</p>
            </div>
          </div>
          <button class="btn btn-primary" id="btn-dashboard-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Book New Ticket
          </button>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="glass-card metric-card">
            <span class="title">Total Bookings</span>
            <span class="value">${totalBookings}</span>
            <span class="subtitle">All-time reservations</span>
          </div>
          <div class="glass-card metric-card">
            <span class="title">Active Tickets</span>
            <span class="value">${activeCount}</span>
            <span class="subtitle">Upcoming journeys</span>
          </div>
          <div class="glass-card metric-card">
            <span class="title">Total Fare Settled</span>
            <span class="value">₹${totalSpent.toLocaleString('en-IN')}</span>
            <span class="subtitle">Paid transactions</span>
          </div>
        </div>

        <!-- Bookings Section -->
        <div class="glass-card">
          <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 class="section-title" style="margin-bottom: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Your Quantum Bookings
            </h3>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-bookings" title="Sync Database">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              Sync
            </button>
          </div>

          ${
            userBookings.length === 0
              ? `
            <div class="empty-bookings-state">
              <span class="empty-icon">🎟️</span>
              <h4>No Bookings Found</h4>
              <p class="text-secondary">You haven't booked any train tickets yet. Use the Train Finder to start your journey.</p>
            </div>
            `
              : `
            <div class="table-container">
              <table class="table-glass">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Train Details</th>
                    <th>Route</th>
                    <th>Seats</th>
                    <th>Fare</th>
                    <th>Booking Status</th>
                    <th>Payment Status</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${userBookings
                    .map((booking) => {
                      const payments = state.payments[booking.id] || [];
                      const successPayment = payments.find((p) => p.paymentStatus === 'SUCCESS');
                      const refundedPayment = payments.find((p) => p.paymentStatus === 'REFUNDED');
                      const failedPayment = payments.find((p) => p.paymentStatus === 'FAILED');

                      let payStatusBadge = '';
                      let actionButtons = '';

                      if (booking.status === 'CANCELLED') {
                        if (refundedPayment) {
                          payStatusBadge = '<span class="status-badge status-cancelled">Refunded</span>';
                        } else if (successPayment) {
                          payStatusBadge = '<span class="status-badge status-pending">Processing Refund</span>';
                        } else {
                          payStatusBadge = '<span class="status-badge status-cancelled">No Payment</span>';
                        }
                      } else {
                        // CONFIRMED Booking
                        if (successPayment) {
                          payStatusBadge = `<span class="status-badge status-confirmed" title="Txn: ${successPayment.transactionId}">Paid</span>`;
                          actionButtons = `
                            <button class="btn btn-danger btn-sm btn-cancel-booking" data-id="${booking.id}">
                              Cancel
                            </button>
                          `;
                        } else {
                          payStatusBadge = `<span class="status-badge status-pending">${failedPayment ? 'Failed' : 'Unpaid'}</span>`;
                          actionButtons = `
                            <button class="btn btn-primary btn-sm btn-pay-booking" data-id="${booking.id}" data-amount="${booking.totalFare}">
                              Pay ₹${booking.totalFare}
                            </button>
                            <button class="btn btn-secondary btn-sm btn-cancel-booking" data-id="${booking.id}">
                              Cancel
                            </button>
                          `;
                        }
                      }

                      const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return `
                        <tr>
                          <td><strong>#${booking.id}</strong></td>
                          <td>
                            <div class="train-cell-info">
                              <span class="train-cell-name">${booking.trainName}</span>
                              <span class="train-cell-date">${bookingDate}</span>
                            </div>
                          </td>
                          <td>
                            <div class="route-cell">
                              <span>${booking.source}</span>
                              <span class="route-arrow">&rarr;</span>
                              <span>${booking.destination}</span>
                            </div>
                          </td>
                          <td>${booking.seatsBooked} seats</td>
                          <td><strong>₹${booking.totalFare}</strong></td>
                          <td>
                            <span class="status-badge ${
                              booking.status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled'
                            }">
                              ${booking.status.toLowerCase()}
                            </span>
                          </td>
                          <td>${payStatusBadge}</td>
                          <td style="text-align: right;">
                            <div class="table-actions" style="display: inline-flex; gap: 0.5rem; justify-content: flex-end;">
                              ${actionButtons}
                            </div>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>
          `
          }
        </div>
      </div>
    `;
  }

  private renderEmptyState(): void {
    this.container.innerHTML = `
      <div class="container animate-fade-in">
        <div class="welcome-hero-card glass-card">
          <div class="hero-backdrop-glow"></div>
          <span class="welcome-badge">🚀 Welcome to Quantum Railways</span>
          <h1>Seamless Train Reservations</h1>
          <p>Experience the next generation of ticketing using microservice-driven seat allocation, instant payments, and automated refund pipelines.</p>
          
          <div class="empty-state-guide">
            <div class="guide-step">
              <span class="number">1</span>
              <div>
                <h5>Select Passenger Profile</h5>
                <p>Choose an active passenger profile from the header dropdown, or register a new one using the "+" button.</p>
              </div>
            </div>
            <div class="guide-step">
              <span class="number">2</span>
              <div>
                <h5>Search & Book Trains</h5>
                <p>Lookup express routes with dynamic pricing, choose your seats, and generate bookings instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected postRender(): void {
    const searchBtn = this.container.querySelector('#btn-dashboard-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        store.setState({ activeView: 'trains' });
      });
    }

    const refreshBtn = this.container.querySelector('#btn-refresh-bookings');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        try {
          const bookings = await client.getBookings();
          // Load payments for each booking
          const payments: Record<number, any[]> = {};
          for (const b of bookings) {
            payments[b.id] = await client.getPaymentsForBooking(b.id);
          }
          store.setState({ bookings, payments });
          store.addToast('Bookings synchronized', 'success');
        } catch {
          // Toast handled by API client
        }
      });
    }

    // Cancel Booking Click
    const cancelBtns = this.container.querySelectorAll('.btn-cancel-booking');
    cancelBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-id'));
        if (!confirm('Are you sure you want to cancel this booking and restore seats?')) return;
        
        try {
          // Cancel booking
          await client.cancelBooking(id);
          store.addToast(`Booking #${id} cancelled. Seats returned.`, 'success');
          
          // Check if there was a payment, if so refund it!
          const payments = store.getState().payments[id] || [];
          const successPayment = payments.find(p => p.paymentStatus === 'SUCCESS');
          if (successPayment) {
            await client.refundPayment(successPayment.id);
            store.addToast(`Refund processed for Transaction ID ${successPayment.transactionId}`, 'success');
          }

          // Sync database states
          const bookings = await client.getBookings();
          const trains = await client.getTrains();
          const allPayments: Record<number, any[]> = {};
          for (const b of bookings) {
            allPayments[b.id] = await client.getPaymentsForBooking(b.id);
          }
          store.setState({ bookings, trains, payments: allPayments });
        } catch (err) {
          // Error toast handled by API client
        }
      });
    });

    // Pay Booking Click (Triggers the custom billing action or opens payment drawer)
    const payBtns = this.container.querySelectorAll('.btn-pay-booking');
    payBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const bookingId = Number(btn.getAttribute('data-id'));
        const amount = Number(btn.getAttribute('data-amount'));
        
        // Dispatch custom event to trigger PaymentDrawer
        const event = new CustomEvent('open-payment-drawer', {
          detail: { bookingId, amount },
        });
        window.dispatchEvent(event);
      });
    });
  }
}
