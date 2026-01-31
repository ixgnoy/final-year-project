"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Vehicle {
    id: string;
    plate_number: string;
    make_model: string;
    color: string;
    owner_name?: string;
    created_at: string;
}

export default function Analytics() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) console.error('Error fetching vehicles:', error);
            else setVehicles(data || []);
            setLoading(false);
        };

        fetchVehicles();
    }, []);

    // Analytics Calculations
    const getColorStats = () => {
        const colorCounts: { [key: string]: number } = {};
        vehicles.forEach(v => {
            colorCounts[v.color] = (colorCounts[v.color] || 0) + 1;
        });
        return Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    };

    const getMakeStats = () => {
        const makeCounts: { [key: string]: number } = {};
        vehicles.forEach(v => {
            const make = v.make_model.split(' ')[0];
            makeCounts[make] = (makeCounts[make] || 0) + 1;
        });
        return Object.entries(makeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    };

    const getRecentRegistrations = () => {
        const now = new Date();
        const periods = [
            { label: 'Today', count: 0 },
            { label: 'This Week', count: 0 },
            { label: 'This Month', count: 0 },
        ];

        vehicles.forEach(v => {
            const date = new Date(v.created_at);
            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) periods[0].count++;
            if (diffDays < 7) periods[1].count++;
            if (diffDays < 30) periods[2].count++;
        });

        return periods;
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
    };

    const colorMap: { [key: string]: string } = {
        'Red': '#ef4444', 'Yellow': '#eab308', 'White': '#f8fafc', 'Tan': '#d2b48c',
        'Beige': '#f5f5dc', 'Silver': '#c0c0c0', 'Purple': '#a855f7', 'Pink': '#ec4899',
        'Orange': '#f97316', 'Green': '#22c55e', 'Grey': '#6b7280', 'Brown': '#92400e',
        'Gold': '#fbbf24', 'Blue': '#3b82f6', 'Black': '#1f2937'
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <p style={{ color: '#64748b' }}>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>Fleet Analytics</h1>
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#ef4444',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
                <p style={{ color: '#64748b', fontSize: '16px' }}>Insights and statistics about your vehicle fleet</p>
            </section>

            {/* Quick Stats Row */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Overview</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {[
                        { icon: '🚗', label: 'Total Vehicles', value: vehicles.length, color: '#3b82f6' },
                        { icon: '🎨', label: 'Unique Colors', value: new Set(vehicles.map(v => v.color)).size, color: '#a855f7' },
                        { icon: '🏭', label: 'Unique Makes', value: new Set(vehicles.map(v => v.make_model.split(' ')[0])).size, color: '#22c55e' },
                        { icon: '👤', label: 'With Owners', value: vehicles.filter(v => v.owner_name).length, color: '#f97316' },
                    ].map((stat, index) => (
                        <div key={index} style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 4px 14px ${stat.color}40`,
                                    fontSize: '28px'
                                }}>{stat.icon}</div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>{stat.label}</p>
                                    <p style={{ color: '#0f172a', fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Color Distribution */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Top Colors</h3>
                        <span style={{ fontSize: '24px' }}>🎨</span>
                    </div>
                    {getColorStats().length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {getColorStats().map(([color, count], index) => (
                                <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        width: '24px',
                                        color: '#94a3b8',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>#{index + 1}</span>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: colorMap[color] || '#6b7280',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        border: color === 'White' ? '1px solid #e2e8f0' : 'none',
                                    }}></div>
                                    <span style={{ flex: 1, fontWeight: '500', color: '#0f172a' }}>{color}</span>
                                    <div style={{
                                        backgroundColor: '#f1f5f9',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#64748b',
                                    }}>{count}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No data available</p>
                    )}
                </div>

                {/* Make Distribution */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Top Makes</h3>
                        <span style={{ fontSize: '24px' }}>🏭</span>
                    </div>
                    {getMakeStats().length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {getMakeStats().map(([make, count], index) => (
                                <div key={make} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        width: '24px',
                                        color: '#94a3b8',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>#{index + 1}</span>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: `linear-gradient(135deg, ${['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444'][index]}, ${['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444'][index]}dd)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                    }}>🚙</div>
                                    <span style={{ flex: 1, fontWeight: '500', color: '#0f172a' }}>{make}</span>
                                    <div style={{
                                        backgroundColor: '#f1f5f9',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#64748b',
                                    }}>{count}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No data available</p>
                    )}
                </div>
            </div>

            {/* Registration Timeline */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Registration Activity</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {getRecentRegistrations().map((period, index) => (
                        <div key={index} style={cardStyle}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{period.label}</p>
                                <p style={{
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    color: period.count > 0 ? '#0f172a' : '#cbd5e1',
                                    marginBottom: '8px',
                                }}>{period.count}</p>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>vehicles registered</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Vehicles */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Recent Registrations</h2>
                    <Link
                        href="/"
                        style={{
                            color: '#ef4444',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        View All →
                    </Link>
                </div>
                {vehicles.length > 0 ? (
                    <div style={cardStyle}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {['Plate', 'Make/Model', 'Color', 'Owner', 'Registered'].map((header) => (
                                        <th key={header} style={{
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            color: '#64748b',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.slice(0, 5).map((vehicle, index) => (
                                    <tr key={vehicle.id} style={{
                                        borderBottom: index < 4 ? '1px solid #f8fafc' : 'none',
                                    }}>
                                        <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                                            {vehicle.plate_number}
                                        </td>
                                        <td style={{ padding: '16px', color: '#0f172a' }}>{vehicle.make_model}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '6px',
                                                    backgroundColor: colorMap[vehicle.color] || '#6b7280',
                                                    border: vehicle.color === 'White' ? '1px solid #e2e8f0' : 'none',
                                                }}></div>
                                                <span style={{ color: '#64748b' }}>{vehicle.color}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: vehicle.owner_name ? '#0f172a' : '#cbd5e1' }}>
                                            {vehicle.owner_name || '—'}
                                        </td>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontSize: '14px' }}>
                                            {new Date(vehicle.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <p style={{ color: '#64748b' }}>No vehicles registered yet</p>
                    </div>
                )}
            </section>
        </div>
    );
}
