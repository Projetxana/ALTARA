import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing ENV variables. Run with VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node debug_db.js");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGuide() {
    console.log("Checking guide_config table...");
    const { data, error } = await supabase.from('guide_config').select('*');

    if (error) {
        console.error("Error fetching guide_config:", error);
    } else {
        console.log("Rows found:", data.length);
        console.log("Rows:", JSON.stringify(data, null, 2));
    }

    // Try a test upsert on ID 1
    console.log("\nAttempting test update on ID 1...");
    const { error: updateError } = await supabase
        .from('guide_config')
        .upsert({ id: 1, updated_at: new Date().toISOString() })
        .select();

    if (updateError) {
        console.error("Test Update Failed:", updateError);
    } else {
        console.log("Test Update Success!");
    }
}

checkGuide();
