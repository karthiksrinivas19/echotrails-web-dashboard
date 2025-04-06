"use client";

import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    const styles = {
        navbar: {
            width: '100%',
            backgroundColor: '#000000',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        logoIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#00ff9d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.3)',
        },
        logoText: {
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '600',
        },
        nav: {
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
        },
        link: {
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
        },
        button: {
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#000000',
            backgroundColor: '#00ff9d',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
        },
    };

    return (
        <div style={styles.navbar}>
            <div style={styles.logo}>
                <div style={styles.logoIcon}>ET</div>
                <span style={styles.logoText}>EchoTrails</span>
            </div>
            <nav style={styles.nav}>
                <a href="/hello" style={styles.link}>Home</a>
                <a href="/map" style={styles.link}>Map</a>
                <a href="/profile" style={styles.link}>Profile</a>
                <button onClick={handleLogout} style={styles.button}>
                    Logout
                </button>
            </nav>
        </div>
    );
} 