import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.content}>
                <p style={styles.text}>
                    &copy; {new Date().getFullYear()} E-Billing System. All rights reserved.
                </p>
                <div style={styles.links}>
                    <a href="#" style={styles.link}>Privacy Policy</a>
                    <a href="#" style={styles.link}>Terms of Service</a>
                    <a href="#" style={styles.link}>Contact Support</a>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '24px 32px',
        marginTop: 'auto'
    },
    content: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
    },
    text: {
        color: '#64748b',
        fontSize: '13px',
        margin: 0
    },
    links: {
        display: 'flex',
        gap: '24px'
    },
    link: {
        color: '#64748b',
        fontSize: '13px',
        textDecoration: 'none',
        transition: 'color 0.2s'
    }
};

export default Footer;
