import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://dmzozblhqbyibxihyerb.supabase.co',
    'sb_publishable__Ngfchnbr5Rhe7nruN3Gsw_rk64uo_k'
)

async function checkSchema() {
    const { data, error } = await supabase
        .from('chalets')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]))
            // check if connections key exists
            if ('connections' in data[0]) {
                console.log('✅ Connections column exists')
            } else {
                console.log('❌ Connections column MISSING')
            }
        } else {
            console.log('No chalets found to check schema.')
        }
    }
}

checkSchema()
