/**
 * MarketDataService
 * 
 * Responsible for fetching raw competitive data from the backend or external APIs.
 * Abstraction layer over the actual API endpoints.
 * 
 * CURRENT PROVIDER: Airbnb Data (airbnb-data.p.rapidapi.com)
 */

// Helper to extract Airbnb Listing ID
const extractListingId = (url) => {
    // Matches /rooms/12345678 or ?id=12345678
    const match = url.match(/\/rooms\/(\d+)/) || url.match(/id=(\d+)/);
    return match ? match[1] : null;
};

// Standalone function to act as the internal implementation
const fetchDetailsInternal = async (airbnbUrl) => {
    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    // FORCE Host to match 'Airbnb Data' (Vibe) provider
    const apiHost = 'airbnb-data.p.rapidapi.com';

    if (!apiKey) throw new Error("MISSING_API_KEY");

    const listingId = extractListingId(airbnbUrl);
    if (!listingId) throw new Error("INVALID_URL_FORMAT");

    try {
        // Airbnb Data uses /services/details-reviews?listingId=...
        const proxyUrl = `/api/airbnb/services/details-reviews?listingId=${listingId}&currency=CAD`;
        console.log(`MarketDataService: Fetching Details via Proxy ${proxyUrl}...`);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("RapidAPI Details Error:", errorText);
            throw new Error(`API_ERROR_${response.status}`);
        }

        const json = await response.json();
        console.log("MarketDataService Details Response:", json);

        // Airbnb Data (Vibe) structure
        const item = json.data || json;
        if (item) {
            return transformRapidApiData(item);
        }
        return null;

    } catch (error) {
        console.error("MarketDataService fetchListingDetails Failed:", error);
        throw error;
    }
};

export const MarketDataService = {

    getCompetitors: async (lat, lng, radiusKm = 10) => {
        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        const apiHost = 'airbnb-data.p.rapidapi.com';

        if (!apiKey) throw new Error("MISSING_API_KEY");

        // PROXY CALL for Search (Airbnb Data logic)
        // Usually /homes/search-geo or /homes/search-location
        const locationQuery = "Mont-Tremblant, Quebec";

        // Dynamic dates
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setDate(today.getDate() + 30);
        const nextMonthEnd = new Date(nextMonth);
        nextMonthEnd.setDate(nextMonth.getDate() + 5);

        const checkin = nextMonth.toISOString().split('T')[0];
        const checkout = nextMonthEnd.toISOString().split('T')[0];

        // Try generic search for this API
        const proxyUrl = `/api/airbnb/homes/search-location?location=${encodeURIComponent(locationQuery)}&checkin=${checkin}&checkout=${checkout}&adults=2`;

        console.log(`MarketDataService: Fetching Competitors via Proxy ${proxyUrl}...`);

        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost
                }
            });

            let list = [];
            if (response.ok) {
                const json = await response.json();
                console.log("Search Response:", json);
                list = json.data || json.homes || json.results || [];
            } else {
                console.warn("RapidAPI Search Request Failed, trying fallback...");
            }

            if (Array.isArray(list) && list.length > 0) {
                return list
                    .map(item => transformRapidApiData(item));
            }

            // FALLBACK
            console.warn("MarketDataService: Search empty/failed. Executing Fallback...");
            const fallbackDetail = await fetchDetailsInternal("https://www.airbnb.com/rooms/plus/22674258");

            if (fallbackDetail) {
                return [fallbackDetail];
            }

            return [];
        } catch (error) {
            console.error("MarketDataService getCompetitors Failed:", error);
            // Last ditch fallback
            try {
                const fallbackDetail = await fetchDetailsInternal("https://www.airbnb.com/rooms/plus/22674258");
                if (fallbackDetail) return [fallbackDetail];
            } catch (e) { /* ignore */ }

            return [];
        }
    },

    fetchListingDetails: async (airbnbUrl) => {
        return fetchDetailsInternal(airbnbUrl);
    }
};

/**
 * Standardize API response
 */
function transformRapidApiData(raw) {
    // Vibe / Airbnb Data structure
    const listing = raw.listing || raw;

    return {
        id: listing.id || Math.random().toString(36).substr(2, 9),
        title: listing.name || listing.title || "Unknown Listing",
        price_per_night: listing.price?.rate || listing.price_amount || listing.price || 0,
        rating: listing.rating || 4.5,
        review_count: listing.reviews_count || listing.review_count || 0,
        amenities: listing.amenities ? listing.amenities.map(a => typeof a === 'string' ? a : a.tag || a.name) : [],
        description: listing.sectioned_description?.description || listing.description || "",
        photo_count: listing.images?.length || listing.photos?.length || 0,
        distance_km: 0,
        image: listing.images?.[0] || listing.photos?.[0]?.large || null,
        url: listing.url || `https://airbnb.com/rooms/${listing.id}`
    };
}
