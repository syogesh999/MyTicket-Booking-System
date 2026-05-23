import { BaseComponent } from './BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class Navbar extends BaseComponent {
  public render(state: State): void {
    const isOnline = Object.values(state.health).every((h) => h === 'UP');
    const healthTooltip = `Gateway: ${state.health.gateway}
User Service: ${state.health.userService}
Train Service: ${state.health.trainService}
Booking Service: ${state.health.bookingService}
Payment Service: ${state.health.paymentService}`;

    this.container.innerHTML = `
      <header class="navbar">
        <div class="container">
          <div class="logo">
            <span class="logo-icon">🎫</span>
            <span>IRCTC Quantum</span>
          </div>

          <nav class="nav-links">
            <button class="nav-item ${state.activeView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
              Dashboard
            </button>
            <button class="nav-item ${state.activeView === 'trains' ? 'active' : ''}" data-view="trains">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              Find Trains
            </button>
            <button class="nav-item ${state.activeView === 'monitor' ? 'active' : ''}" data-view="monitor">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              System Monitor
            </button>
          </nav>

          <div class="nav-actions">
            <!-- Health Indicator -->
            <div class="health-indicator" title="${healthTooltip}">
              <span class="pulse-dot ${isOnline ? 'online' : 'offline'}"></span>
              <span>${isOnline ? 'Network Online' : 'Network Issues'}</span>
            </div>

            <!-- User Selector & Add User -->
            <div class="user-action-group">
              <div class="user-selector">
                <select id="navbar-user-select">
                  <option value="">Select Active User...</option>
                  ${state.users
                    .map(
                      (u) =>
                        `<option value="${u.id}" ${state.currentUser?.id === u.id ? 'selected' : ''}>${u.name}</option>`
                    )
                    .join('')}
                </select>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-register-user" title="Register New User">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
              </button>
            </div>

            <!-- Theme Toggle -->
            <button class="theme-toggle" id="navbar-theme-toggle" title="Toggle Theme">
              ${
                state.theme === 'dark'
                  ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
              }
            </button>
          </div>
        </div>
      </header>

      <!-- Inline User Registration Modal (Scoped inside navbar component or triggered by it) -->
      <div class="modal-overlay" id="user-reg-modal">
        <div class="glass-card modal-content">
          <div class="modal-header">
            <h3>Register Quantum User</h3>
            <button class="modal-close" id="user-reg-close">&times;</button>
          </div>
          <form id="user-reg-form">
            <div class="form-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" class="input-field" placeholder="e.g. Richard Hendricks" required />
            </div>
            <div class="form-group">
              <label for="reg-email">Email Address</label>
              <input type="email" id="reg-email" class="input-field" placeholder="e.g. richard@piedpiper.com" required />
            </div>
            <div class="form-group">
              <label for="reg-phone">Phone Number</label>
              <input type="tel" id="reg-phone" class="input-field" placeholder="e.g. 9876543210" required />
            </div>
            <div class="form-group">
              <label for="reg-password">Password</label>
              <input type="password" id="reg-password" class="input-field" placeholder="At least 6 characters" required minlength="6" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              Create User Profile
            </button>
          </form>
        </div>
      </div>
    `;
  }

  protected postRender(): void {
    // Nav links
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view') as State['activeView'];
        if (view) {
          store.setState({ activeView: view });
        }
      });
    });

    // Theme toggle
    const themeBtn = this.container.querySelector('#navbar-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        store.toggleTheme();
      });
    }

    // User select change
    const userSelect = this.container.querySelector('#navbar-user-select') as HTMLSelectElement;
    if (userSelect) {
      userSelect.addEventListener('change', () => {
        const idStr = userSelect.value;
        if (!idStr) {
          store.setState({ currentUser: null });
          store.addToast('User logged out', 'success');
        } else {
          const user = store.getState().users.find((u) => u.id === Number(idStr));
          if (user) {
            store.setState({ currentUser: user });
            store.addToast(`Switched active profile: ${user.name}`, 'success');
          }
        }
      });
    }

    // Registration Modal toggling
    const regBtn = this.container.querySelector('#btn-register-user');
    const modal = this.container.querySelector('#user-reg-modal') as HTMLElement;
    const closeBtn = this.container.querySelector('#user-reg-close');
    const form = this.container.querySelector('#user-reg-form') as HTMLFormElement;

    if (regBtn && modal && closeBtn) {
      regBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });

      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }

    // Form submission
    if (form && modal) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (form.querySelector('#reg-name') as HTMLInputElement).value.trim();
        const email = (form.querySelector('#reg-email') as HTMLInputElement).value.trim();
        const phone = (form.querySelector('#reg-phone') as HTMLInputElement).value.trim();
        const password = (form.querySelector('#reg-password') as HTMLInputElement).value;

        if (name && email && phone && password) {
          try {
            const newUser = await client.createUser({ name, email, phone, password });
            // Refresh users
            const users = await client.getUsers();
            store.setState({ users, currentUser: newUser });
            store.addToast(`User profile created: ${newUser.name}`, 'success');
            modal.classList.remove('active');
            form.reset();
          } catch (err) {
            // Toast handled by API client
          }
        }
      });
    }
  }
}
