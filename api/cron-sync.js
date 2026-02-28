import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Autoriser GET et POST uniquement
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('[cron-sync] Starting background sync...');

    // 1️⃣ Variables d'environnement
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing in environment.');
    }

    // 2️⃣ Initialisation Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 3️⃣ Test connexion DB
    const { data: chalets, error } = await supabase
      .from('chalets')
      .select('id')
      .limit(100);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const chaletCount = chalets?.length || 0;

    console.log(`[cron-sync] Connected to DB. Chalets found: ${chaletCount}`);

    // 4️⃣ Réponse OK
    return res.status(200).json({
      success: true,
      chaletsFound: chaletCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[cron-sync] ERROR:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Global sync failure',
      details: error.message
    });
  }
}
