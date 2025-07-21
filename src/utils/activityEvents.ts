// Simple event emitter for activity updates
class ActivityEventEmitter {
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

// Global instance
export const activityEvents = new ActivityEventEmitter();

// Convenience functions
export const notifyActivityUpdate = () => activityEvents.emit();
export const subscribeToActivityUpdates = (listener: () => void) => activityEvents.subscribe(listener); 