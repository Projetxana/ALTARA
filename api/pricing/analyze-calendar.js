import { createClient } from '@supabase/supabase-js';

const MAX_IMAGES = 6;

function getOutputText(response) {
    if (response?.output_text) {
        return response.output_text;
    }

    for (const item of response?.output || []) {
        for (const content of item?.content || []) {
            if (
                content?.type === 'output_text' &&
                content?.text
            ) {
                return content.text;
            }
        }
    }

    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed.'
        });
    }

    try {
        const authHeader =
            req.headers.authorization || '';

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required.'
            });
        }

        const token =
            authHeader.slice('Bearer '.length);

        const {
            chaletId,
            images,
            currentDate
        } = req.body || {};

        if (!chaletId) {
            return res.status(400).json({
                error: 'Missing chaletId.'
            });
        }

        if (
            !Array.isArray(images) ||
            images.length === 0
        ) {
            return res.status(400).json({
                error: 'No images supplied.'
            });
        }

        if (images.length > MAX_IMAGES) {
            return res.status(400).json({
                error:
                    `Maximum ${MAX_IMAGES} images per analysis.`
            });
        }

        const invalidImage =
            images.some(
                image =>
                    typeof image !== 'string' ||
                    !image.startsWith('data:image/')
            );

        if (invalidImage) {
            return res.status(400).json({
                error: 'Invalid image payload.'
            });
        }

        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const supabaseAnonKey =
            process.env.VITE_SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error(
                'Supabase environment variables are missing.'
            );
        }

        const supabaseAuth =
            createClient(
                supabaseUrl,
                supabaseAnonKey,
                {
                    auth: {
                        persistSession: false
                    },
                    global: {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                }
            );

        const {
            data: { user },
            error: authError
        } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                error:
                    'Invalid or expired authentication token.'
            });
        }

        const {
            data: chalet,
            error: chaletError
        } = await supabaseAuth
            .from('chalets')
            .select('id, user_id, name')
            .eq('id', chaletId)
            .eq('user_id', user.id)
            .single();

        if (chaletError || !chalet) {
            return res.status(403).json({
                error:
                    'You do not have access to this property.'
            });
        }

        const apiKey =
            process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                error:
                    'OPENAI_API_KEY is not configured on the server.'
            });
        }

        const model =
            process.env.OPENAI_VISION_MODEL ||
            'gpt-5.6-luna';

        const prompt = `
You are the calendar-price extraction engine for ALTARA.

The attached images are screenshots of a vacation-rental calendar,
normally Airbnb.

Your only task is to read VISIBLE nightly public prices associated
with VISIBLE calendar dates.

Current date: ${currentDate || new Date().toISOString().slice(0, 10)}
Property: ${chalet.name || chalet.id}

Rules:
- Extract each visible date that has a clearly readable numeric nightly price.
- Return the complete date in YYYY-MM-DD format.
- Use visible month/year headings to associate day numbers with dates.
- Screenshots may overlap. Duplicate dates are allowed in your extraction;
  the server will deduplicate them.
- Do not invent prices.
- Do not infer a hidden price.
- Ignore crossed-out prices when a current price is also visible.
- Prefer the current/primary displayed price.
- Ignore dates that only say unavailable, blocked or reserved and have no price.
- confidence is an integer from 0 to 100 representing visual reading confidence.
- raw_text is the exact short price text you believe you read, for example "$612".
- Currency should be CAD, USD, EUR, GBP or UNKNOWN.
- If a year is explicitly visible, use it.
- If no year is visible, use the year that is most consistent with the current
  date and the visible calendar sequence.
- Never use outside knowledge about Airbnb pricing.
`;

        const response =
            await fetch(
                'https://api.openai.com/v1/responses',
                {
                    method: 'POST',
                    headers: {
                        Authorization:
                            `Bearer ${apiKey}`,
                        'Content-Type':
                            'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        input: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type:
                                            'input_text',
                                        text: prompt
                                    },
                                    ...images.map(
                                        image => ({
                                            type:
                                                'input_image',
                                            image_url:
                                                image,
                                            detail:
                                                'auto'
                                        })
                                    )
                                ]
                            }
                        ],
                        text: {
                            format: {
                                type:
                                    'json_schema',
                                name:
                                    'altara_calendar_prices',
                                strict: true,
                                schema: {
                                    type: 'object',
                                    additionalProperties:
                                        false,
                                    required: [
                                        'platform',
                                        'currency',
                                        'dates'
                                    ],
                                    properties: {
                                        platform: {
                                            type: 'string'
                                        },
                                        currency: {
                                            type: 'string'
                                        },
                                        dates: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                additionalProperties:
                                                    false,
                                                required: [
                                                    'date',
                                                    'displayed_price',
                                                    'confidence',
                                                    'raw_text'
                                                ],
                                                properties: {
                                                    date: {
                                                        type:
                                                            'string'
                                                    },
                                                    displayed_price:
                                                        {
                                                            type:
                                                                'number'
                                                        },
                                                    confidence:
                                                        {
                                                            type:
                                                                'integer',
                                                            minimum: 0,
                                                            maximum: 100
                                                        },
                                                    raw_text:
                                                        {
                                                            type:
                                                                'string'
                                                        }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            );

        const openAIResult =
            await response.json();

        if (!response.ok) {
            console.error(
                '[analyze-calendar] OpenAI error:',
                openAIResult
            );

            return res.status(502).json({
                error:
                    openAIResult?.error?.message ||
                    'Vision analysis failed.'
            });
        }

        const outputText =
            getOutputText(openAIResult);

        if (!outputText) {
            throw new Error(
                'Vision model returned no structured output.'
            );
        }

        const parsed =
            JSON.parse(outputText);

        const bestByDate =
            new Map();

        for (const item of parsed.dates || []) {
            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(
                    item.date
                )
            ) {
                continue;
            }

            const displayedPrice =
                Number(item.displayed_price);

            const confidence =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(item.confidence)
                    )
                );

            if (
                !Number.isFinite(displayedPrice) ||
                displayedPrice <= 0
            ) {
                continue;
            }

            const candidate = {
                date: item.date,
                displayed_price:
                    displayedPrice,
                confidence,
                raw_text:
                    item.raw_text || ''
            };

            const existing =
                bestByDate.get(item.date);

            if (
                !existing ||
                candidate.confidence >
                    existing.confidence
            ) {
                bestByDate.set(
                    item.date,
                    candidate
                );
            }
        }

        const dates =
            Array.from(bestByDate.values())
                .sort(
                    (a, b) =>
                        a.date.localeCompare(b.date)
                );

        return res.status(200).json({
            success: true,
            platform:
                parsed.platform || 'airbnb',
            currency:
                parsed.currency || 'UNKNOWN',
            dates,
            count: dates.length,
            model
        });
    } catch (error) {
        console.error(
            '[analyze-calendar]',
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                'Calendar analysis failed.'
        });
    }
}
