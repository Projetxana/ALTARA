import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: chalets, error: fetchError } = await supabase.from('chalets').select('*');
  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return;
  }
  
  if (chalets.length === 0) {
    console.log("No chalets found.");
    return;
  }
  
  const targetChalet = chalets[0];
  console.log("Target Chalet ID:", targetChalet.id);
  
  const testPricingInfo = { test: true, timestamp: Date.now() };
  
  const { data, error } = await supabase
    .from('chalets')
    .update({ pricing_info: JSON.stringify(testPricingInfo) })
    .eq('id', targetChalet.id)
    .select();
    
  if (error) {
    console.error("EXPECTED ERROR DURING UPDATE:", error);
  } else {
    console.log("UPDATE SUCCESSFUL:", data[0].pricing_info);
  }
}

test();
