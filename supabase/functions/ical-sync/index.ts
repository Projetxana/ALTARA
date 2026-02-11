import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export default async (req) => {
    try {
        const url = new URL(req.url);
        const icalUrl = url.searchParams.get("icalUrl");

        const res = await fetch(icalUrl, {
            redirect: "follow",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/calendar,text/plain;q=0.9,*/*;q=0.8",
                "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
            },
        });

        const text = await res.text();

        const now = new Date();
        const oneYear = new Date();
        oneYear.setFullYear(now.getFullYear() + 1);

        const events = text
            .split("BEGIN:VEVENT")
            .slice(1)
            .filter((e) => {
                const start = e.match(/DTSTART:(\d+)/)?.[1];
                if (!start) return false;

                const year = parseInt(start.substring(0, 4));
                return year >= now.getFullYear() && year <= oneYear.getFullYear();
            });

        const bookings = events.map((e) => {
            const start = e.match(/DTSTART:(\d+)/)?.[1];
            const end = e.match(/DTEND:(\d+)/)?.[1];
            const uid = e.match(/UID:(.+)/)?.[1];

            return {
                start,
                end,
                uid,
                source: "airbnb",
                color: "#FF5A5F",
            };
        });

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!
        );

        for (const b of bookings) {
            await supabase.from("bookings").upsert(
                {
                    external_uid: b.uid,
                    start: b.start,
                    end: b.end,
                    source: b.source,
                    color: b.color,
                },
                { onConflict: "external_uid" }
            );
        }

        return new Response(JSON.stringify(bookings), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
        });
    }
};
