import React from 'react';
import {
    Key, Wifi, MapPin, Utensils, Wine, Info, BriefcaseMedical,
    Sunset, LogOut, Car, Sun, Music, Coffee, ShoppingBag,
    Camera, Heart, Star, Anchor, Mountain, Snowflake,
    Trash2, Phone, Flame, Stethoscope
} from 'lucide-react';

export const ICON_OPTIONS = [
    { value: 'info', label: 'Info', component: Info },
    { value: 'key', label: 'Check-in/Key', component: Key },
    { value: 'wifi', label: 'Wifi', component: Wifi },
    { value: 'car', label: 'Transport', component: Car },
    { value: 'utensils', label: 'Food', component: Utensils },
    { value: 'wine', label: 'Drinks/Bar', component: Wine },
    { value: 'medical', label: 'Medical/Kit', component: BriefcaseMedical },
    { value: 'hospital', label: 'Hospital', component: Stethoscope },
    { value: 'fire', label: 'Fire', component: Flame },
    { value: 'phone', label: 'Phone', component: Phone },
    { value: 'trash', label: 'Trash', component: Trash2 },
    { value: 'map', label: 'Map/Places', component: MapPin },
    { value: 'logout', label: 'Check-out', component: LogOut },
    { value: 'sun', label: 'Summer/Sun', component: Sun },
    { value: 'snow', label: 'Winter/Snow', component: Snowflake },
    { value: 'mountain', label: 'Mountain', component: Mountain },
    { value: 'coffee', label: 'Coffee', component: Coffee },
    { value: 'shopping', label: 'Shopping', component: ShoppingBag },
    { value: 'music', label: 'Music/Party', component: Music },
    { value: 'heart', label: 'Wellness', component: Heart },
    { value: 'star', label: 'Special', component: Star },
    { value: 'camera', label: 'Activities', component: Camera },
];

export const DynamicIcon = ({ name, size = 18, className = '' }) => {
    const iconDef = ICON_OPTIONS.find(i => i.value === name) || ICON_OPTIONS[0]; // Default to Info
    const IconComponent = iconDef.component;
    return <IconComponent size={size} className={className} />;
};
