import { createClient } from '@supabase/supabase-js';

async function run() {
    console.log("Starting...");
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Fetch error:", error);
    } else {
        console.log("Sample Booking:", data[0]);
    }
}
run();
