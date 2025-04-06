"use client";

import React from 'react';
import Navbar from '@/components/Navbar';

const Page = () => {
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
        },
        content: {
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        title: {
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '20px',
        },
    };

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.content}>
                <h1 style={styles.title}>HI DA PRAKASH MAVANE</h1>
            </div>
        </div>
    );
};

export default Page;
