const configuredMode =
    String(import.meta.env.VITE_APP_MODE || '')
        .trim()
        .toLowerCase();

const hostname =
    typeof window !== 'undefined'
        ? String(window.location.hostname || '').toLowerCase()
        : '';

export const APP_MODE =
    configuredMode === 'ayana' ||
    configuredMode === 'altara'
        ? configuredMode
        : hostname.includes('chaletayana.ca')
            ? 'ayana'
            : 'altara';

export const isAyanaApp =
    APP_MODE === 'ayana';

export const isAltaraApp =
    APP_MODE === 'altara';

const configuredApiUrl =
    String(import.meta.env.VITE_ALTARA_API_URL || '')
        .trim()
        .replace(/\/+$/, '');

export const ALTARA_API_URL =
    configuredApiUrl;

export function altaraApi(path = '') {
    const normalizedPath =
        path.startsWith('/')
            ? path
            : `/${path}`;

    /*
     * Empty VITE_ALTARA_API_URL intentionally means same-origin.
     * This keeps the current deployment working during migration.
     */
    return `${ALTARA_API_URL}${normalizedPath}`;
}
