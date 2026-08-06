-- ============================================================================
-- ALTARA Phase 1 — Migration 003: booking columns safety net
-- S'assure que les colonnes utilisées par le code existent bien
-- NON DESTRUCTIVE — IF NOT EXISTS partout, aucune donnée supprimée
-- ============================================================================

-- Colonnes de dates alternatives (le code utilise start_date/end_date,
-- le schéma original a check_in/check_out — on garde les deux)
ALTER TABLE booking ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS end_date date;

-- Source de la réservation (airbnb, booking, vrbo, direct, etc.)
ALTER TABLE booking ADD COLUMN IF NOT EXISTS source text DEFAULT 'direct';

-- Couleur d'affichage calendrier
ALTER TABLE booking ADD COLUMN IF NOT EXISTS color text;

-- Identifiant externe iCal (UID)
ALTER TABLE booking ADD COLUMN IF NOT EXISTS external_uid text;

-- ============================================================================
-- CONTRAINTE UNIQUE COMPOSITE : (chalet_id, source, external_uid)
-- 
-- Un même external_uid Airbnb ne doit être unique que DANS un chalet+source.
-- Deux chalets différents peuvent recevoir le même UID (ex: blocked periods).
-- ============================================================================

-- 1. Supprimer l'ancien index simple s'il existe (créé par erreur auparavant)
DROP INDEX IF EXISTS idx_booking_external_uid;

-- 2. Créer le nouvel index composite partiel
--    Le WHERE filtre les NULL car external_uid est nullable (réservations directes)
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_chalet_source_uid
    ON booking (chalet_id, source, external_uid)
    WHERE external_uid IS NOT NULL;
