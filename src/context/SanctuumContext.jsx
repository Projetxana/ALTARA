import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SanctuumContext = createContext();

export const useSanctuum = () => useContext(SanctuumContext);

export const SanctuumProvider = ({ children }) => {
    // --- AUTHENTICATION ---
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
            }
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- DATA ---
    const [chalets, setChalets] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cleaningTasks, setCleaningTasks] = useState([]);

    // --- FETCH DATA WHEN USER IS LOGGED IN ---
    useEffect(() => {
        if (!user) {
            setChalets([]); // Login required to see data
            return;
        }

        const fetchData = async () => {
            // Fetch Chalets (Cloud)
            const { data: cloudChalets, error: chaletError } = await supabase
                .from('chalets')
                .select('*')
                .order('created_at', { ascending: true });

            if (chaletError) console.error('Error fetching chalets:', chaletError);

            // MIGRATION/SYNC LOGIC: 
            // If Cloud is empty, but Local has data => Auto-migrate
            const localChalets = JSON.parse(localStorage.getItem('altara_chalets_v2') || '[]');
            let finalChalets = cloudChalets || [];

            if ((!cloudChalets || cloudChalets.length === 0) && localChalets.length > 0) {
                console.log("Auto-migrating local chalets to cloud...");
                const migrationResults = [];

                for (const c of localChalets) {
                    const { data, error } = await supabase.from('chalets').insert({
                        user_id: user.id,
                        name: c.name,
                        location: c.location,
                        base_night_price: c.baseNightPrice,
                        description: c.description,
                        image_url: c.image_url
                    }).select().single();

                    if (data) migrationResults.push(data);
                    if (error) console.error("Migration failed for chalet:", c.name, error);
                }

                if (migrationResults.length > 0) {
                    finalChalets = migrationResults;
                } else {
                    // Fallback to local if migration failed completely
                    console.warn("Migration failed. Falling back to local data.");
                    finalChalets = localChalets;
                }
            }

            // Map DB snake_case to Frontend camelCase
            const mappedChalets = finalChalets.map(c => ({
                ...c,
                baseNightPrice: c.base_night_price || c.baseNightPrice, // Handle both DB (snake) and Local (camel) source
                minStay: c.min_stay || c.minStay || 2,
                image_url: c.image_url // snake_case in both DB and Frontend usage currently
            }));

            setChalets(mappedChalets);

            // Fetch Bookings (Cloud)
            const { data: cloudBookings, error: bookingError } = await supabase
                .from('bookings')
                .select('*');

            if (bookingError) {
                console.error('Error fetching bookings:', bookingError);
            }

            // Map DB snake_case to Frontend camelCase
            // Schema from 'ical-sync' edge function: start, end, guest, color, source, external_uid
            const mappedBookings = (cloudBookings || []).map(b => ({
                id: b.id || b.external_uid, // Use external_uid if id not present
                chaletId: b.chalet_id, // If the edge function doesn't save chalet_id, this might be null. 
                // NOTE: The user's Deno code DOES NOT save chalet_id. 
                // We should fix this or handle it. For now, matching schema.
                source: b.source,
                checkInDate: b.start || b.start_date, // Support both new/old schema
                checkOutDate: b.end || b.end_date,
                guestName: b.guest || b.guest_name,
                platformId: (b.source === 'airbnb') ? 'airbnb' : 'direct',
                color: b.color,
                status: b.status || 'confirmed',
                totalRevenue: b.total_revenue || 0,
                // keep original just in case
                ...b
            }));

            setBookings(mappedBookings);

            // Fetch Cleaning Tasks
            const { data: cloudTasks, error: taskError } = await supabase
                .from('cleaning_tasks')
                .select('*');

            if (taskError) {
                console.error('Error fetching cleaning tasks:', taskError);
            }

            const mappedTasks = (cloudTasks || []).map(t => ({
                id: t.id,
                chaletId: t.chalet_id,
                bookingId: t.booking_id,
                date: t.date,
                status: t.status,
                notes: t.notes,
                autoGenerated: t.auto_generated
            }));

            setCleaningTasks(mappedTasks);
        };

        fetchData();
    }, [user]);

    // --- PERSISTENCE (LocalStorage Fallback) ---
    // Save Chalets to LocalStorage whenever they change (to keep 'connections')
    // Bookings are now in Supabase, so no need to persist to LS
    useEffect(() => {
        if (chalets.length > 0) {
            localStorage.setItem('altara_chalets_v2', JSON.stringify(chalets));
        }
    }, [chalets]);

    const [selectedChaletId, setSelectedChaletId] = useState(null);
    const currentChalet = chalets.find(c => c.id === selectedChaletId) || chalets[0] || null;

    useEffect(() => {
        if (!selectedChaletId && chalets.length > 0) {
            setSelectedChaletId(chalets[0].id);
        }
    }, [chalets, selectedChaletId]);

    const [platforms] = useState([
        { id: 'airbnb', name: 'Airbnb', color: '#ff385c' },
        { id: 'booking', name: 'Booking.com', color: '#003580' },
        { id: 'vrbo', name: 'VRBO', color: '#1e3a8a' },
        { id: 'mrchalet', name: 'Mr Chalet', color: '#ffeb3b' },
        { id: 'direct', name: 'Direct', color: '#d4af37' }
    ]);

    // Upsell Experiences
    const [experiences, setExperiences] = useState([]);

    // Rituals
    const [rituals, setRituals] = useState([
        { id: 'r1', name: 'Le Pré-accueil', trigger: 'J-7', channel: 'whatsapp', messageTemplate: 'Votre séjour approche...', active: false },
        { id: 'r2', name: 'L\'Arrivée', trigger: 'Check-in', channel: 'whatsapp', messageTemplate: 'Bienvenue chez vous.', active: false },
        { id: 'r3', name: 'Le Départ', trigger: 'Check-out', channel: 'email', messageTemplate: 'Merci de votre visite.', active: false }
    ]);

    // Actions
    const getPlatformById = (id) => platforms.find(p => p.id === id);
    const getGuestById = (id) => null; // Removed mock John Doe
    const getBookingsForChalet = (chaletId) => bookings.filter(b => b.chaletId === chaletId);

    const updateChalet = async (chaletId, updates) => {
        // 1. Optimistic Update (Local)
        setChalets(prev => prev.map(c => c.id === chaletId ? { ...c, ...updates } : c));

        // 2. Persist to Cloud
        if (user) {
            try {
                // Map camelCase updates back to snake_case for DB
                const dbUpdates = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.location !== undefined) dbUpdates.location = updates.location;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.baseNightPrice !== undefined) dbUpdates.base_night_price = updates.baseNightPrice;
                if (updates.minStay !== undefined) dbUpdates.min_stay = updates.minStay;
                if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
                if (updates.connections !== undefined) dbUpdates.connections = updates.connections;

                const { error } = await supabase
                    .from('chalets')
                    .update(dbUpdates)
                    .eq('id', chaletId);

                if (error) {
                    console.error("Error saving chalet update to Supabase:", error);
                } else {
                    console.log("Chalet updated in Supabase!");
                }
            } catch (err) {
                console.error("Persist request failed:", err);
            }
        }
    };

    const updateChaletConnections = (chaletId, connections) => updateChalet(chaletId, { connections });

    const createBooking = (bookingData) => {
        // Mock for now, should be Supabase insert
        const newBooking = {
            id: `b-${Date.now()}`,
            chaletId: bookingData.chaletId,
            platformId: 'direct',
            guestName: bookingData.guestName,
            status: 'confirmed',
        };
        setBookings(prev => [...prev, newBooking]);
        return newBooking;
    };

    const importBookings = (newBookings) => {
        setBookings(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const uniqueNew = newBookings.filter(b => !existingIds.has(b.id));
            return [...prev, ...uniqueNew];
        });
    };

    const toggleRitual = (ritualId) => {
        setRituals(prev => prev.map(r => r.id === ritualId ? { ...r, active: !r.active } : r));
    };

    // --- ADD CHALET (CLOUD) ---
    const addChalet = async (chaletData) => {
        if (!user) return;

        try {
            const { data, error } = await supabase.from('chalets').insert({
                user_id: user.id,
                name: chaletData.name,
                location: chaletData.location,
                base_night_price: chaletData.baseNightPrice,
                description: chaletData.description
            }).select().single();

            if (error) throw error;
            setChalets(prev => [...prev, data]);
            if (chalets.length === 0) setSelectedChaletId(data.id);
        } catch (e) {
            console.error("Error creating chalet:", e);
            alert("Error saving to cloud: " + e.message);
        }
    };

    // --- DELETE CHALET ---
    const deleteChalet = async (chaletId) => {
        if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

        // 1. Optimistic Update
        setChalets(prev => prev.filter(c => c.id !== chaletId));
        if (selectedChaletId === chaletId) setSelectedChaletId(null);

        // 2. Persist to Cloud
        if (user) {
            const { error } = await supabase
                .from('chalets')
                .delete()
                .eq('id', chaletId);

            if (error) {
                console.error("Error deleting chalet:", error);
                alert("Error deleting from cloud: " + error.message);
                // Revert if needed, but for now we assume success or refresh
            }
        }
    };

    // --- CURRENCY ---
    const [currency, setCurrency] = useState(() => localStorage.getItem('altara_currency') || 'CAD');
    useEffect(() => localStorage.setItem('altara_currency', currency), [currency]);

    const formatPrice = (amount) => {
        return new Intl.NumberFormat(window.navigator.language || 'en-CA', {
            style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <SanctuumContext.Provider value={{
            user,
            authLoading, // Expose loading
            chalets,
            platforms,
            experiences,
            bookings,
            cleaningTasks,
            toggleCleaningTaskStatus,
            rituals,
            currentChalet,
            selectedChaletId,
            currency,
            setCurrency,
            formatPrice,
            setSelectedChaletId,
            getPlatformById,
            getGuestById,
            getBookingsForChalet,
            updateChalet,
            updateChaletConnections,
            createBooking,
            importBookings,
            toggleRitual,
            addChalet,
            deleteChalet
        }}>
            {children}
        </SanctuumContext.Provider>
    );
};
