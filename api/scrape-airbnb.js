export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const cheerio = await import('cheerio');
        const axios = await import('axios');

        // 1. Fetch HTML with User-Agent to look like a browser
        const { data: html } = await axios.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        // 2. Load into Cheerio
        const $ = cheerio.load(html);
        const result = {
            title: '',
            description: '',
            image: '',
            price: 0,
            currency: 'EUR',
            amenities: []
        };

        // 3. Extract Metadata (OpenGraph / Meta Tags)
        result.title = $('meta[property="og:title"]').attr('content') || $('title').text();
        result.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        result.image = $('meta[property="og:image"]').attr('content');

        // 4. Extract Structured Data (JSON-LD)
        // Airbnb often puts key data in a script tag with type application/json or application/ld+json
        let foundJsonLd = false;
        $('script[type="application/ld+json"]').each((i, el) => {
            if (foundJsonLd) return;
            try {
                const json = JSON.parse($(el).html());

                // Look for Product or Hotel schema
                if (json['@type'] === 'Hotel' || json['@type'] === 'Product' || json['@type'] === 'LodgingBusiness' || json['@type'] === 'VacationRental' || json['@type'] === 'Accommodation') {
                    if (json.name) result.title = json.name;
                    if (json.description) result.description = json.description;
                    if (json.image) result.image = Array.isArray(json.image) ? json.image[0] : json.image;

                    // Price Extraction
                    if (json.offers) {
                        const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
                        if (offer.price) result.price = offer.price;
                        if (offer.priceCurrency) result.currency = offer.priceCurrency;
                    }
                    foundJsonLd = true;
                }
            } catch (e) {
                // Ignore parse errors from irrelevant scripts
            }
        });

        // 5. Fallback Price Extraction (Regex on content if JSON-LD failed)
        if (!result.price) {
            // Heuristic: Last Resort
            // Sometimes the title has " - $150 avg/night"
            const titlePrice = result.title.match(/[$€£](\d+)/);
            if (titlePrice) {
                result.price = parseInt(titlePrice[1]);
            }
        }

        res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Scraping error:', error);
        // Even on error, return success: false but with empty data so frontend doesn't crash
        res.status(200).json({ success: false, error: 'Failed to scrape listing', details: error.message });
    }
}
