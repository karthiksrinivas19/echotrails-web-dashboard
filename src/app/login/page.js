"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Initialize useRouter

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Sending login request:', { email, password }); // Log request payload

            const response = await fetch('https://echo-trails-backend.vercel.app/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Response status:', response.status); // Log response status

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error('Error response:', errorDetails); // Log error details
                throw new Error(errorDetails.message || 'Invalid email or password');
            }

            const data = await response.json();
            console.log(data); // This should now log the full object

            console.log('Login successful:', data); // Log successful response

            console.log('Before storing token:', data);
            localStorage.setItem('authToken', data.access_token);
            console.log('Token stored:', localStorage.getItem('authToken'));
            localStorage.setItem('username', data.username);
            // Redirect to the "hello" page
            router.push('/hello');
        } catch (err) {
            console.error('Login error:', err); // Log error
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '480px',
            margin: '40px auto',
            padding: '60px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#000000',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        logoContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
        },
        logo: {
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: '#00ff9d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
            fontSize: '32px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.3)',
        },
        title: {
            textAlign: 'center',
            marginBottom: '12px',
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '700',
        },
        subtitle: {
            textAlign: 'center',
            color: '#a0a0a0',
            fontSize: '18px',
            marginBottom: '40px',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        label: {
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
            marginLeft: '4px',
        },
        input: {
            padding: '18px 20px',
            fontSize: '18px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            height: '60px',
            outline: 'none',
        },
        button: {
            padding: '20px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#000000',
            backgroundColor: '#00ff9d',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
            height: '64px',
        },
        buttonDisabled: {
            backgroundColor: '#333333',
            cursor: 'not-allowed',
            color: '#666666',
            boxShadow: 'none',
        },
        error: {
            marginTop: '24px',
            textAlign: 'center',
            color: '#ff4d4d',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.2)',
        },
        footerText: {
            textAlign: 'center',
            color: '#a0a0a0',
            fontSize: '16px',
            marginTop: '32px',
        },
        link: {
            color: '#00ff9d',
            textDecoration: 'none',
            fontWeight: '500',
        },
        loadingSpinner: {
            width: '24px',
            height: '24px',
            border: '2px solid #000000',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.logoContainer}>
                <div style={styles.logo}>ET</div>
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to continue your journey</p>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        style={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        style={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {}),
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div style={styles.loadingSpinner} />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
                {error && <p style={styles.error}>{error}</p>}
                <p style={styles.footerText}>
                    Don't have an account?{' '}
                    <a 
                        href="/signup" 
                        style={styles.link}
                    >
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}