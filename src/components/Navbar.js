"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
            textDecoration: 'none',
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
            transition: 'color 0.2s ease',
            '&:hover': {
                color: '#00ff9d',
            },
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
        dropdownContainer: {
            position: 'relative',
            display: 'inline-block',
        },
        dropdownButton: {
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
            backgroundColor: showDropdown ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        },
        dropdownContent: {
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: '#000000',
            minWidth: '200px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '8px 0',
            zIndex: 1000,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '8px',
        },
        dropdownItem: {
            display: 'block',
            padding: '12px 16px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: 'rgba(0, 255, 157, 0.1)',
                color: '#00ff9d',
            },
        },
        dropdownIcon: {
            marginLeft: '4px',
            transition: 'transform 0.2s ease',
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
        },
    };

    return (
        <div style={styles.navbar}>
            <Link href="/hello" style={styles.logo}>
                <div style={styles.logoIcon}>ET</div>
                <span style={styles.logoText}>EchoTrails</span>
            </Link>
            <nav style={styles.nav}>
                <Link href="/hello" style={styles.link}>Home</Link>
                <Link href="/map" style={styles.link}>Map</Link>
                <div 
                    style={styles.dropdownContainer} 
                    ref={dropdownRef}
                >
                    <button 
                        style={styles.dropdownButton}
                        onClick={toggleDropdown}
                    >
                        Connections
                        <span style={styles.dropdownIcon}>▼</span>
                    </button>
                    {showDropdown && (
                        <div style={styles.dropdownContent}>
                            <Link href="/followaccept" style={styles.dropdownItem}>
                                Follow Accept
                            </Link>
                            <Link href="/followrequest" style={styles.dropdownItem}>
                                Follow Request
                            </Link>
                        </div>
                    )}
                </div>
                <Link href="/profile" style={styles.link}>Profile</Link>
                <button onClick={handleLogout} style={styles.button}>
                    Logout
                </button>
            </nav>
        </div>
    );
} 