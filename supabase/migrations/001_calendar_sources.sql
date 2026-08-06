-- ============================================================================
-- ALTARA Phase 1 — Migration 001: calendar_sources
-- Observabilité de la synchronisation des calendriers
-- NON DESTRUCTIVE — Peut être exécutée plusieurs fois grâce à IF NOT EXISTS
-- ============================================================================

-- Table de suivi des sources calendrier par chalet
CREATE TABLE IF NOT EXISTS calendar_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,

    -- Lien vers le chalet propriétaire
    chalet_id uuid REFERENCES chalets(id) ON DELETE CASCADE NOT NULL,

    -- Identifiant de la plateforme (airbnb, booking, vrbo, mrchalet, direct)
    provider text NOT NULL,

    -- URL iCal à synchroniser
    ical_url text NOT NULL,

    -- Activation/désactivation sans supprimer
    enabled boolean DEFAULT true NOT NULL,

    -- Observabilité
    last_sync_attempt_at timestamp with time zone,
    last_successful_sync_at timestamp with time zone,
    last_sync_status text DEFAULT 'never', -- 'never', 'success', 'error', 'warning'
    last_sync_error text,
    last_event_count integer DEFAULT 0,

    -- Empêcher les doublons : un seul Airbnb par chalet, etc.
    CONSTRAINT unique_chalet_provider UNIQUE (chalet_id, provider)
);

-- RLS : les propriétaires voient uniquement les sources de leurs chalets
ALTER TABLE calendar_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sources' AND policyname = 'Users can view own calendar_sources'
    ) THEN
        CREATE POLICY "Users can view own calendar_sources"
            ON calendar_sources FOR SELECT
            USING (chalet_id IN (SELECT id FROM chalets WHERE user_id = auth.uid()));
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sources' AND policyname = 'Users can manage own calendar_sources'
    ) THEN
        CREATE POLICY "Users can manage own calendar_sources"
            ON calendar_sources FOR ALL
            USING (chalet_id IN (SELECT id FROM chalets WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Permettre au backend (service_role) de tout faire — déjà implicite avec service_role key,
-- mais on ajoute une policy pour les appels cron utilisant potentiellement anon key
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sources' AND policyname = 'Allow service operations on calendar_sources'
    ) THEN
        CREATE POLICY "Allow service operations on calendar_sources"
            ON calendar_sources FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
