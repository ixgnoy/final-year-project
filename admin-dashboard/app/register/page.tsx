"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Tan', hex: '#d2b48c' },
    { name: 'Beige', hex: '#f5f5dc' },
    { name: 'Silver', hex: '#c0c0c0' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Grey', hex: '#6b7280' },
    { name: 'Brown', hex: '#92400e' },
    { name: 'Gold', hex: '#fbbf24' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Black', hex: '#000000' },
];

export default function RegisterVehicle() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        plate_number: '',
        make_model: '',
        color: '',
        owner_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('vehicles')
                .insert([
                    {
                        plate_number: formData.plate_number.toUpperCase(),
                        make_model: formData.make_model,
                        color: formData.color,
                        owner_name: formData.owner_name
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setMessage('Vehicle Registered Successfully!');
            setTimeout(() => router.push('/'), 2000);
        } catch (err: any) {
            console.error(err);
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f1f5f9',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '16px',
        color: '#0f172a',
        outline: 'none',
        transition: 'all 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569',
        marginBottom: '8px',
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Section */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>Register New Vehicle</h1>
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
                <p style={{ color: '#64748b', fontSize: '16px' }}>Add a new vehicle to the access control system</p>
            </section>

            {/* Form Card */}
            <div style={cardStyle}>
                <form onSubmit={handleSubmit}>
                    {/* Plate Number */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>
                            License Plate Number <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="ABC 1234"
                            style={{
                                ...inputStyle,
                                fontFamily: 'monospace',
                                textTransform: 'uppercase',
                                fontSize: '18px',
                                letterSpacing: '2px',
                            }}
                            value={formData.plate_number}
                            onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                            onFocus={e => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Two Column Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
                        {/* Make/Model */}
                        <div>
                            <label style={labelStyle}>
                                Make / Model <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Toyota Camry"
                                style={inputStyle}
                                value={formData.make_model}
                                onChange={e => setFormData({ ...formData, make_model: e.target.value })}
                                onFocus={e => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Owner Name */}
                        <div>
                            <label style={labelStyle}>Owner Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                style={inputStyle}
                                value={formData.owner_name}
                                onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                                onFocus={e => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>
                            Vehicle Color <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                            {COLORS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.name })}
                                    style={{
                                        position: 'relative',
                                        padding: '12px',
                                        borderRadius: '16px',
                                        border: formData.color === color.name
                                            ? '3px solid #3b82f6'
                                            : '2px solid #e2e8f0',
                                        backgroundColor: formData.color === color.name
                                            ? '#eff6ff'
                                            : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform: formData.color === color.name ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '40px',
                                            borderRadius: '10px',
                                            backgroundColor: color.hex,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            border: color.name === 'White' ? '1px solid #e2e8f0' : 'none',
                                        }}
                                    ></div>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        marginTop: '8px',
                                        textAlign: 'center',
                                        fontWeight: '500',
                                    }}>{color.name}</p>
                                    {formData.color === color.name && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontWeight: '500',
                            marginBottom: '24px',
                            backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
                            color: message.includes('Error') ? '#dc2626' : '#16a34a',
                            border: message.includes('Error') ? '1px solid #fecaca' : '1px solid #bbf7d0',
                        }}>
                            {success && <span style={{ marginRight: '8px' }}>✅</span>}
                            {message}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.color}
                        style={{
                            width: '100%',
                            background: loading || !formData.color
                                ? '#e2e8f0'
                                : 'linear-gradient(135deg, #ef4444, #ec4899)',
                            color: loading || !formData.color ? '#94a3b8' : 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: loading || !formData.color ? 'not-allowed' : 'pointer',
                            boxShadow: loading || !formData.color
                                ? 'none'
                                : '0 4px 14px rgba(239, 68, 68, 0.4)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid white',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }}></span>
                                Registering...
                            </>
                        ) : (
                            <>
                                ✅ Register Vehicle
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Quick Tips Section */}
            <section style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Quick Tips</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                        { icon: '📋', title: 'Plate Format', desc: 'Use standard format (ABC 1234)' },
                        { icon: '🎨', title: 'Color Accuracy', desc: 'Select the closest matching color' },
                        { icon: '⚡', title: 'Real-time Sync', desc: 'Changes sync instantly across all devices' },
                    ].map((tip, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #f1f5f9',
                            }}
                        >
                            <span style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}>{tip.icon}</span>
                            <h3 style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{tip.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '14px' }}>{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
