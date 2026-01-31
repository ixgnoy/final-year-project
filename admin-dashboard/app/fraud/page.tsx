"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface AccessLog {
    id: number;
    timestamp: string;
    plate_number: string;
    detected_color: string;
    detected_model: string;
    plate_matched: boolean;
    color_matched: boolean;
}

export default function FraudDetection() {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [allLogs, setAllLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'fraud' | 'valid'>('fraud');

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('access_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100);

            if (error) console.error('Error fetching logs:', error);
            else {
                setAllLogs(data || []);
                filterLogs(data || [], 'fraud');
            }
            setLoading(false);
        };

        fetchLogs();

        // Real-time subscription
        const channel = supabase
            .channel('realtime access_logs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'access_logs' }, () => {
                fetchLogs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filterLogs = (data: AccessLog[], filterType: 'all' | 'fraud' | 'valid') => {
        setFilter(filterType);
        if (filterType === 'all') {
            setLogs(data);
        } else if (filterType === 'fraud') {
            // Fraud = plate not matched (potential cloned/fake plate)
            setLogs(data.filter(log => !log.plate_matched));
        } else {
            setLogs(data.filter(log => log.plate_matched));
        }
    };

    const getFraudCount = () => allLogs.filter(log => !log.plate_matched).length;
    const getValidCount = () => allLogs.filter(log => log.plate_matched).length;

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p style={{ color: '#64748b' }}>Loading fraud detection data...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>🛡️ Fraud Detection</h1>
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
                <p style={{ color: '#64748b', fontSize: '16px' }}>
                    Monitor suspicious access attempts with mismatched vehicle data
                </p>
            </section>

            {/* Stats Cards */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div
                        style={{
                            ...cardStyle,
                            cursor: 'pointer',
                            border: filter === 'fraud' ? '2px solid #ef4444' : '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                        }}
                        onClick={() => filterLogs(allLogs, 'fraud')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                            }}>🚨</div>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Suspicious Attempts</p>
                                <p style={{ color: '#ef4444', fontSize: '32px', fontWeight: 'bold' }}>{getFraudCount()}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            ...cardStyle,
                            cursor: 'pointer',
                            border: filter === 'valid' ? '2px solid #22c55e' : '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                        }}
                        onClick={() => filterLogs(allLogs, 'valid')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                            }}>✅</div>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Valid Access</p>
                                <p style={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}>{getValidCount()}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            ...cardStyle,
                            cursor: 'pointer',
                            border: filter === 'all' ? '2px solid #3b82f6' : '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                        }}
                        onClick={() => filterLogs(allLogs, 'all')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                            }}>📊</div>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Total Logs</p>
                                <p style={{ color: '#3b82f6', fontSize: '32px', fontWeight: 'bold' }}>{allLogs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Access Logs Table */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                        {filter === 'fraud' ? '🚨 Suspicious Access Attempts' :
                            filter === 'valid' ? '✅ Valid Access Logs' : '📊 All Access Logs'}
                    </h2>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>{logs.length} records</span>
                </div>

                {logs.length > 0 ? (
                    <div style={cardStyle}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {['Status', 'Plate', 'Detected Model', 'Timestamp'].map((header) => (
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
                                {logs.map((log, index) => (
                                    <tr key={log.id} style={{
                                        borderBottom: index < logs.length - 1 ? '1px solid #f8fafc' : 'none',
                                        backgroundColor: !log.plate_matched ? '#fef2f2' : 'transparent',
                                    }}>
                                        <td style={{ padding: '16px' }}>
                                            {log.plate_matched ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    backgroundColor: '#dcfce7',
                                                    color: '#16a34a',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }}>
                                                    ✅ Valid
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#dc2626',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }}>
                                                    🚨 Suspicious
                                                </span>
                                            )}
                                        </td>
                                        <td style={{
                                            padding: '16px',
                                            fontFamily: 'monospace',
                                            fontWeight: '600',
                                            color: '#0f172a',
                                            letterSpacing: '1px',
                                        }}>
                                            {log.plate_number}
                                        </td>
                                        <td style={{ padding: '16px', color: '#0f172a' }}>{log.detected_model || '—'}</td>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontSize: '14px' }}>
                                            {formatDate(log.timestamp)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {filter === 'fraud' ? '🎉' : '📦'}
                        </div>
                        <p style={{ color: '#64748b' }}>
                            {filter === 'fraud' ? 'No suspicious attempts detected!' : 'No access logs found'}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
