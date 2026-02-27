import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching bookings without cleaning tasks...');

    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

    if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
    }

    // Get all cleaning tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('cleaning_tasks')
        .select('booking_id');

    if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        return;
    }

    const existingBookingIds = new Set(tasks.map(t => t.booking_id));

    // Find bookings without tasks (including blocked ones)
    const missingTasks = bookings
        .filter(b => !existingBookingIds.has(b.id) && !existingBookingIds.has(b.external_uid))
        .map(b => ({
            chalet_id: b.chalet_id,
            booking_id: b.id,
            date: b.end_date || b.end,
            status: 'pending',
            auto_generated: true
        }));

    console.log(`Found ${missingTasks.length} missing tasks.`);

    if (missingTasks.length > 0) {
        const { error: insertError } = await supabase
            .from('cleaning_tasks')
            .insert(missingTasks);

        if (insertError) {
            console.error('Error inserting tasks:', insertError);
        } else {
            console.log('Successfully inserted missing tasks!');
        }
    }
}

run();
