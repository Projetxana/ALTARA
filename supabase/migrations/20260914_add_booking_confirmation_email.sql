ALTER TABLE public.booking
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

COMMENT ON COLUMN public.booking.confirmation_email_sent_at
IS 'Successful booking confirmation email timestamp after payment.';
