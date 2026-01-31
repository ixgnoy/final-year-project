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

export default function Dashboard() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const fetchVehicles = async () => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching vehicles:', error);
        else {
            setVehicles(data || []);
            setFilteredVehicles(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        fetchVehicles();
        const channel = supabase
            .channel('realtime vehicles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
                fetchVehicles();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = vehicles.filter(vehicle =>
                vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.make_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (vehicle.owner_name && vehicle.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredVehicles(filtered);
        } else {
            setFilteredVehicles(vehicles);
        }
    }, [searchQuery, vehicles]);

    const deleteVehicle = async (id: string) => {
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) console.error('Error deleting vehicle:', error);
    };

    const getRecentVehicles = () => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return vehicles.filter(v => new Date(v.created_at) > oneDayAgo).length;
    };

    const quickActions = [
        { title: "Register Vehicle", subtitle: "Add new vehicle to fleet", gradient: "linear-gradient(135deg, #ef4444 0%, #ec4899 100%)", icon: "➕", link: "/register" },
        { title: "Fleet Analytics", subtitle: "View statistics", gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", icon: "📊", link: "/analytics" },
    ];

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* CSS Keyframes */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>

            {/* Quick Actions */}
            <section style={{ marginBottom: '48px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    opacity: mounted ? 1 : 0,
                    animation: mounted ? 'fadeInUp 0.5s ease-out' : 'none',
                }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Quick Actions</h2>
                    <button style={{
                        color: '#ef4444',
                        fontWeight: '600',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        See All →
                    </button>
                </div>
                <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    marginBottom: '24px',
                    opacity: mounted ? 1 : 0,
                    animation: mounted ? 'fadeInUp 0.5s ease-out 0.1s both' : 'none',
                }}>Manage your fleet</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.link}
                            style={{
                                display: 'block',
                                position: 'relative',
                                borderRadius: '24px',
                                height: '200px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                textDecoration: 'none',
                                opacity: mounted ? 1 : 0,
                                animation: mounted ? `scaleIn 0.5s ease-out ${0.1 + index * 0.1}s both` : 'none',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                            }}
                        >
                            {/* Gradient Background */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: action.gradient,
                            }}></div>

                            {/* Content inside card */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}>
                                {/* Icon at top */}
                                <span style={{
                                    fontSize: '40px',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                }}>{action.icon}</span>

                                {/* Text at bottom */}
                                <div>
                                    <h3 style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                        marginBottom: '6px',
                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    }}>{action.title}</h3>
                                    <p style={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '14px',
                                    }}>{action.subtitle}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Fleet Overview */}
            <section style={{ marginBottom: '48px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    opacity: mounted ? 1 : 0,
                    animation: mounted ? 'fadeInUp 0.5s ease-out 0.5s both' : 'none',
                }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>Fleet Overview</h2>
                    <span style={{ color: '#64748b', fontSize: '15px' }}>{vehicles.length} vehicles</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {[
                        { icon: '🚗', label: 'Total Fleet', value: vehicles.length, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
                        { icon: '📈', label: 'Last 24h', value: getRecentVehicles(), gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
                        { icon: '✅', label: 'Status', value: 'Online', gradient: 'linear-gradient(135deg, #10b981, #059669)', isStatus: true },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            style={{
                                ...cardStyle,
                                opacity: mounted ? 1 : 0,
                                animation: mounted ? `scaleIn 0.5s ease-out ${0.6 + index * 0.1}s both` : 'none',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: stat.gradient,
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    fontSize: '32px',
                                    flexShrink: 0,
                                }}>{stat.icon}</div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{stat.label}</p>
                                    {stat.isStatus ? (
                                        <p style={{
                                            color: '#16a34a',
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                width: '10px',
                                                height: '10px',
                                                background: '#22c55e',
                                                borderRadius: '50%',
                                                animation: 'pulse 2s infinite',
                                            }}></span>
                                            {stat.value}
                                        </p>
                                    ) : (
                                        <p style={{ color: '#0f172a', fontSize: '36px', fontWeight: 'bold' }}>{stat.value}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Search Bar */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '8px 16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                marginBottom: '40px',
                opacity: mounted ? 1 : 0,
                animation: mounted ? 'fadeInUp 0.5s ease-out 0.9s both' : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '20px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by plate, model, color, or owner..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            padding: '12px 0',
                            color: '#0f172a',
                            fontSize: '16px',
                            outline: 'none',
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                background: '#f1f5f9',
                                border: 'none',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                color: '#64748b',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* Your Fleet */}
            <section>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    opacity: mounted ? 1 : 0,
                    animation: mounted ? 'fadeInUp 0.5s ease-out 1s both' : 'none',
                }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>
                        {searchQuery ? 'Search Results' : 'Your Fleet'}
                    </h2>
                    {!searchQuery && filteredVehicles.length > 0 && (
                        <button style={{ color: '#ef4444', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
                            See All →
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ ...cardStyle, padding: '80px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
                        <p style={{ color: '#64748b' }}>Loading your fleet...</p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div style={{
                        ...cardStyle,
                        padding: '64px',
                        textAlign: 'center',
                        opacity: mounted ? 1 : 0,
                        animation: mounted ? 'scaleIn 0.5s ease-out 1.1s both' : 'none',
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                        <h3 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
                            {searchQuery ? 'No Matches Found' : 'Your Fleet is Empty'}
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>
                            {searchQuery ? 'Try adjusting your search terms' : 'Start by registering your first vehicle'}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/register"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #ef4444, #ec4899)',
                                    color: 'white',
                                    padding: '14px 28px',
                                    borderRadius: '9999px',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                ➕ Register Vehicle
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {filteredVehicles.map((vehicle, index) => (
                            <div
                                key={vehicle.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: mounted ? 1 : 0,
                                    animation: mounted ? `scaleIn 0.4s ease-out ${1.1 + index * 0.05}s both` : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Vehicle Image Area */}
                                <div style={{
                                    aspectRatio: '1',
                                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}>
                                    <span style={{ fontSize: '80px', transition: 'transform 0.3s ease' }}>🚙</span>

                                    {/* Plate Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '16px',
                                        left: '16px',
                                        right: '16px',
                                        background: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(8px)',
                                        padding: '10px 14px',
                                        borderRadius: '14px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}>
                                        <p style={{
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: '#0f172a',
                                            fontFamily: 'monospace',
                                            letterSpacing: '3px',
                                            fontSize: '16px',
                                        }}>
                                            {vehicle.plate_number}
                                        </p>
                                    </div>

                                    {/* Color Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        backgroundColor: vehicle.color.toLowerCase(),
                                    }}></div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        color: '#0f172a',
                                        marginBottom: '6px',
                                        fontSize: '17px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{vehicle.make_model}</h3>
                                    {vehicle.owner_name && (
                                        <p style={{
                                            color: '#64748b',
                                            fontSize: '14px',
                                            marginBottom: '16px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>{vehicle.owner_name}</p>
                                    )}
                                    <button
                                        onClick={() => deleteVehicle(vehicle.id)}
                                        style={{
                                            width: '100%',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            color: '#64748b',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#fef2f2';
                                            e.currentTarget.style.borderColor = '#fecaca';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.color = '#64748b';
                                        }}
                                    >
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
