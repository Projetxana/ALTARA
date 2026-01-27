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
                // CALL OUR SERVERLESS PROXY
                const response = await fetch(`/api/fetch-calendar?url=${encodeURIComponent(url)}`);

                if (!response.ok) {
                    const errText = await response.text();
                    let errMsg = 'Proxy fetch failed';
                    try {
                        const errJson = JSON.parse(errText);
                        errMsg = errJson.error || errJson.details || errMsg;
                    } catch (e) {
                        errMsg = `Error ${response.status}: ${errText.substring(0, 50)}`;
                    }
                    throw new Error(errMsg);
                }

                const data = await response.json();
                const events = data.events;

                console.log(`[${platform}] Fetched ${events.length} events.`);

                // PROCESS EVENTS (Upsert to DB)
                // In a real app, you would call Supabase here to save events
                // For now, we just log stats
                stats.imported += events.length;

            } catch (error) {
                console.error(`[${platform}] Sync Error:`, error);
                stats.errors++;
                // Propagate the LAST error to help with UI feedback if it's a single sync
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
