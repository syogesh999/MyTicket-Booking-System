import { BaseComponent } from '../components/BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class TrainFinder extends BaseComponent {
  public render(state: State): void {
    const { source, destination } = state.searchQuery;
    
    // Filter trains based on query
    const filteredTrains = state.trains.filter((t) => {
      const matchSrc = !source || t.source.toLowerCase().includes(source.toLowerCase());
      const matchDst = !destination || t.destination.toLowerCase().includes(destination.toLowerCase());
      return matchSrc && matchDst;
    });

    const routeSuggestions = ['New Delhi', 'Kochi', 'Mumbai', 'Chennai', 'Bengaluru', 'Kolkata', 'Goa', 'Hyderabad'];

    this.container.innerHTML = `
      <div class="container animate-fade-in">
        <!-- Search Banner Card -->
        <div class="glass-card search-banner" style="margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div class="search-banner-glow"></div>
          <h3 class="section-title" style="margin-bottom: 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search Routes & Seat Allocation
          </h3>
          
          <form id="train-search-form" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="search-source">Leaving From</label>
              <input type="text" id="search-source" class="input-field" placeholder="e.g. New Delhi" value="${source}" list="src-suggestions" />
              <datalist id="src-suggestions">
                ${routeSuggestions.map(s => `<option value="${s}">`).join('')}
              </datalist>
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
              <label for="search-destination">Going To</label>
              <input type="text" id="search-destination" class="input-field" placeholder="e.g. Kochi" value="${destination}" list="dst-suggestions" />
              <datalist id="dst-suggestions">
                ${routeSuggestions.map(s => `<option value="${s}">`).join('')}
              </datalist>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button type="submit" class="btn btn-primary">Filter Trains</button>
              <button type="button" class="btn btn-secondary" id="btn-reset-search">Clear</button>
            </div>
          </form>
        </div>

        <!-- Trains Grid Section -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h4 style="font-size: 1.25rem;">Available Express Lines (${filteredTrains.length})</h4>
          <button class="btn btn-secondary btn-sm" id="btn-add-mock-train">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Express Train
          </button>
        </div>

        ${
          filteredTrains.length === 0
            ? `
          <div class="glass-card text-center" style="padding: 3rem;">
            <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">🚆</span>
            <h5>No Trains Found</h5>
            <p class="text-secondary" style="margin-bottom: 1.5rem;">We couldn't find any trains matching your search criteria. Try modifying your stations or click "Add Express Train" to create a new route in the database.</p>
            <button class="btn btn-primary" id="btn-empty-add-train">Add New Train Route</button>
          </div>
          `
            : `
          <div class="train-grid">
            ${filteredTrains
              .map((train) => {
                const isSoldOut = train.availableSeats <= 0;
                const isLowSeats = train.availableSeats > 0 && train.availableSeats < 10;
                
                let seatClass = 'high';
                let seatText = `${train.availableSeats} seats available`;
                if (isSoldOut) {
                  seatClass = 'low';
                  seatText = 'Sold Out';
                } else if (isLowSeats) {
                  seatClass = 'low';
                  seatText = `Only ${train.availableSeats} seats left!`;
                }

                return `
                  <div class="glass-card train-card">
                    <div>
                      <div class="train-header">
                        <span class="train-badge">${train.trainNumber}</span>
                        <div class="train-seats ${seatClass}">
                          <span class="count">${seatText}</span>
                        </div>
                      </div>
                      
                      <h4 class="train-title">${train.trainName}</h4>
                      
                      <div class="train-route">
                        <span>${train.source}</span>
                        <span class="route-arrow">&rarr;</span>
                        <span>${train.destination}</span>
                      </div>
                    </div>

                    <div class="train-footer">
                      <div class="train-price">
                        <span class="label">One-Way Ticket</span>
                        <span class="amount">₹${train.fare}</span>
                      </div>
                      
                      <button class="btn btn-primary btn-book-trigger" 
                        data-id="${train.id}" 
                        data-name="${train.trainName}"
                        data-fare="${train.fare}"
                        ${isSoldOut ? 'disabled' : ''}>
                        ${state.currentUser ? 'Book Ticket' : 'Select User to Book'}
                      </button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `
        }
      </div>

      <!-- Add Mock Train Modal -->
      <div class="modal-overlay" id="train-mock-modal">
        <div class="glass-card modal-content">
          <div class="modal-header">
            <h3>Add Express Train</h3>
            <button class="modal-close" id="train-mock-close">&times;</button>
          </div>
          <form id="train-mock-form">
            <div class="grid-2">
              <div class="form-group">
                <label for="mock-number">Train Number</label>
                <input type="text" id="mock-number" class="input-field" placeholder="e.g. 12626" required />
              </div>
              <div class="form-group">
                <label for="mock-name">Train Name</label>
                <input type="text" id="mock-name" class="input-field" placeholder="e.g. Kerala Express" required />
              </div>
            </div>
            
            <div class="grid-2">
              <div class="form-group">
                <label for="mock-source">From Station</label>
                <input type="text" id="mock-source" class="input-field" placeholder="e.g. New Delhi" required />
              </div>
              <div class="form-group">
                <label for="mock-destination">To Station</label>
                <input type="text" id="mock-destination" class="input-field" placeholder="e.g. Kochi" required />
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label for="mock-seats">Available Seats</label>
                <input type="number" id="mock-seats" class="input-field" min="1" value="120" required />
              </div>
              <div class="form-group">
                <label for="mock-fare">Base Fare (₹)</label>
                <input type="number" id="mock-fare" class="input-field" min="50" value="650" required />
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              Insert Train Route
            </button>
          </form>
        </div>
      </div>
    `;
  }

  protected postRender(): void {
    const form = this.container.querySelector('#train-search-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const source = (form.querySelector('#search-source') as HTMLInputElement).value.trim();
        const destination = (form.querySelector('#search-destination') as HTMLInputElement).value.trim();
        store.setState({ searchQuery: { source, destination } });
      });
    }

    const resetBtn = this.container.querySelector('#btn-reset-search');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const srcInput = this.container.querySelector('#search-source') as HTMLInputElement;
        const dstInput = this.container.querySelector('#search-destination') as HTMLInputElement;
        if (srcInput) srcInput.value = '';
        if (dstInput) dstInput.value = '';
        store.setState({ searchQuery: { source: '', destination: '' } });
      });
    }

    // Modal triggers for creating train
    const addMockBtn = this.container.querySelector('#btn-add-mock-train');
    const emptyAddBtn = this.container.querySelector('#btn-empty-add-train');
    const modal = this.container.querySelector('#train-mock-modal') as HTMLElement;
    const closeBtn = this.container.querySelector('#train-mock-close');
    const mockForm = this.container.querySelector('#train-mock-form') as HTMLFormElement;

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    if (addMockBtn) addMockBtn.addEventListener('click', openModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (mockForm && modal) {
      mockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const trainNumber = (mockForm.querySelector('#mock-number') as HTMLInputElement).value.trim();
        const trainName = (mockForm.querySelector('#mock-name') as HTMLInputElement).value.trim();
        const source = (mockForm.querySelector('#mock-source') as HTMLInputElement).value.trim();
        const destination = (mockForm.querySelector('#mock-destination') as HTMLInputElement).value.trim();
        const availableSeats = Number((mockForm.querySelector('#mock-seats') as HTMLInputElement).value);
        const fare = Number((mockForm.querySelector('#mock-fare') as HTMLInputElement).value);

        if (trainNumber && trainName && source && destination) {
          try {
            await client.createTrain({
              trainNumber,
              trainName,
              source,
              destination,
              availableSeats,
              fare,
            });
            // Refresh trains
            const trains = await client.getTrains();
            store.setState({ trains });
            store.addToast(`Train route created: ${trainName}`, 'success');
            closeModal();
            mockForm.reset();
          } catch (err) {
            // Error toast handled by client
          }
        }
      });
    }

    // Booking click handling
    const bookBtns = this.container.querySelectorAll('.btn-book-trigger');
    bookBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const trainId = Number(btn.getAttribute('data-id'));
        const trainName = btn.getAttribute('data-name') || '';
        const fare = Number(btn.getAttribute('data-fare'));
        const user = store.getState().currentUser;

        if (!user) {
          store.addToast('Please login/select a user profile first!', 'error');
          // Smoothly scroll to top to highlight the user switcher
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Dispatch event to show booking modal
        const event = new CustomEvent('open-booking-modal', {
          detail: { trainId, trainName, fare },
        });
        window.dispatchEvent(event);
      });
    });
  }
}
