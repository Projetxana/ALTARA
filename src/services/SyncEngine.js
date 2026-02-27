import { syncPlatformCalendar } from '../features/calendar/PlatformSyncService';

export const SyncEngine = {
    syncNow: async (chaletId, connections, onProgress = () => { }) => {
        console.log(`[Sanctuum Core] syncing Chalet ${chaletId}...`);
        onProgress("Initializing Sync Engine...");

        if (!connections || Object.keys(connections).length === 0) {
            console.log("No connections configured.");
            onProgress("No connections found.");
            return;
        }

        const stats = { imported: 0, conflicts: 0, errors: 0 };

        for (const [platform, url] of Object.entries(connections)) {
            if (!url) continue;

            try {
                onProgress(`Syncing ${platform}...`);
                await syncPlatformCalendar(url, chaletId, platform);

                console.log(`[${platform}] Sync OK via PlatformSyncService.`);
                onProgress(`${platform} synced successfully.`);
                stats.imported += 1;
            } catch (error) {
                console.error(`[${platform}] Sync Error:`, error);
                onProgress(`Error syncing ${platform}: ${error.message}`);
                stats.errors++;
                // Propagate if single connection for UI feedback
                if (Object.keys(connections).length === 1) {
                    throw error;
                }
            }
        }

        if (stats.errors > 0 && stats.imported === 0) {
            throw new Error(`Sync failed for all connections.`);
        }

        onProgress("Sync Complete!");
        return stats;
    },

    detectConflicts: (existingBookings, newBooking) => {
        return existingBookings.some(b =>
            (newBooking.startDate < b.endDate && newBooking.endDate > b.startDate)
        );
    }
};
