import type { State } from '../state/Store';
import { store } from '../state/Store';

export abstract class BaseComponent {
  protected container: HTMLElement;
  private unsubscribe: (() => void) | null = null;
  protected isMounted = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.mount();
  }

  private mount(): void {
    this.unsubscribe = store.subscribe((state) => {
      this.render(state);
      this.isMounted = true;
      this.postRender();
    });
  }

  /**
   * Render the HTML content based on state.
   */
  public abstract render(state: State): void;

  /**
   * Hook executed after rendering. Used for registering event listeners.
   */
  protected postRender(): void {}

  /**
   * Clean up listeners when component is destroyed.
   */
  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.container.innerHTML = '';
  }
}
