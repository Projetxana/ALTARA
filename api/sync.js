/**
 * ALTARA Phase 1 — /api/sync
 * 
 * Point d'entrée UNIQUE pour la synchronisation des calendriers.
 * 
 * Modes d'authentification :
 * 
 * 1. Utilisateur authentifié (depuis le dashboard) :
 *    POST { chaletId, source? }
 *    Authorization: Bearer <user-jwt>
 *    → Le JWT est validé via supabase.auth.getUser()
 *    → L'API vérifie que l'utilisateur possède le chalet demandé
 *    → Puis utilise SERVICE_ROLE_KEY pour les opérations de sync
 * 
 * 2. Cron (depuis GitHub Actions) :
 *    POST (pas de body nécessaire)
 *    Authorization: Bearer <CRON_SECRET>
 *    → Le token est comparé à process.env.CRON_SECRET
 *    → Sync tous les chalets avec toutes les sources actives
 * 
 * Sécurité :
 * - SERVICE_ROLE_KEY n'est JAMAIS exposé au frontend
 * - Les deux modes sont explicitement distingués
 * - Un appel sans authentification valide = 401
 */

import { createClient } from '@supabase/supabase-js';
import { syncChalet, syncChaletSource, syncAllChalets, bootstrapCalendarSources } from './lib/sync-engine.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Missing Authorization header. Expected: Bearer <token>'
        });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // ─── Mode 1 : Cron (CRON_SECRET) ───
        if (token === process.env.CRON_SECRET) {
            console.log('[sync] Cron trigger — syncing all chalets...');
            const result = await syncAllChalets();
            return res.status(result.success ? 200 : 500).json(result);
        }

        // ─── Mode 2 : Utilisateur authentifié (JWT Supabase) ───
        const { chaletId, source } = req.body || {};

        if (!chaletId) {
            return res.status(400).json({
                success: false,
                error: 'Missing chaletId in request body.'
            });
        }

        // Validate the JWT using the anon key (read-only client)
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase URL or anon key not configured.');
        }

        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        // Validate the user's JWT
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            console.warn('[sync] Invalid JWT:', authError?.message || 'No user returned');
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired authentication token.'
            });
        }

        // Verify the user owns the requested chalet
        const { data: chalet, error: chaletError } = await supabaseAuth
            .from('chalets')
            .select('id, user_id')
            .eq('id', chaletId)
            .eq('user_id', user.id)
            .single();

        if (chaletError || !chalet) {
            console.warn(`[sync] User ${user.id} does not own chalet ${chaletId}`);
            return res.status(403).json({
                success: false,
                error: 'You do not have access to this chalet.'
            });
        }

        // User is authenticated and authorized — proceed with sync
        console.log(`[sync] User ${user.id} triggered sync for chalet ${chaletId}`);

        // Bootstrap calendar_sources from chalets.connections (bridge)
        await bootstrapCalendarSources(chaletId);

        let result;
        if (source) {
            console.log(`[sync] Syncing source: ${source}`);
            result = await syncChaletSource(chaletId, source);
        } else {
            console.log(`[sync] Syncing all sources`);
            result = await syncChalet(chaletId);
        }

        return res.status(result.success ? 200 : 500).json(result);

    } catch (error) {
        console.error('[sync] Fatal error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            existingBookingsModified: false
        });
    }
}
