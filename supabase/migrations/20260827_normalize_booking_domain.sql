-- ALTARA Booking Domain V1
-- Non-destructive normalization of the existing public.booking table.

ALTER TABLE public.booking
    ADD COLUMN IF NOT EXISTS booking_channel text,
    ADD COLUMN IF NOT EXISTS origin text,
    ADD COLUMN IF NOT EXISTS guest_email text,
    ADD COLUMN IF NOT EXISTS guest_phone text,
    ADD COLUMN IF NOT EXISTS guest_note text,
    ADD COLUMN IF NOT EXISTS currency text DEFAULT 'CAD';

-- Normalize known historical rows without overwriting existing values.
UPDATE public.booking
SET booking_channel = CASE
    WHEN booking_channel IS NOT NULL THEN booking_channel
    WHEN lower(coalesce(source, '')) IN ('airbnb', 'booking', 'vrbo') THEN 'ical'
    WHEN lower(coalesce(source, '')) = 'direct' THEN 'altara'
    ELSE 'other'
END
WHERE booking_channel IS NULL;

UPDATE public.booking
SET origin = CASE
    WHEN origin IS NOT NULL THEN origin
    WHEN lower(coalesce(source, '')) IN ('airbnb', 'booking', 'vrbo')
        THEN lower(source)
    WHEN lower(coalesce(source, '')) = 'direct'
        THEN 'altara'
    ELSE 'unknown'
END
WHERE origin IS NULL;

UPDATE public.booking
SET currency = 'CAD'
WHERE currency IS NULL OR currency = '';

-- Constraints are deliberately permissive enough for future channels.
ALTER TABLE public.booking
    DROP CONSTRAINT IF EXISTS booking_booking_channel_check;

ALTER TABLE public.booking
    ADD CONSTRAINT booking_booking_channel_check
    CHECK (
        booking_channel IS NULL
        OR booking_channel IN (
            'altara',
            'website',
            'ical',
            'api',
            'other'
        )
    );

CREATE INDEX IF NOT EXISTS idx_booking_chalet_dates
ON public.booking (chalet_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_booking_chalet_status
ON public.booking (chalet_id, status);

CREATE INDEX IF NOT EXISTS idx_booking_channel
ON public.booking (booking_channel);

CREATE INDEX IF NOT EXISTS idx_booking_origin
ON public.booking (origin);
