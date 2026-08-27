-- ALTARA Booking Domain V2.1
-- Separate calendar blocks from real bookings
-- and add payment lifecycle fields to bookings.

-- ============================================================
-- BOOKINGS: PAYMENT STATE
-- ============================================================

ALTER TABLE public.booking
    ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
    ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_provider text,
    ADD COLUMN IF NOT EXISTS payment_reference text;

UPDATE public.booking
SET payment_status = 'unpaid'
WHERE payment_status IS NULL OR payment_status = '';

UPDATE public.booking
SET amount_paid = 0
WHERE amount_paid IS NULL;

ALTER TABLE public.booking
    DROP CONSTRAINT IF EXISTS booking_payment_status_check;

ALTER TABLE public.booking
    ADD CONSTRAINT booking_payment_status_check
    CHECK (
        payment_status IN (
            'unpaid',
            'payment_pending',
            'partially_paid',
            'paid',
            'refunded'
        )
    );

CREATE INDEX IF NOT EXISTS idx_booking_payment_status
ON public.booking (payment_status);


-- ============================================================
-- CALENDAR BLOCKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.calendar_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    chalet_id uuid NOT NULL
        REFERENCES public.chalets(id)
        ON DELETE CASCADE,

    block_type text NOT NULL
        CHECK (
            block_type IN (
                'owner',
                'maintenance',
                'guest_hold',
                'other'
            )
        ),

    start_date date NOT NULL,
    end_date date NOT NULL,

    guest_name text,
    guest_email text,
    guest_phone text,

    note text,

    expires_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_chalet_dates
ON public.calendar_blocks (
    chalet_id,
    start_date,
    end_date
);

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_expires
ON public.calendar_blocks (expires_at);


-- ============================================================
-- UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_calendar_blocks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calendar_blocks_updated_at
ON public.calendar_blocks;

CREATE TRIGGER trg_calendar_blocks_updated_at
BEFORE UPDATE ON public.calendar_blocks
FOR EACH ROW
EXECUTE FUNCTION public.set_calendar_blocks_updated_at();


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.calendar_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS calendar_blocks_select_own
ON public.calendar_blocks;

CREATE POLICY calendar_blocks_select_own
ON public.calendar_blocks
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = calendar_blocks.chalet_id
          AND c.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS calendar_blocks_insert_own
ON public.calendar_blocks;

CREATE POLICY calendar_blocks_insert_own
ON public.calendar_blocks
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = calendar_blocks.chalet_id
          AND c.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS calendar_blocks_update_own
ON public.calendar_blocks;

CREATE POLICY calendar_blocks_update_own
ON public.calendar_blocks
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = calendar_blocks.chalet_id
          AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS calendar_blocks_delete_own
ON public.calendar_blocks;

CREATE POLICY calendar_blocks_delete_own
ON public.calendar_blocks
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chalets c
        WHERE c.id = calendar_blocks.chalet_id
          AND c.user_id = auth.uid()
    )
);
