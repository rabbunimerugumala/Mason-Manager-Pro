
type EventMap = {
  'permission-error': (error: any) => void;
};

class EventEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Array<T[K]> } = {};

  on<K extends keyof T>(eventName: K, listener: T[K]): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
  }

  off<K extends keyof T>(eventName: K, listener: T[K]): void {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = this.listeners[eventName]!.filter(
      (l) => l !== listener
    );
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName]!.forEach((listener) => {
      listener(...args);
    });
  }
}

export const errorEmitter = new EventEmitter<EventMap>();
