"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('https://echo-trails-backend.vercel.app/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.status === 201) {
                const data = await response.json();
                localStorage.setItem('authToken', data.authToken); // Store authToken in localStorage
                window.location.href = 'login';
                setMessage(`User registered successfully! Welcome, ${data.username}.`);
                setFormData({ username: '', email: '', password: '' });
            } else {
                let errorData = {};
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        console.error('Failed to parse error response:', jsonError);
                    }
                }
                console.error('Registration failed:', errorData);
                setError(errorData.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('An error occurred during registration:', err);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
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
        message: {
            marginTop: '24px',
            textAlign: 'center',
            color: '#00ff9d',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
            border: '1px solid rgba(0, 255, 157, 0.2)',
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
            <h1 style={styles.title}>Create Your Account</h1>
            <p style={styles.subtitle}>Join EchoTrails and start your journey</p>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="username" style={styles.label}>Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    style={{
                        ...styles.button,
                        ...(isLoading ? styles.buttonDisabled : {}),
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div style={styles.loadingSpinner} />
                            Signing up...
                        </>
                    ) : (
                        'Sign Up'
                    )}
                </button>
                <p style={styles.footerText}>
                    Already have an account?{' '}
                    <a 
                        href="/login" 
                        style={styles.link}
                    >
                        Sign in
                    </a>
                </p>
            </form>
            {message && <p style={styles.message}>{message}</p>}
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}