import { BaseComponent } from './BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class PaymentDrawer extends BaseComponent {
  private activeCheckout: { bookingId: number; amount: number } | null = null;
  private paymentMode: 'UPI' | 'CREDIT_CARD' = 'UPI';
  private currentStep: 'FORM' | 'PROCESSING' | 'SUCCESS' | 'FAILED' = 'FORM';
  private transactionId = '';

  constructor(container: HTMLElement) {
    super(container);
    this.registerGlobalEvents();
  }

  private registerGlobalEvents(): void {
    window.addEventListener('open-payment-drawer', (e: any) => {
      this.activeCheckout = e.detail;
      this.paymentMode = 'UPI';
      this.currentStep = 'FORM';
      this.transactionId = '';
      this.openModal();
    });
  }

  private openModal(): void {
    const modal = this.container.querySelector('#payment-drawer') as HTMLElement;
    if (modal) {
      modal.classList.add('active');
      this.renderCurrentState();
    }
  }

  private closeModal(): void {
    const modal = this.container.querySelector('#payment-drawer') as HTMLElement;
    if (modal) {
      modal.classList.remove('active');
      this.activeCheckout = null;
    }
  }

  private renderCurrentState(): void {
    if (!this.activeCheckout) return;

    const drawerBody = this.container.querySelector('#payment-drawer-body') as HTMLElement;
    if (!drawerBody) return;

    const bookingId = this.activeCheckout.bookingId;
    const amount = this.activeCheckout.amount;

    if (this.currentStep === 'FORM') {
      drawerBody.innerHTML = `
        <div class="billing-summary" style="margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 0.25rem;">
            <span class="text-secondary">Booking Number</span>
            <strong>#${bookingId}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
            <span>Grand Total Due</span>
            <strong style="color: var(--accent-secondary); font-size: 1.25rem;">₹${amount.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <!-- Mode Selection Tabs -->
        <div class="payment-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 0.25rem; border-radius: var(--border-radius-sm);">
          <button class="pay-tab ${this.paymentMode === 'UPI' ? 'active' : ''}" id="tab-pay-upi" style="flex: 1; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; background: transparent; color: var(--text-secondary); transition: all var(--transition-fast);">
            ⚡ UPI Payment
          </button>
          <button class="pay-tab ${this.paymentMode === 'CREDIT_CARD' ? 'active' : ''}" id="tab-pay-card" style="flex: 1; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; background: transparent; color: var(--text-secondary); transition: all var(--transition-fast);">
            💳 Credit/Debit Card
          </button>
        </div>

        <!-- Dynamic form content -->
        <div id="payment-method-form">
          ${this.paymentMode === 'UPI' ? this.getUpiFormHtml() : this.getCardFormHtml()}
        </div>

        <button class="btn btn-primary" id="btn-submit-payment" style="width: 100%; margin-top: 1.5rem;">
          Authorize Security Payment (₹${amount.toLocaleString('en-IN')})
        </button>
      `;

      // Re-bind actions inside the newly injected HTML
      this.bindFormEvents();
    } else if (this.currentStep === 'PROCESSING') {
      drawerBody.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div class="quantum-gateway-spinner" style="position: relative; width: 64px; height: 64px; margin: 0 auto 1.5rem auto;">
            <div style="box-sizing: border-box; display: block; position: absolute; width: 64px; height: 64px; border: 4px solid var(--accent-primary); border-radius: 50%; animation: gateway-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--accent-primary) transparent transparent transparent;"></div>
          </div>
          <h4>Verifying Network Ledger...</h4>
          <p class="text-secondary" style="margin-top: 0.5rem; font-size: 0.9rem;">Processing simulated bank authorization. Please do not close this window or refresh the page.</p>
        </div>
      `;
    } else if (this.currentStep === 'SUCCESS') {
      drawerBody.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;" class="animate-fade-in">
          <div class="success-checkmark-wrapper" style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 2px solid var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark-icon"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h3 style="color: var(--success); font-family: var(--font-header);">Receipt Authorized</h3>
          <p class="text-secondary" style="font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">The system has allocated seats and verified your payment.</p>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 1rem; text-align: left; font-size: 0.85rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Transaction ID</span>
              <strong style="font-family: monospace;">${this.transactionId}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Booking Reference</span>
              <strong>#${bookingId}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Settled Amount</span>
              <strong>₹${amount.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button class="btn btn-primary" id="btn-success-close" style="width: 100%;">
            Return to Dashboard
          </button>
        </div>
      `;
      const successClose = this.container.querySelector('#btn-success-close');
      if (successClose) {
        successClose.addEventListener('click', () => this.closeModal());
      }
    } else if (this.currentStep === 'FAILED') {
      drawerBody.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;" class="animate-fade-in">
          <div class="failed-checkmark-wrapper" style="width: 72px; height: 72px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 2px solid var(--error); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          
          <h3 style="color: var(--error); font-family: var(--font-header);">Authorization Denied</h3>
          <p class="text-secondary" style="font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">The gateway simulated a network failure (10% rejection rate). Your booking remains reserved in unpaid state.</p>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" id="btn-failed-retry" style="flex: 2;">
              Try Again
            </button>
            <button class="btn btn-secondary" id="btn-failed-close" style="flex: 1;">
              Dismiss
            </button>
          </div>
        </div>
      `;

      const retryBtn = this.container.querySelector('#btn-failed-retry');
      const closeBtn = this.container.querySelector('#btn-failed-close');

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.currentStep = 'FORM';
          this.renderCurrentState();
        });
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }
    }
  }

  private getUpiFormHtml(): string {
    return `
      <div class="form-group">
        <label for="upi-id">Virtual Payment Address (VPA)</label>
        <input type="text" id="upi-id" class="input-field" placeholder="e.g. quantum@ybl" value="quantum@ybl" required />
      </div>

      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); background: rgba(255,255,255,0.01);">
        <!-- Generated beautiful vector QR Code mock -->
        <svg width="64" height="64" viewBox="0 0 100 100" style="background: white; padding: 4px; border-radius: 4px; flex-shrink: 0;">
          <rect x="0" y="0" width="20" height="20" fill="black"/>
          <rect x="5" y="5" width="10" height="10" fill="white"/>
          <rect x="80" y="0" width="20" height="20" fill="black"/>
          <rect x="85" y="5" width="10" height="10" fill="white"/>
          <rect x="0" y="80" width="20" height="20" fill="black"/>
          <rect x="5" y="85" width="10" height="10" fill="white"/>
          <rect x="30" y="30" width="15" height="15" fill="black"/>
          <rect x="55" y="45" width="20" height="10" fill="black"/>
          <rect x="45" y="70" width="10" height="20" fill="black"/>
          <rect x="75" y="75" width="10" height="10" fill="black"/>
        </svg>
        <div style="font-size: 0.8rem;">
          <strong>Dynamic QR Code</strong>
          <p class="text-secondary">Scan this simulator code using any sandbox UPI client app to instantly authorize from mobile device.</p>
        </div>
      </div>
    `;
  }

  private getCardFormHtml(): string {
    return `
      <div class="form-group">
        <label for="card-num">Cardholder Number</label>
        <input type="text" id="card-num" class="input-field" placeholder="4111 2222 3333 4444" value="4111 2222 3333 4444" required />
      </div>
      
      <div class="grid-2">
        <div class="form-group">
          <label for="card-expiry">Expiry Date</label>
          <input type="text" id="card-expiry" class="input-field" placeholder="MM/YY" value="12/29" required />
        </div>
        <div class="form-group">
          <label for="card-cvv">CVV</label>
          <input type="password" id="card-cvv" class="input-field" placeholder="***" value="123" required />
        </div>
      </div>
    `;
  }

  private bindFormEvents(): void {
    const upiTab = this.container.querySelector('#tab-pay-upi');
    const cardTab = this.container.querySelector('#tab-pay-card');

    if (upiTab) {
      upiTab.addEventListener('click', () => {
        this.paymentMode = 'UPI';
        this.renderCurrentState();
      });
    }

    if (cardTab) {
      cardTab.addEventListener('click', () => {
        this.paymentMode = 'CREDIT_CARD';
        this.renderCurrentState();
      });
    }

    const submitBtn = this.container.querySelector('#btn-submit-payment');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        if (!this.activeCheckout) return;

        try {
          this.currentStep = 'PROCESSING';
          this.renderCurrentState();

          // Map payment mode for API
          const modeMap = {
            UPI: 'UPI' as const,
            CREDIT_CARD: 'CREDIT_CARD' as const,
          };

          // Hit API
          const payment = await client.processPayment(
            this.activeCheckout.bookingId,
            this.activeCheckout.amount,
            modeMap[this.paymentMode]
          );

          if (payment.paymentStatus === 'SUCCESS') {
            this.transactionId = payment.transactionId;
            this.currentStep = 'SUCCESS';
            store.addToast(`Receipt settled! Transaction ID: ${payment.transactionId}`, 'success');
          } else {
            this.currentStep = 'FAILED';
            store.addToast('Payment Authorization Denied by Gateway', 'error');
          }

          // Sync database states
          const bookings = await client.getBookings();
          const payments: Record<number, any[]> = {};
          for (const b of bookings) {
            payments[b.id] = await client.getPaymentsForBooking(b.id);
          }
          store.setState({ bookings, payments });

        } catch (err) {
          this.currentStep = 'FAILED';
        } finally {
          this.renderCurrentState();
        }
      });
    }
  }

  public render(_state: State): void {
    // Renders the wrapper overlay which contains the slide drawer
    this.container.innerHTML = `
      <div class="modal-overlay" id="payment-drawer">
        <div class="glass-card modal-content" style="max-width: 440px;">
          <div class="modal-header">
            <h3>Gateway Checkout</h3>
            <button class="modal-close" id="payment-drawer-close">&times;</button>
          </div>
          
          <div id="payment-drawer-body">
            <!-- Filled dynamically based on state step -->
          </div>
        </div>
      </div>
      
      <style>
        .pay-tab.active {
          background: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          color: var(--text-primary) !important;
          box-shadow: var(--shadow-sm);
        }
        @keyframes gateway-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  protected postRender(): void {
    const closeBtn = this.container.querySelector('#payment-drawer-close');
    const modal = this.container.querySelector('#payment-drawer') as HTMLElement;

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal && this.currentStep !== 'PROCESSING') {
          this.closeModal();
        }
      });
    }
  }
}
