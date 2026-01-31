import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ANPR Admin Dashboard',
    description: 'Vehicle Access Control System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen`}>
                <Navbar />
                <main className="container mx-auto px-6 py-8 max-w-7xl">
                    {children}
                </main>
            </body>
        </html>
    );
}
