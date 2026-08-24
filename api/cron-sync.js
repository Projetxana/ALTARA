/**
 * ALTARA — /api/cron-sync
 * 
 * @deprecated Ce fichier est conservé pour compatibilité avec le workflow GitHub Actions existant.
 * Il délègue entièrement au moteur unifié /api/sync.
 * 
 * Le workflow GitHub Actions appelle cette URL historique.
 * Plutôt que de casser l'URL, ce handler redirige vers le moteur partagé.
 */

import { syncAllChalets } from './lib/sync-engine.js';

export default async function handler(req, res) {
    // 🔐 Security check — même mécanisme qu'avant
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.warn('[cron-sync] Unauthorized request — missing or invalid Bearer token.');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('[cron-sync] Delegating to sync engine...');
        const result = await syncAllChalets();

        // Résumé lisible pour les logs GitHub Actions
        const summary = (result.results || []).map(r =>
            `${r.source}@${r.chaletId?.substring(0, 8)}: ${r.success ? '✅' : '❌'} +${r.created || 0} ~${r.updated || 0} -${r.cancelled || 0}`
        ).join(' | ');

        console.log(`[cron-sync] ${summary || 'No sources synced.'}`);

        return res.status(result.success ? 200 : 500).json({
            success: result.success,
            totalSources: result.totalSources || 0,
            results: result.results || [],
            syncedAt: result.syncedAt
        });

    } catch (error) {
        console.error('[cron-sync] Fatal error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
