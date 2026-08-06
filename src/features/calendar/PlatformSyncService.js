/**
 * ALTARA Phase 1 — PlatformSyncService
 * 
 * REFACTORISÉ : Le frontend ne fait plus la réconciliation.
 * Il appelle POST /api/sync avec le JWT utilisateur et reçoit le résultat structuré.
 * 
 * Authentification :
 * - Récupère le JWT Supabase de la session utilisateur courante
 * - L'envoie dans Authorization: Bearer <jwt>
 * - Le backend valide le JWT, vérifie la propriété du chalet,
 *   puis utilise SERVICE_ROLE_KEY pour les opérations de sync
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get the current user's JWT from the Supabase session.
 * @returns {string|null} The access token or null
 */
async function getUserJwt() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();

    return session?.access_token || null;
}

/**
 * Synchronise un chalet spécifique via une plateforme donnée.
 * 
 * @param {string} icalUrl - (legacy param, ignored — URL is read from calendar_sources)
 * @param {string} chaletId - UUID du chalet
 * @param {string} platform - Provider (airbnb, booking, vrbo...)
 * @returns {object} Résultat structuré du moteur de sync
 */
export async function syncPlatformCalendar(icalUrl, chaletId, platform) {
    const jwt = await getUserJwt();

    if (!jwt) {
        throw new Error('Not authenticated. Please log in to sync calendars.');
    }

    const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
            chaletId,
            source: platform
        })
    });

    if (res.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
    }

    if (res.status === 403) {
        throw new Error('You do not have access to this chalet.');
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sync failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    const result = await res.json();

    if (!result.success) {
        throw new Error(result.error || 'Sync engine returned an error.');
    }

    // Return in a format compatible with the existing SyncEngine consumer
    return {
        imported: (result.created || 0) + (result.updated || 0),
        created: result.created || 0,
        updated: result.updated || 0,
        cancelled: result.cancelled || 0,
        unchanged: result.unchanged || 0,
        reactivated: result.reactivated || 0,
        eventsReceived: result.eventsReceived || 0,
        source: result.source || platform
    };
}

/**
 * Synchronise toutes les sources d'un chalet.
 */
export async function syncAllSources(chaletId) {
    const jwt = await getUserJwt();

    if (!jwt) {
        throw new Error('Not authenticated. Please log in to sync calendars.');
    }

    const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ chaletId })
    });

    if (res.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sync failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    const result = await res.json();

    if (!result.success) {
        throw new Error(result.error || 'Sync engine returned an error.');
    }

    return result;
}
