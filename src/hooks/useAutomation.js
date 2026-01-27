import { useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

/**
 * useAutomation Hook
 * 
 * This hook is designed to be the bridge between the UI and future external automation tools.
 * It currently logs actions to the console but is structured to easily swap in 
 * API calls to Zapier, Make.com, or a custom backend in the future.
 */
export const useAutomation = () => {
    const { addNotification } = useNotification();
    const [isProcessing, setIsProcessing] = useState(false);

    // Generic webhook trigger
    const triggerWebhook = useCallback(async (webhookUrl, payload) => {
        setIsProcessing(true);
        console.log(`[Automator] Triggering extraction to ${webhookUrl}`, payload);

        try {
            // Placeholder for real fetch:
            // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify(payload) });

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            return { success: true, timestamp: new Date().toISOString() };
        } catch (error) {
            console.error("[Automator] Webhook failed", error);
            return { success: false, error };
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // Specific Action: Sync Check-in details to Cleaning Team
    const notifyCleaningTeam = useCallback((booking) => {
        const payload = {
            event: 'clean_request',
            chalet: booking.chaletName,
            date: booking.checkoutDate,
            guestCount: booking.guests
        };

        console.log("[Automator] Notifying Cleaning Team...", payload);
        addNotification('info', 'Automation', 'Cleaning team notified via Webhook (Simulated).');
        return triggerWebhook('https://hooks.zapier.com/fake-endpoint', payload);
    }, [addNotification, triggerWebhook]);

    // Specific Action: Send Welcome Guide via SMS
    const sendWelcomeGuide = useCallback((guestPhone, guideUrl) => {
        console.log(`[Automator] Sending SMS to ${guestPhone} with link ${guideUrl}`);
        addNotification('info', 'Automation', 'Welcome Guide sent via SMS (Simulated).');
    }, [addNotification]);

    return {
        isProcessing,
        notifyCleaningTeam,
        sendWelcomeGuide,
        triggerWebhook
    };
};
