DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'booking'
    ) THEN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE public.booking;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'calendar_blocks'
    ) THEN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE public.calendar_blocks;
    END IF;
END
$$;
