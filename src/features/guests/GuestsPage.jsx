import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';

const GuestsPage = () => {
    const { t } = useLanguage();
    const { bookings } = useSanctuum();

    // Derive unique guests from bookings
    // (In a real app, guests would be a separate table, but this works for now based on context)
    const guests = Array.from(new Set(bookings.map(b => b.guestName)))
        .map((name, index) => {
            const booking = bookings.find(b => b.guestName === name);
            return {
                id: index,
                name: name || "Unknown Guest",
                email: booking?.email || "", // Bookings in context might need email field
                phone: "",
                lastStay: "N/A",
                totalStays: bookings.filter(b => b.guestName === name).length
            };
        });

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Guest Management</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage your guest profiles and history.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Users size={18} /> Add Guest
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search guests..."
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff'
                            }}
                        />
                    </div>
                </div>

                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Contact</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>History</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.map(guest => (
                                <tr key={guest.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #334155, #475569)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                                {guest.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{guest.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} color="var(--color-text-muted)" /> {guest.email}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} color="var(--color-text-muted)" /> {guest.phone}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            <div>{guest.totalStays} stays</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Last: {guest.lastStay}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuestsPage;
