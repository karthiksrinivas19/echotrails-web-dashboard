"use client";

import { useState } from 'react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
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
        }
    };

    const styles = {
        container: {
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Arial, sans-serif',
        },
        title: {
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
        },
        input: {
            marginBottom: '15px',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
        },
        button: {
            padding: '10px',
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#007BFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        },
        message: {
            marginTop: '15px',
            textAlign: 'center',
            color: 'green',
        },
        error: {
            marginTop: '15px',
            textAlign: 'center',
            color: 'red',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Register</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />
                <p style={styles.footerText}>
                Already have an account? <a href="/login" style={styles.link}>Go to login</a>
            </p>
                <button type="submit" style={styles.button}>Register</button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
}