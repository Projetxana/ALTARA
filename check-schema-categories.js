
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmzozblhqbyibxihyerb.supabase.co'
const supabaseKey = 'sb_publishable__Ngfchnbr5Rhe7nruN3Gsw_rk64uo_k' // Extracted from check-schema.js

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
    const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error accessing finance_categories:', error.message)
    } else {
        console.log('finance_categories table exists:', data)
    }
}

checkCategories()
