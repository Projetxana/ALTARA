-- ALTARA Rates V1
-- Canonical pricing rules per property.

CREATE TABLE IF NOT EXISTS public.rate_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    chalet_id uuid NOT NULL
        REFERENCES public.chalets(id)
        ON DELETE CASCADE,

    name text NOT NULL,

    rule_type text NOT NULL DEFAULT 'seasonal'
        CHECK (rule_type IN ('base', 'seasonal', 'special', 'manual')),

    start_date date,
    end_date date,

    month_of_year integer
        CHECK (
            month_of_year IS NULL
            OR month_of_year BETWEEN 1 AND 12
        ),

    nightly_rate numeric(10,2) NOT NULL
        CHECK (nightly_rate >= 0),

    weekend_rate numeric(10,2)
        CHECK (weekend_rate IS NULL OR weekend_rate >= 0),

    min_stay integer NOT NULL DEFAULT 1
        CHECK (min_stay >= 1),

    priority integer NOT NULL DEFAULT 0,

    enabled boolean NOT NULL DEFAULT true,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CHECK (
        start_date IS NULL
        OR end_date IS NULL
        OR end_date >= start_date
    )
);

CREATE INDEX IF NOT EXISTS idx_rate_rules_chalet_dates
ON public.rate_rules (chalet_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_rate_rules_chalet_enabled
ON public.rate_rules (chalet_id, enabled);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_rules_one_base_per_chalet
ON public.rate_rules (chalet_id)
WHERE rule_type = 'base';

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_rules_one_month_per_chalet
ON public.rate_rules (chalet_id, month_of_year)
WHERE rule_type = 'seasonal'
  AND month_of_year IS NOT NULL;


CREATE OR REPLACE FUNCTION public.set_rate_rules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rate_rules_updated_at
ON public.rate_rules;

CREATE TRIGGER trg_rate_rules_updated_at
BEFORE UPDATE ON public.rate_rules
FOR EACH ROW
EXECUTE FUNCTION public.set_rate_rules_updated_at();


ALTER TABLE public.rate_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read rate rules"
ON public.rate_rules;

CREATE POLICY "Owners can read rate rules"
ON public.rate_rules
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = rate_rules.chalet_id
          AND c.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Owners can insert rate rules"
ON public.rate_rules;

CREATE POLICY "Owners can insert rate rules"
ON public.rate_rules
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = rate_rules.chalet_id
          AND c.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Owners can update rate rules"
ON public.rate_rules;

CREATE POLICY "Owners can update rate rules"
ON public.rate_rules
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = rate_rules.chalet_id
          AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = rate_rules.chalet_id
          AND c.user_id = auth.uid()
    )
);


DROP POLICY IF EXISTS "Owners can delete rate rules"
ON public.rate_rules;

CREATE POLICY "Owners can delete rate rules"
ON public.rate_rules
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = rate_rules.chalet_id
          AND c.user_id = auth.uid()
    )
);
