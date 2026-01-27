/*
 * Traveler Guide Content Configuration
 * Edit this file to update the app content.
 */

import React from 'react';
import {
    Key, Wifi, MapPin, Utensils, Wine, Info, BriefcaseMedical,
    Car, Phone, Trash2, Coffee, Flame, Stethoscope, Sun, LogOut
} from 'lucide-react';

export const RESORT_NAME = "CHALET ST-ADÈLE";
export const RESORT_ADDRESS = "123 Chemin du Sommet, QC";
export const HOME_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

export const NAV_ICONS = [
    { id: 'wifi', icon: <Wifi size={18} />, label: "Wifi" },
    { id: 'checkin', icon: <Key size={18} />, label: "Check In" },
    { id: 'transport', icon: <Car size={18} />, label: "Transport" },
    { id: 'restaurants', icon: <Utensils size={18} />, label: "Dining" },
    { id: 'bars', icon: <Wine size={18} />, label: "Bars" },
    { id: 'emergency', icon: <BriefcaseMedical size={18} />, label: "Urgence" },
    { id: 'information', icon: <Info size={18} />, label: "Info" },
    { id: 'places', icon: <MapPin size={18} />, label: "Map" }
];

export const GUIDE_CONTENT = {
    restaurants: {
        title: "Restaurants",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "list",
        items: [
            {
                id: 1,
                title: "Sushi Shop",
                desc: "Fresh sushi daily. Delivery available.",
                thumb: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                contact: "+1 555 7890",
                details: "Menu varié comprenant sushis, makis et sashimis fraîchement préparés.\nLivraison rapide en 30-45 minutes.\nOuvert tous les jours de 11h à 22h."
            },
            {
                id: 2,
                title: "Lomem Food",
                desc: "Best local noodles.",
                thumb: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                contact: "+1 555 2345",
                details: "Spécialités de nouilles asiatiques authentiques.\nBouillons faits maison mijotés pendant 12 heures.\nOptions végétariennes et sans gluten disponibles.\nAmbiance décontractée."
            },
            {
                id: 3,
                title: "Yaki Burgers",
                desc: "Gourmet burgers and fries.",
                thumb: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                contact: "+1 555 9999",
                details: "Burgers gourmets avec viande de bœuf locale.\nFrites coupées à la main et cuites à la graisse de canard.\nLarge sélection de bières artisanales locales.\nTerrasse en été."
            }
        ]
    },
    bars: {
        title: "Bars & Clubs",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "list",
        items: [
            {
                id: 1,
                title: "Moavie Club",
                desc: "Live jazz every Friday.",
                thumb: "https://images.unsplash.com/photo-1574096079513-d82599602959?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                contact: "+1 555 1200"
            },
            {
                id: 2,
                title: "Garden Club",
                desc: "Outdoor seating.",
                thumb: "https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                contact: "Open Late"
            }
        ]
    },
    information: {
        title: "Informations",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "list",
        items: [
            { icon: 'trash', title: "Garbage Cans/Bins", text: "The garbage room is located on the ground floor.", details: "Veuillez trier vos déchets.\nLes poubelles (noires) et le recyclage (bleu) sont situés dans le local au rez-de-chaussée.\nL'accès se fait par la porte latérale." },
            { icon: 'coffee', title: "Coffee Machine", text: "Nespresso pods are available in the kitchen.", details: "La machine Nespresso Vertuo est sur le comptoir.\nQuelques capsules de bienvenue sont fournies.\nUtilisez de l'eau filtrée pour un meilleur goût." },
            { icon: 'wifi', title: "WiFi Password", text: "Network: Chalet_Guest\nPass: Vacances!", details: "Le réseau couvre tout le chalet.\nSi vous avez des problèmes de connexion, le routeur est dans le salon." },
            { icon: 'car', title: "Parking", text: "Reserved spot #42 in front of the building.", details: "Votre place de stationnement (#42) est déneigée l'hiver.\nSi vous avez une deuxième voiture, utilisez les places visiteurs (V) près de l'entrée." }
        ]
    },
    emergency: {
        title: "Emergency",
        image: "https://images.unsplash.com/photo-1588611910609-0d3a778893d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "row",
        items: [
            { icon: 'phone', label: "Emergency Contacts", right: "Police: 911" },
            { icon: 'fire', label: "Fire Extinguisher", right: "Under Sink" },
            { icon: 'medical', label: "First Aid Kit", right: "Bathroom Cabinet" },
            { icon: 'hospital', label: "Hospital", right: "15 mins away" }
        ]
    },
    checkin: {
        title: "Check In",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "row",
        items: [
            { icon: 'key', label: "Door Code", right: "1234 #" },
            { icon: 'sun', label: "Check-in Time", right: "4:00 PM" },
            { icon: 'logout', label: "Check-out Time", right: "11:00 AM" }
        ]
    },
    wifi: {
        title: "Wifi",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        layout: "wifi-card",
        items: [
            { title: "STARLINK", text: "mot de passe:\nAYANA5135" }
        ]
    }
};
