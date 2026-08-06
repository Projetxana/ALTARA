-- ============================================================================
-- ALTARA Phase 1 — Migration 002: sync_runs
-- Journal des synchronisations — traçabilité complète
-- NON DESTRUCTIVE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Lien vers la source calendrier synchronisée
    calendar_source_id uuid REFERENCES calendar_sources(id) ON DELETE CASCADE NOT NULL,

    -- Timestamps
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,

    -- Résultat
    status text DEFAULT 'running' NOT NULL, -- 'running', 'success', 'error', 'warning'

    -- Compteurs de réconciliation
    events_received integer DEFAULT 0,
    created_count integer DEFAULT 0,
    updated_count integer DEFAULT 0,
    cancelled_count integer DEFAULT 0,
    unchanged_count integer DEFAULT 0,

    -- Détail d'erreur
    error_message text
);

-- RLS : accès via le chalet propriétaire
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sync_runs' AND policyname = 'Users can view own sync_runs'
    ) THEN
        CREATE POLICY "Users can view own sync_runs"
            ON sync_runs FOR SELECT
            USING (calendar_source_id IN (
                SELECT cs.id FROM calendar_sources cs
                JOIN chalets c ON cs.chalet_id = c.id
                WHERE c.user_id = auth.uid()
            ));
    END IF;
END $$;

-- Permettre au backend de tout faire
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sync_runs' AND policyname = 'Allow service operations on sync_runs'
    ) THEN
        CREATE POLICY "Allow service operations on sync_runs"
            ON sync_runs FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Index pour les requêtes fréquentes (dernière sync par source)
CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started
    ON sync_runs (calendar_source_id, started_at DESC);
