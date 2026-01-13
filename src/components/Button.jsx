import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    type = 'button',
    disabled = false,
    className = '',
    style = {},
    icon: Icon
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        ...style
    };

    const variants = {
        primary: {
            background: '#1e40af',
            color: '#ffffff',
        },
        secondary: {
            background: '#3b82f6',
            color: '#ffffff',
        },
        danger: {
            background: '#ef4444',
            color: '#ffffff',
        },
        success: {
            background: '#059669',
            color: '#ffffff',
        },
        outline: {
            background: 'transparent',
            border: '1px solid #e2e8f0',
            color: '#334155',
        },
        ghost: {
            background: 'transparent',
            color: '#64748b',
        },
        light: {
            background: '#f1f5f9',
            color: '#475569',
        }
    };

    const sizes = {
        small: {
            padding: '6px 12px',
            fontSize: '12px',
        },
        medium: {
            padding: '10px 20px',
            fontSize: '14px',
        },
        large: {
            padding: '12px 24px',
            fontSize: '16px',
        }
    };

    const combinedStyles = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={combinedStyles}
            className={className}
        >
            {Icon && <Icon size={size === 'small' ? 14 : 18} />}
            {children}
        </button>
    );
};

export default Button;
