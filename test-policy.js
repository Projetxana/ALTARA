import { createClient } from '@supabase/supabase-js';

async function run() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('bookings')
        .insert([{ chalet_id: 'a87cf599-873e-44bf-9b7a-20ea794dab90' }])
        .select();

    console.log("Error:", error);
}
run();
