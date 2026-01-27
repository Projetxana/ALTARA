import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import ical from "npm:node-ical"

serve(async (req) => {
    // CORS Headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    }

    // Handle Preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers })
    }

    try {
        const { icalUrl } = await req.json()

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )

        // Télécharger le iCal Airbnb avec headers
        const res = await fetch(icalUrl, {
            redirect: "follow",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/calendar,text/plain;q=0.9,*/*;q=0.8",
                "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
            },
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch iCal: ${res.status} ${res.statusText}`);
        }

        const icalData = await res.text()
        const events = await ical.async.parseICS(icalData)

        for (const k in events) {
            const ev: any = events[k]

            if (ev.type === "VEVENT") {
                const start = new Date(ev.start).toISOString().split("T")[0]
                const end = new Date(ev.end).toISOString().split("T")[0]

                await supabase
                    .from("bookings")
                    .upsert({
                        external_uid: ev.uid,
                        source: "airbnb",
                        start,
                        end,
                        guest: ev.summary || "Airbnb Guest",
                        color: "#FF5A5F"
                    })
            }
        }

        return new Response(JSON.stringify({ status: "ok" }), {
            headers: { ...headers, "Content-Type": "application/json" },
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...headers, "Content-Type": "application/json" },
        })
    }
})
