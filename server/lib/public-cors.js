/**
 * Public API CORS policy.
 *
 * AYANA is an independent public website consuming ALTARA's API.
 * Additional public sites can be added through:
 *
 * PUBLIC_BOOKING_ALLOWED_ORIGINS=https://example.com,https://www.example.com
 */

const DEFAULT_PUBLIC_ORIGINS = [
    'https://chaletayana.ca',
    'https://www.chaletayana.ca'
];

function getAllowedOrigins() {
    const configured =
        String(
            process.env.PUBLIC_BOOKING_ALLOWED_ORIGINS || ''
        )
            .split(',')
            .map(origin => origin.trim())
            .filter(Boolean);

    return new Set([
        ...DEFAULT_PUBLIC_ORIGINS,
        ...configured
    ]);
}

export function applyPublicCors(
    req,
    res,
    {
        methods = ['GET', 'POST', 'OPTIONS']
    } = {}
) {
    const origin =
        String(req.headers.origin || '');

    const allowedOrigins =
        getAllowedOrigins();

    const originAllowed =
        origin &&
        allowedOrigins.has(origin);

    if (originAllowed) {
        res.setHeader(
            'Access-Control-Allow-Origin',
            origin
        );

        res.setHeader(
            'Vary',
            'Origin'
        );

        res.setHeader(
            'Access-Control-Allow-Methods',
            methods.join(', ')
        );

        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        );

        res.setHeader(
            'Access-Control-Max-Age',
            '86400'
        );
    }

    /*
     * CORS preflight only.
     *
     * Same-origin ALTARA calls do not require these headers.
     * An unknown cross-origin browser is denied at preflight.
     */
    if (req.method === 'OPTIONS') {
        if (origin && !originAllowed) {
            res.status(403).json({
                success: false,
                error: 'Origin not allowed.'
            });

            return true;
        }

        res.status(204).end();
        return true;
    }

    return false;
}
