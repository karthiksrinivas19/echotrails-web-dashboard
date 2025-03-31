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
            console.log('Login successful:', data); // Log successful response

            // Redirect to the "hello" page
            router.push('/hello');
        } catch (err) {
            console.error('Login error:', err); // Log error
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>
                <form style={styles.form} onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        style={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        style={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                {error && <p style={styles.errorText}>{error}</p>}
                <p style={styles.footerText}>
                    Don't have an account? <a href="/signup" style={styles.link}>Sign up</a>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6',
        margin: 0,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#333333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '0.75rem',
        margin: '0.5rem 0',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '1rem',
    },
    button: {
        padding: '0.75rem',
        margin: '1rem 0',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    buttonHover: {
        backgroundColor: '#2563eb',
    },
    footerText: {
        fontSize: '0.875rem',
        color: '#6b7280',
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
    },
    errorText: {
        color: 'red',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
    },
};