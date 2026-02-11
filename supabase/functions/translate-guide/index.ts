
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { guideId, content } = await req.json()

        // If content not provided, fetch it
        let guideContent = content;
        if (!guideContent) {
            const { data, error } = await supabaseClient
                .from('guide_config')
                .select('content')
                .eq('id', guideId)
                .single()

            if (error) throw error
            guideContent = data.content
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API Key")
        }

        // --- TRANSLATION LOGIC ---
        let hasUpdates = false;

        // Helper to translate a single string
        async function translateText(text) {
            if (!text) return "";
            try {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o', // or gpt-3.5-turbo if cost concern
                        messages: [
                            { role: "system", content: "You are a hospitality translator for a premium vacation rental guest guide. Translate the French content to natural, native English. Keep meaning, structure, and tone. Do not shorten." },
                            { role: "user", content: text }
                        ]
                    })
                })
                const data = await res.json()
                return data.choices?.[0]?.message?.content?.trim() || text
            } catch (e) {
                console.error("Translation error:", e)
                return text
            }
        }

        // Iterate sections
        const sections = Object.keys(guideContent);

        for (const sectionKey of sections) {
            const section = guideContent[sectionKey];

            // Translate Section Title
            if (section.title && !section.title_en) {
                section.title_en = await translateText(section.title);
                hasUpdates = true;
            }

            // Translate Items
            if (section.items && Array.isArray(section.items)) {
                for (const item of section.items) {
                    // Title
                    if (item.title && !item.title_en) {
                        item.title_en = await translateText(item.title);
                        hasUpdates = true;
                    }
                    // Label (alternative to title)
                    if (item.label && !item.label_en) {
                        item.label_en = await translateText(item.label);
                        hasUpdates = true;
                    }
                    // Description
                    if (item.desc && !item.desc_en) {
                        item.desc_en = await translateText(item.desc);
                        hasUpdates = true;
                    }
                    // Text (often used for short info)
                    if (item.text && !item.text_en) {
                        item.text_en = await translateText(item.text);
                        hasUpdates = true;
                    }
                    // Details
                    if (item.details && !item.details_en) {
                        item.details_en = await translateText(item.details);
                        hasUpdates = true;
                    }
                }
            }
        }

        // Save if updates
        if (hasUpdates) {
            const { error: updateError } = await supabaseClient
                .from('guide_config')
                .update({ content: guideContent })
                .eq('id', guideId)

            if (updateError) throw updateError
        }

        return new Response(
            JSON.stringify({ success: true, updated: hasUpdates }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
