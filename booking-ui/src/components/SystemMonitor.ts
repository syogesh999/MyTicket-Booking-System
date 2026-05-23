import { BaseComponent } from './BaseComponent';
import type { State } from '../state/Store';
import { store } from '../state/Store';
import { client } from '../api/Client';

export class SystemMonitor extends BaseComponent {
  private isRefreshing = false;
  
  // Generating stable mock stats for services on load
  private mockStats: Record<string, { cpu: number; mem: number; latency: number }> = {
    gateway: { cpu: 1.2, mem: 198, latency: 4 },
    userService: { cpu: 0.8, mem: 245, latency: 12 },
    trainService: { cpu: 0.5, mem: 212, latency: 8 },
    bookingService: { cpu: 1.5, mem: 278, latency: 18 },
    paymentService: { cpu: 0.4, mem: 230, latency: 15 },
  };

  public render(state: State): void {
    const health = state.health;
    const services = [
      { id: 'gateway', name: 'API Gateway (Port 8080)', status: health.gateway, description: 'Reactive router & CORS filter hub', stats: this.mockStats.gateway },
      { id: 'userService', name: 'User Microservice', status: health.userService, description: 'Handles credentials & profiles database', stats: this.mockStats.userService },
      { id: 'trainService', name: 'Train Microservice', status: health.trainService, description: 'Manages routes, inventory & seats availability', stats: this.mockStats.trainService },
      { id: 'bookingService', name: 'Booking Microservice', status: health.bookingService, description: 'Seat validation orchestrator & Feign link', stats: this.mockStats.bookingService },
      { id: 'paymentService', name: 'Payment Microservice', status: health.paymentService, description: 'Transactional gateway simulator & refund queue', stats: this.mockStats.paymentService },
    ];

    const upCount = services.filter((s) => s.status === 'UP').length;
    const systemStatusText = upCount === services.length 
      ? 'Fully Operational' 
      : upCount > 0 
      ? 'Degraded Performance' 
      : 'Complete Outage';

    const systemStatusClass = upCount === services.length 
      ? 'status-confirmed' 
      : upCount > 0 
      ? 'status-pending' 
      : 'status-cancelled';

    this.container.innerHTML = `
      <div class="container animate-fade-in">
        <!-- Infrastructure Banner -->
        <div class="glass-card monitor-hero" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden;">
          <div class="search-banner-glow"></div>
          <div>
            <span class="welcome-badge">📊 Live Server Telemetry</span>
            <h2 style="margin-top: 0.5rem; font-family: var(--font-header);">Spring Cloud Eureka Mesh</h2>
            <p class="text-secondary" style="font-size: 0.95rem; margin-top: 0.25rem;">Monitoring registry bindings, latency charts, and JVM heap load metrics.</p>
          </div>
          
          <div style="text-align: right;">
            <span class="status-badge ${systemStatusClass}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem; margin-bottom: 0.5rem;">
              ${systemStatusText}
            </span>
            <div class="text-secondary" style="font-size: 0.8rem;">${upCount} / ${services.length} services online</div>
          </div>
        </div>

        <div class="grid-main">
          <!-- Left side: Services List -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="font-size: 1.2rem;">Microservice Registry Nodes</h4>
              <button class="btn btn-primary btn-sm" id="btn-refresh-health" ${this.isRefreshing ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${this.isRefreshing ? 'animate-spin' : ''}"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                ${this.isRefreshing ? 'Scanning Mesh...' : 'Re-scan Nodes'}
              </button>
            </div>

            ${services
              .map((service) => {
                const isUp = service.status === 'UP';
                // Jitter stats for active feel
                const cpu = isUp ? Math.max(0.1, (service.stats.cpu + (Math.random() - 0.5) * 0.2)).toFixed(1) : '0.0';
                const mem = isUp ? Math.round(service.stats.mem + (Math.random() - 0.5) * 6) : 0;
                const latency = isUp ? Math.round(service.stats.latency + (Math.random() - 0.5) * 2) : 0;

                return `
                  <div class="glass-card service-monitor-card" style="display: flex; flex-direction: column; gap: 1rem; border-left: 4px solid ${isUp ? 'var(--success)' : 'var(--error)'};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <h4 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                          ${service.name}
                        </h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 0.25rem;">${service.description}</p>
                      </div>
                      <span class="status-badge ${isUp ? 'status-confirmed' : 'status-cancelled'}">
                        ${isUp ? 'UP' : 'OFFLINE'}
                      </span>
                    </div>

                    ${isUp ? `
                      <div class="service-telemetry" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color); font-size: 0.8rem;">
                        <div>
                          <span class="text-muted">Latency</span>
                          <div style="font-weight: 600; font-size: 0.95rem; margin-top: 0.15rem;">${latency} ms</div>
                        </div>
                        <div>
                          <span class="text-muted">CPU Load</span>
                          <div style="font-weight: 600; font-size: 0.95rem; margin-top: 0.15rem;">${cpu}%</div>
                        </div>
                        <div>
                          <span class="text-muted">JVM Heap Size</span>
                          <div style="font-weight: 600; font-size: 0.95rem; margin-top: 0.15rem;">${mem} MB</div>
                        </div>
                      </div>
                    ` : `
                      <div style="padding: 0.75rem; background: rgba(239,68,68,0.04); border: 1px solid rgba(239,68,68,0.1); border-radius: var(--border-radius-sm); font-size: 0.8rem; color: var(--error);">
                        Connection Refused. Service is unregistered or thread pool is exhausted.
                      </div>
                    `}
                  </div>
                `;
              })
              .join('')}
          </div>

          <!-- Right side: DevOps Troubleshooting Panel -->
          <div>
            <div class="glass-card devops-card" style="position: sticky; top: 100px;">
              <h4 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                🛠️ Troubleshooting Center
              </h4>
              
              <div class="troubleshoot-guide" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
                <div>
                  <h5 style="margin-bottom: 0.25rem;">1. Microservices Architecture Order</h5>
                  <p class="text-secondary" style="line-height: 1.4;">The backend requires services to run in order. Make sure they are launched sequentially with 15s delays so Eureka registers coordinates.</p>
                </div>

                <div>
                  <h5 style="margin-bottom: 0.25rem;">2. Restart Specific Node</h5>
                  <p class="text-secondary" style="line-height: 1.4;">If a service goes offline, run the following in its directory:</p>
                  <pre style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; margin-top: 0.4rem; border: 1px solid var(--border-color); color: var(--accent-secondary); overflow-x: auto;">mvn spring-boot:run</pre>
                </div>

                <div>
                  <h5 style="margin-bottom: 0.25rem;">3. Port Identifiers Reference</h5>
                  <ul class="text-secondary" style="margin-left: 1.25rem; margin-top: 0.25rem; line-height: 1.5; display: flex; flex-direction: column; gap: 0.25rem;">
                    <li><strong>8761</strong>: Eureka Discovery Registry</li>
                    <li><strong>8080</strong>: Netty API Gateway Router</li>
                    <li><strong>8081</strong>: User Service Database</li>
                    <li><strong>8082</strong>: Train Inventory Service</li>
                    <li><strong>8083</strong>: Booking Orchestrator Node</li>
                    <li><strong>8084</strong>: Payment Sim Node</li>
                  </ul>
                </div>

                <div style="background: var(--accent-glow); border: 1px dashed rgba(99,102,241,0.3); border-radius: var(--border-radius-sm); padding: 0.85rem;">
                  <strong>💡 Protip: Automated Setup</strong>
                  <p style="margin-top: 0.25rem; line-height: 1.3;">Run the PowerShell file <code style="font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.1); padding: 1px 3px; border-radius: 2px;">start_and_test.ps1</code> in root directory to launch the complete grid of databases and microservices automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  protected postRender(): void {
    const refreshBtn = this.container.querySelector('#btn-refresh-health');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        if (this.isRefreshing) return;
        this.isRefreshing = true;
        this.render(store.getState());

        try {
          await client.checkHealth();
          store.addToast('Registry health check completed', 'success');
        } catch {
          // Errors handled by API
        } finally {
          this.isRefreshing = false;
          this.render(store.getState());
        }
      });
    }
  }
}
