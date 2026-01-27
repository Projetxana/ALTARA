import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GUIDE_CONTENT as INITIAL_CONTENT, RESORT_NAME as INITIAL_NAME, RESORT_ADDRESS as INITIAL_ADDRESS, HOME_IMAGE as INITIAL_IMAGE } from '../features/traveler-guide/data/guideData';

const GuideContext = createContext();

export const useGuide = () => useContext(GuideContext);

export const GuideProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [guideData, setGuideData] = useState({
        resortName: INITIAL_NAME,
        resortAddress: INITIAL_ADDRESS,
        homeImage: INITIAL_IMAGE,
        content: INITIAL_CONTENT,
        sectionOrder: Object.keys(INITIAL_CONTENT) // Initialize default order
    });

    const [guideId, setGuideId] = useState(1); // Default to 1, but update on fetch

    // Fetch from Supabase on Mount
    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const { data, error } = await supabase
                    .from('guide_config')
                    .select('*')
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error("Error fetching guide:", error);
                }

                if (data) {
                    setGuideId(data.id); // Capture the actual ID
                    // Calculate content and order BEFORE setting state
                    const content = data.content && Object.keys(data.content).length > 0 ? data.content : prev.content;
                    let sectionOrder = data.section_order || Object.keys(content);

                    // INJECT DEFAULT SECTIONS IF MISSING (Migration)
                    if (!content['getting-there']) {
                        content['getting-there'] = {
                            title: "Se rendre au chalet",
                            icon: 'map',
                            layout: 'map', // Explicit map layout
                            image: '/map_chalet_v2.jpg', // NEW IMAGE
                            items: [
                                { title: "Adresse", text: "5135 rue de la Tortille, St-Adèle", desc: "Utilisez Google Maps pour la précision." },
                                { title: "Code d'accès", text: "Envoyé par courriel", desc: "Le code est valide dès 16h00." }
                            ]
                        };
                        // Add to start of order
                        sectionOrder = ['getting-there', ...sectionOrder.filter(id => id !== 'getting-there')];
                        // AUTO-MIGRATE OLD IMAGE
                        content['getting-there'].image = '/map_chalet_v2.jpg';
                    }

                    // FORCE MIGRATE WIFI TO NEW LAYOUT & CONTENT
                    if (content['wifi']) {
                        content['wifi'].layout = 'wifi-card';
                        content['wifi'].items = [
                            {
                                title: "STARLINK",
                                text: "mot de passe:\nAYANA5135"
                            }
                        ];
                    }

                    // FORCE MIGRATE RESTAURANTS TO HAVE DETAILS (Mock Data Refresh)
                    if (content['restaurants'] && content['restaurants'].items) {
                        content['restaurants'].items = content['restaurants'].items.map(item => ({
                            ...item,
                            details: item.details || "Détails et menu complets disponibles sur place ou par téléphone."
                        }));
                    }


                    // FORCE MIGRATE INFORMATION TO LIST LAYOUT (Full width, no icon)
                    if (content['information']) {
                        content['information'].layout = 'list';
                        if (content['information'].items) {
                            content['information'].items = content['information'].items.map(item => ({
                                ...item,
                                details: item.details || `Détails supplémentaires pour ${item.title || 'cet item'}.`
                            }));
                        }
                    }

                    // FORCE MIGRATE CHECK-IN (Remove Icons)
                    if (content['checkin']) {
                        content['checkin'].items = content['checkin'].items.map(item => ({
                            ...item,
                            icon: 'none'
                        }));
                    }
                    if (content['emergency']) {
                        content['emergency'].items = content['emergency'].items.map(item => ({
                            ...item,
                            icon: 'none'
                        }));
                    }

                    // ENSURE VISIBILITY PROPERTY EXISTS
                    Object.keys(content).forEach(key => {
                        if (content[key].isVisible === undefined) {
                            content[key].isVisible = true; // Default to visible
                        }
                    });

                    setGuideData(prev => ({
                        ...prev,
                        resortName: data.resort_name || prev.resortName,
                        resortAddress: data.resort_address || prev.resortAddress,
                        homeImage: data.home_image || prev.homeImage,
                        content: content,
                        sectionOrder: sectionOrder
                    }));
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuide();
    }, []);

    // Save explicit changes to Database
    const saveToDatabase = async () => {
        try {
            // Use UPDATE with the captured ID
            const { error } = await supabase
                .from('guide_config')
                .update({
                    resort_name: guideData.resortName,
                    resort_address: guideData.resortAddress,
                    home_image: guideData.homeImage,
                    content: guideData.content,
                    section_order: guideData.sectionOrder, // Save order
                    updated_at: new Date().toISOString()
                })
                .eq('id', guideId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Error saving guide:", error);
            return { success: false, error };
        }
    };

    const updateSection = (sectionId, newSectionData) => {
        setGuideData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [sectionId]: newSectionData
            }
        }));
    };

    const addSection = (sectionId, title, iconName = 'info') => {
        setGuideData(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [sectionId]: {
                    title: title,
                    icon: iconName,
                    layout: 'list', // Default layout
                    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                    items: []
                }
            },
            sectionOrder: [...prev.sectionOrder, sectionId] // Append to order
        }));
    };

    const deleteSection = (sectionId) => {
        setGuideData(prev => {
            const newContent = { ...prev.content };
            delete newContent[sectionId];
            return {
                ...prev,
                content: newContent,
                sectionOrder: prev.sectionOrder.filter(id => id !== sectionId) // Remove from order
            };
        });
    };

    const reorderSections = (newOrder) => {
        setGuideData(prev => ({
            ...prev,
            sectionOrder: newOrder
        }));
    };

    const updateResortInfo = (field, value) => {
        setGuideData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetToDefaults = () => {
        setGuideData({
            resortName: INITIAL_NAME,
            resortAddress: INITIAL_ADDRESS,
            homeImage: INITIAL_IMAGE,
            content: INITIAL_CONTENT
        });
    };

    return (
        <GuideContext.Provider value={{
            guideData,
            isLoading,
            updateSection,
            addSection,
            deleteSection,
            updateResortInfo,
            resetToDefaults,
            reorderSections, // Exposed
            saveToDatabase,
            uploadImage: async (file) => {
                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                const { data, error } = await supabase.storage
                    .from('guide-images')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('guide-images')
                    .getPublicUrl(fileName);

                return publicUrl;
            }
        }}>
            {children}
        </GuideContext.Provider>
    );
};
