import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://dmzozblhqbyibxihyerb.supabase.co',
    'sb_publishable__Ngfchnbr5Rhe7nruN3Gsw_rk64uo_k'
)

async function checkSchema() {
    console.log("Checking schema...");
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]))
        } else {
            console.log('No bookings found to check schema.')
        }
    }
}

checkSchema()
