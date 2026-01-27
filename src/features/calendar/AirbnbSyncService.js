import { supabase } from '../../lib/supabase'

export async function syncAirbnbCalendar(icalUrl) {
    const { data, error } = await supabase.functions.invoke('ical-sync', {
        body: { icalUrl }
    })

    if (error) {
        console.error(error)
        throw error
    }

    return data
}
