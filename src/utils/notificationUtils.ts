/**
 * Browser Notification Utilities
 * Provides functions for showing browser notifications with sound alerts
 */

/**
 * Request permission to show browser notifications
 * @returns Promise<NotificationPermission> - The permission state
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
}

/**
 * Play a notification sound
 * Uses the browser's built-in notification sound via silent:false in Notification API
 */
export function playNotificationSound(): void {
    try {
        // Create a short beep sound using Web Audio API as fallback
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
}

/**
 * Show a browser notification with sound
 * @param title - Notification title
 * @param message - Notification message/body
 * @param options - Additional notification options
 * @returns Promise<Notification | null> - The notification instance or null if failed
 */
export async function showNotificationWithSound(
    title: string,
    message: string,
    options?: {
        icon?: string;
        badge?: string;
        tag?: string;
        requireInteraction?: boolean;
    }
): Promise<Notification | null> {
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return null;
    }

    // Request permission if needed
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    try {
        // Create notification
        const notification = new Notification(title, {
            body: message,
            icon: options?.icon || '/favicon.ico',
            badge: options?.badge,
            tag: options?.tag || 'swe1-generation',
            requireInteraction: options?.requireInteraction || false,
            silent: false, // This ensures the browser plays its built-in notification sound
        });

        // Play additional sound for emphasis
        playNotificationSound();

        // Auto-close notification after 10 seconds if not requiring interaction
        if (!options?.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, 10000);
        }

        // Handle notification click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('Failed to show notification:', error);
        return null;
    }
}

/**
 * Check if notifications are supported and permission is granted
 * @returns boolean - True if notifications can be shown
 */
export function canShowNotifications(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Check if notification permission needs to be requested
 * @returns boolean - True if permission should be requested
 */
export function shouldRequestPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'default';
}
