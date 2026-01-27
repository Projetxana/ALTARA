import { MarketDataService } from '../../services/MarketDataService';

export async function scanMarket(url) {
    // Extract lat/lng from the URL if possible, or use defaults for the demo
    // For now, we'll use a hardcoded default suitable for testing if parsing fails
    // Real implementation would parse the Airbnb URL or use the chalet's stored coords
    const lat = 46.1167; // Tremblant/Laurentians approximate
    const lng = -74.5833;

    console.log("ListingLab (Web Mode): Fetching via MarketDataService...");

    try {
        // Direct Client-Side Call
        const competitors = await MarketDataService.getCompetitors(lat, lng);
        return { success: true, competitors: competitors, source: 'rapidapi_client' };
    } catch (error) {
        console.error("ListingLab Error:", error);
        throw error;
    }
}
