import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/VITE_SUPABASE_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: b, error: bErr } = await supabase.from('bookings').select('id, status, end_date, external_uid');
  const { data: t, error: tErr } = await supabase.from('cleaning_tasks').select('booking_id');

  if (bErr) console.error("Bookings error:", bErr);
  if (tErr) console.error("Tasks error:", tErr);

  console.log("Total Bookings:", b?.length);
  console.log("Total Tasks:", t?.length);

  if (b?.length > 0) {
    console.log("Sample Booking ID:", b[0].id);
    console.log("Sample Booking External UID:", b[0].external_uid);
  }
}
run();
