export default async function handler(req, res) {
  try {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing in environment.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Global sync failure',
      details: error.message
    });
  }
}
