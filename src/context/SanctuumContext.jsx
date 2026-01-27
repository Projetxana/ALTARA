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
            // If Cloud is empty, but Local has data => OFFER SYNC?
            // For now, let's auto-upload if cloud is empty to verify the feature immediately.
            const localChalets = JSON.parse(localStorage.getItem('altara_chalets_v2') || '[]');

            if ((!cloudChalets || cloudChalets.length === 0) && localChalets.length > 0) {
                console.log("Auto-migrating local chalets to cloud...");
                for (const c of localChalets) {
                    await supabase.from('chalets').insert({
                        user_id: user.id,
                        name: c.name,
                        location: c.location,
                        base_night_price: c.baseNightPrice, // Note key mapping
                        description: c.description
                    });
                }
                // Refetch after insertion
                const { data: refetched } = await supabase.from('chalets').select('*');
                setChalets(refetched || []);
            } else {
                setChalets(cloudChalets || []);
            }

            // Fetch Bookings (Cloud) (Not implemented locally before, but good to have)
        };

        fetchData();
    }, [user]);

    // --- PERSISTENCE (LocalStorage Fallback) ---
    // Save Chalets to LocalStorage whenever they change (to keep 'connections')
    useEffect(() => {
        if (chalets.length > 0) {
            localStorage.setItem('altara_chalets_v2', JSON.stringify(chalets));
        }
    }, [chalets]);

    // Load/Save Bookings
    useEffect(() => {
        const savedBookings = localStorage.getItem('altara_bookings');
        if (savedBookings) {
            try {
                setBookings(JSON.parse(savedBookings));
            } catch (e) { console.error("Failed to load bookings", e); }
        }
    }, []);

    useEffect(() => {
        if (bookings.length > 0) {
            localStorage.setItem('altara_bookings', JSON.stringify(bookings));
        }
    }, [bookings]);


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
        { id: 'expedia', name: 'Expedia', color: '#ffeb3b' },
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

    const updateChaletConnections = (chaletId, connections) => {
        // Implement Cloud Update - TODO: Update Supabase if column exists
        // For now, LocalStorage (via useEffect) handles persistence
        setChalets(prev => prev.map(c => c.id === chaletId ? { ...c, connections } : c));
    };

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
            updateChaletConnections,
            createBooking,
            importBookings,
            toggleRitual,
            addChalet
        }}>
            {children}
        </SanctuumContext.Provider>
    );
};
