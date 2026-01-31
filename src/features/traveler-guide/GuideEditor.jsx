import React, { useState } from 'react';
import { useGuide } from '../../context/GuideContext';
import { Save, RotateCcw, Plus, Trash2, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { ICON_OPTIONS, DynamicIcon } from './utils/iconMap';

const GuideEditor = () => {
    const { guideData, updateSection, addSection, deleteSection, updateResortInfo, resetToDefaults, saveToDatabase, uploadImage, reorderSections } = useGuide();
    const [activeSection, setActiveSection] = useState('checkin');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('info');

    const sections = guideData.sectionOrder || Object.keys(guideData.content);

    const handleMoveSection = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newOrder = [...sections];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

        reorderSections(newOrder);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { success, error } = await saveToDatabase();
        setIsSaving(false);

        if (success) {
            alert("Changes saved to Database (Live)!");
        } else {
            console.error(error);
            alert("Failed to save. Error: " + (error?.message || "Unknown"));
        }
    };

    const handleImageUpload = async (e, targetField = 'image', itemIndex = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const publicUrl = await uploadImage(file);

            if (itemIndex !== null) {
                // Updating an item's image (thumb)
                const newItems = [...guideData.content[activeSection].items];
                newItems[itemIndex].thumb = publicUrl;
                updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
            } else if (targetField === 'homeImage') {
                // Updating Global Home Image
                updateResortInfo('homeImage', publicUrl);
            } else {
                // Updating section cover image
                const newContent = { ...guideData.content[activeSection], [targetField]: publicUrl };
                updateSection(activeSection, newContent);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed! Did you create the 'guide-images' bucket in Supabase?");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddSection = (e) => {
        e.preventDefault();
        if (!newSectionTitle.trim()) return;

        const id = newSectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (sections.includes(id)) {
            alert("Section already exists!");
            return;
        }

        addSection(id, newSectionTitle, selectedIcon);
        setNewSectionTitle('');
        setActiveSection(id);
    };

    const handleDeleteSection = (id) => {
        if (window.confirm(`Are you sure you want to delete the section "${id}"?`)) {
            deleteSection(id);
            if (activeSection === id) {
                setActiveSection(sections[0] || '');
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Guide Editor</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => window.open('/guide', '_blank')} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        👁️ Preview
                    </button>
                    <button onClick={resetToDefaults} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <RotateCcw size={18} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: isSaving ? 0.7 : 1 }}>
                        <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>

                {/* SETTINGS SIDEBAR */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>General Info</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Resort Name</label>
                        <input
                            type="text"
                            value={guideData.resortName}
                            onChange={(e) => updateResortInfo('resortName', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Resort Address</label>
                        <input
                            type="text"
                            value={guideData.resortAddress}
                            onChange={(e) => updateResortInfo('resortAddress', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Main Photo (URL)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={guideData.homeImage}
                                    onChange={(e) => updateResortInfo('homeImage', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.8rem' }}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: '0 0.5rem', border: '1px solid var(--color-border)' }}>
                                    <Upload size={14} />
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'homeImage')} style={{ display: 'none' }} />
                                </label>
                            </div>
                            {guideData.homeImage && (
                                <div style={{ height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                    <img src={guideData.homeImage} alt="Home" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '2rem', color: 'var(--color-primary)' }}>Sections</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {sections.map((section, idx) => (
                            <div key={section} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <button
                                        onClick={() => handleMoveSection(idx, 'up')}
                                        disabled={idx === 0}
                                        style={{ background: 'none', border: 'none', color: idx === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)', cursor: idx === 0 ? 'default' : 'pointer', padding: 0 }}
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveSection(idx, 'down')}
                                        disabled={idx === sections.length - 1}
                                        style={{ background: 'none', border: 'none', color: idx === sections.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)', cursor: idx === sections.length - 1 ? 'default' : 'pointer', padding: 0 }}
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setActiveSection(section)}
                                    style={{
                                        flex: 1,
                                        textAlign: 'left',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: activeSection === section ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: activeSection === section ? '#fff' : 'var(--color-text-muted)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}
                                >
                                    <DynamicIcon name={guideData.content[section]?.icon || 'info'} size={16} />
                                    {/* Show Title if available, else fallback to ID */}
                                    {guideData.content[section]?.title || section}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ADD NEW SECTION */}
                    <form onSubmit={handleAddSection} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="New Section..."
                                value={newSectionTitle}
                                onChange={e => setNewSectionTitle(e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                            />
                            <button type="submit" style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000' }}>
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* ICON PICKER FOR NEW SECTION */}
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {ICON_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSelectedIcon(opt.value)}
                                    title={opt.label}
                                    style={{
                                        minWidth: '30px', height: '30px', borderRadius: '50%',
                                        border: selectedIcon === opt.value ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: selectedIcon === opt.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: selectedIcon === opt.value ? 'var(--color-primary)' : '#fff',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <opt.component size={14} />
                                </button>
                            ))}
                        </div>
                    </form>
                </div>

                {/* EDITOR AREA */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    {activeSection && guideData.content[activeSection] && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', textTransform: 'capitalize', margin: 0 }}>
                                        {guideData.content[activeSection].title || activeSection}
                                    </h3>

                                    {/* ICON PICKER FOR EXISTING SECTION */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Icon:</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {ICON_OPTIONS.map(opt => {
                                                const isActive = (guideData.content[activeSection].icon || 'info') === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            const newContent = { ...guideData.content[activeSection], icon: opt.value };
                                                            updateSection(activeSection, newContent);
                                                        }}
                                                        title={opt.label}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                                            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <opt.component size={16} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                                    {/* VISIBILITY TOGGLE */}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                                        <input
                                            type="checkbox"
                                            checked={guideData.content[activeSection].isVisible !== false}
                                            onChange={(e) => {
                                                const newContent = { ...guideData.content[activeSection], isVisible: e.target.checked };
                                                updateSection(activeSection, newContent);
                                            }}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        Visible
                                    </label>

                                    <select
                                        value={guideData.content[activeSection].layout || 'list'}
                                        onChange={(e) => {
                                            const newContent = { ...guideData.content[activeSection], layout: e.target.value };
                                            updateSection(activeSection, newContent);
                                        }}
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        <option value="list">List</option>
                                        <option value="grid">Grid</option>
                                        <option value="row">Row</option>
                                        <option value="map">Map</option>
                                    </select>
                                    <button
                                        onClick={() => handleDeleteSection(activeSection)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            fontSize: '0.85rem'
                                        }}
                                        title="Delete Section"
                                    >
                                        <Trash2 size={16} /> Delete Section
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Section Title</label>
                                <input
                                    type="text"
                                    value={guideData.content[activeSection].title}
                                    onChange={(e) => {
                                        const newContent = { ...guideData.content[activeSection], title: e.target.value };
                                        updateSection(activeSection, newContent);
                                    }}
                                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Cover Image URL</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        value={guideData.content[activeSection].image}
                                        onChange={(e) => {
                                            const newContent = { ...guideData.content[activeSection], image: e.target.value };
                                            updateSection(activeSection, newContent);
                                        }}
                                        style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                                    />
                                    <label style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.5rem', padding: '0 1rem',
                                        background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer', border: '1px solid var(--color-border)',
                                        opacity: isUploading ? 0.5 : 1
                                    }}>
                                        <Upload size={16} />
                                        <span style={{ fontSize: '0.9rem' }}>{isUploading ? '...' : 'Upload'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e)}
                                            style={{ display: 'none' }}
                                            disabled={isUploading}
                                        />
                                    </label>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <img src={guideData.content[activeSection].image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Items</h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {guideData.content[activeSection].items.map((item, index) => (
                                    <div key={index} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Title / Label</label>
                                                <input
                                                    type="text"
                                                    value={item.title || item.label || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...guideData.content[activeSection].items];
                                                        // Handle mixed naming (title vs label) based on layout
                                                        if (item.title !== undefined) newItems[index].title = e.target.value;
                                                        if (item.label !== undefined) newItems[index].label = e.target.value;
                                                        updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                    }}
                                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Value / Right Text</label>
                                                <input
                                                    type="text"
                                                    value={item.text || item.right || item.contact || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...guideData.content[activeSection].items];
                                                        // Handle mixed naming
                                                        if (item.text !== undefined) newItems[index].text = e.target.value;
                                                        if (item.right !== undefined) newItems[index].right = e.target.value;
                                                        if (item.contact !== undefined) newItems[index].contact = e.target.value;
                                                        updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                    }}
                                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GPS Link (Map Button)</label>
                                            <input
                                                type="text"
                                                value={item.gpsLink || ''}
                                                onChange={(e) => {
                                                    const newItems = [...guideData.content[activeSection].items];
                                                    newItems[index].gpsLink = e.target.value;
                                                    updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                }}
                                                placeholder="https://maps.google.com/..."
                                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Description</label>
                                            <input
                                                type="text"
                                                value={item.desc || ''}
                                                onChange={(e) => {
                                                    const newItems = [...guideData.content[activeSection].items];
                                                    newItems[index].desc = e.target.value;
                                                    updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                }}
                                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff' }}
                                            />
                                        </div>

                                        {/* Collapsible Details Content */}
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Detailed Content (Collapsible)</label>
                                            <textarea
                                                rows="3"
                                                value={item.details || ''}
                                                onChange={(e) => {
                                                    const newItems = [...guideData.content[activeSection].items];
                                                    newItems[index].details = e.target.value;
                                                    updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                }}
                                                placeholder="Content shown when expanding this item (optional)..."
                                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
                                            />
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => {
                                                    const newItems = guideData.content[activeSection].items.filter((_, i) => i !== index);
                                                    updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                                }}
                                                style={{ fontSize: '0.8rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            >
                                                Remove Item
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    className="btn-primary"
                                    style={{ width: 'fit-content', opacity: 0.7 }}
                                    onClick={() => {
                                        // Clone the last item format to create a new one, or generic default
                                        const template = guideData.content[activeSection].items[0] || { title: "New Item", text: "Details" };
                                        const newItem = { ...template };
                                        // Clear values
                                        Object.keys(newItem).forEach(k => {
                                            if (typeof newItem[k] === 'string' && k !== 'icon') newItem[k] = "New content";
                                        });

                                        const newItems = [...guideData.content[activeSection].items, newItem];
                                        updateSection(activeSection, { ...guideData.content[activeSection], items: newItems });
                                    }}
                                >
                                    + Add Item
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default GuideEditor;
