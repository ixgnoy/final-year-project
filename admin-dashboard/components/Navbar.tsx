'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Register', path: '/register' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Fraud', path: '/fraud' },
    ];

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '12px 24px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}>
                    {/* Left: Sidebar Icon - Absolutely positioned */}
                    <button
                        style={{
                            position: 'absolute',
                            left: 0,
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#374151',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </button>

                    {/* Center: Navigation Items */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            const isHovered = hoveredItem === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onMouseEnter={() => setHoveredItem(item.path)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: isActive
                                            ? 'rgba(0, 0, 0, 0.06)'
                                            : isHovered
                                                ? 'rgba(0, 0, 0, 0.04)'
                                                : 'transparent',
                                        color: isActive ? '#ef4444' : '#1f2937',
                                    }}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Search Icon - Absolutely positioned */}
                    <button
                        style={{
                            position: 'absolute',
                            right: 0,
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#374151',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
