import { MarketDataService } from './MarketDataService';

export const ListingLabService = {

    // 1. Orchestrates the full market analysis
    analyzeMarket: async (chaletVal, airbnbUrl = null) => {
        let realData = null;

        // A. Fetch Real Application Data (Scraping) if URL provided
        if (airbnbUrl) {
            try {
                const res = await fetch(`/api/scrape-airbnb?url=${encodeURIComponent(airbnbUrl)}`);
                const json = await res.json();
                if (json.success) realData = json.data;
            } catch (e) {
                console.error("Failed to fetch real airbnb data", e);
            }
        }

        // B. Fetch Competitors via MarketDataService
        let lng = -74.1; // Default Tremblant/Laurentians
        let lat = 46.1;
        if (chaletVal.locationCoords) {
            lat = chaletVal.locationCoords.lat;
            lng = chaletVal.locationCoords.lng;
        }

        const competitors = await MarketDataService.getCompetitors(lat, lng, 10);

        // C. Perform Deep Analysis
        const basePrice = realData?.price ? parseFloat(realData.price) : chaletVal.baseNightPrice;
        const myAmenities = realData?.amenities || chaletVal.amenities || [];

        const marketStats = calculateMarketStats(competitors);
        const gapAnalysis = analyzeGap(basePrice, myAmenities, competitors, marketStats);

        // Generate insights
        const opportunities = generateInsights(gapAnalysis, realData);

        return {
            scrapedData: realData,
            marketStats: marketStats,
            gapAnalysis: gapAnalysis,
            yourPrice: basePrice,
            listingTitle: realData?.title,
            competitors: competitors,
            opportunities: opportunities
        };
    },

    // 2. AI Content Generator (Calls Backend)
    generateListing: async (chalet, competitors, angle = 'romantic') => {
        try {
            const res = await fetch('/api/rewrite-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listing: chalet,
                    competitors: competitors,
                    angle: angle
                })
            });
            const json = await res.json();
            if (json.success) return json.data;

            throw new Error("API failed");
        } catch (e) {
            console.error("AI Generation Failed", e);
            // Fallback object so UI doesn't break
            return {
                title: `${chalet.name} - Optimized`,
                description: "Failed to generate AI content. Please try again.",
                improvements: []
            };
        }
    },

    // 3. Offer Architect (Gap-aware)
    architectOffers: (priceGap = 0) => {
        const isPremium = priceGap > 0;
        if (isPremium) {
            return [
                { id: 1, name: 'The VIP Arrival', uplift: '+12%', includes: ['Porsche Transfer', 'Champagne Magnum', 'Early Check-in'] },
                { id: 2, name: 'Full-Service Ski', uplift: '+20%', includes: ['In-Chalet Fitting', 'Pass Delivery', 'Après-Ski Catering'] },
                { id: 3, name: 'Chef\'s Table', uplift: '+35%', includes: ['7-Course Dinner', 'Wine Pairing', 'Sommelier Service'] }
            ];
        } else {
            return [
                { id: 1, name: 'Romance Package', uplift: '+€150', includes: ['Rose Petals', 'Late Checkout', 'Breakfast Box'] },
                { id: 2, name: 'Family Essentials', uplift: '+€100', includes: ['High Chair/Crib', 'Toy Chest', 'Movie Night Kit'] },
                { id: 3, name: 'Breakfast Service', uplift: '+€25/p', includes: ['Local Pastries', 'Fruit', 'Coffee Delivery'] }
            ];
        }
    }
};

// --- HELPER FUNCTIONS (Business Logic) ---

function calculateMarketStats(competitors) {
    if (!competitors || competitors.length === 0) return { average: 0, top20: 0, bottom20: 0 };

    const prices = competitors.map(c => c.price_per_night).sort((a, b) => a - b);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Top 20% threshold (80th percentile)
    const top20Index = Math.floor(prices.length * 0.8);
    const bottom20Index = Math.floor(prices.length * 0.2);

    return {
        average: avg,
        top20: prices[top20Index] || avg,
        bottom20: prices[bottom20Index] || avg,
        count: prices.length
    };
}

function analyzeGap(myPrice, myAmenities, competitors, marketStats) {
    const priceGap = myPrice - marketStats.average;

    // Amenity Gap logic
    const allCompAmenities = new Set(competitors.flatMap(c => c.amenities));
    const myAmenitiesSet = new Set(myAmenities);
    const missingAmenities = ['Hot tub', 'Wifi', 'Pool', 'AC']
        .filter(a => allCompAmenities.has(a) && !myAmenitiesSet.has(a));

    return {
        priceGap: priceGap,
        isPremium: myPrice > marketStats.top20,
        isValue: myPrice < marketStats.bottom20,
        missingAmenities: missingAmenities,
        percentile: calculatePercentile(myPrice, competitors)
    };
}

function calculatePercentile(price, competitors) {
    if (!competitors.length) return 50;
    const cheaper = competitors.filter(c => c.price_per_night < price).length;
    return Math.round((cheaper / competitors.length) * 100);
}

function generateInsights(gapAnalysis, realData) {
    const insights = [];

    if (realData) insights.push('Live Listing Data Connected.');
    else insights.push('Simulated Listing (Connect URL for real analysis).');

    if (gapAnalysis.isPremium) insights.push(`You are positioned in the Top 20% (Luxury Tier).`);
    else if (gapAnalysis.isValue) insights.push(`You are priced for high occupancy (Value Tier).`);
    else insights.push(`You are priced competitively near market average.`);

    if (gapAnalysis.priceGap > 0) insights.push(`Your premium is +€${gapAnalysis.priceGap.toFixed(0)}.`);

    if (gapAnalysis.missingAmenities.length > 0) {
        insights.push(`Consider adding: ${gapAnalysis.missingAmenities.slice(0, 2).join(', ')}.`);
    }

    return insights;
}
