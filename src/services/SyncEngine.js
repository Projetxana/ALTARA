export const SyncEngine = {
    init: () => {
        console.log('[Sanctuum Core] Sync Engine Initialized.');

        // Sync Loop (every 15 min)
        setInterval(() => {
            console.log('[Sanctuum Core] Auto-Syncing...');
            // In a real app, you would iterate over all chalets here
            // SyncEngine.syncNow('chalet-1'); 
        }, 15 * 60 * 1000);
    },

    syncNow: async (chaletId, connections) => {
        console.log(`[Sanctuum Core] syncing Chalet ${chaletId}...`);

        if (!connections || Object.keys(connections).length === 0) {
            console.log("No connections configured.");
            return;
        }

        const stats = { imported: 0, conflicts: 0, errors: 0 };

        for (const [platform, url] of Object.entries(connections)) {
            if (!url) continue;

            try {
                // CALL SERVERLESS SYNC (Supabase Upsert)
                const response = await fetch('/api/ical-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, chaletId })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    let errMsg = 'Sync failed';
                    try {
                        const errJson = JSON.parse(errText);
                        errMsg = errJson.error || errJson.details || errMsg;
                    } catch (e) {
                        errMsg = `Error ${response.status}: ${errText.substring(0, 50)}`;
                    }
                    throw new Error(errMsg);
                }

                const data = await response.json();
                console.log(`[${platform}] Synced ${data.imported} events.`);

                // Update stats
                stats.imported += data.imported || 0;

            } catch (error) {
                console.error(`[${platform}] Sync Error:`, error);
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

        return stats;
    },

    detectConflicts: (existingBookings, newBooking) => {
        return existingBookings.some(b =>
            (newBooking.startDate < b.endDate && newBooking.endDate > b.startDate)
        );
    }
};
