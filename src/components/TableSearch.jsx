import React from 'react';
import { Search } from 'lucide-react';

const TableSearch = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div style={styles.container}>
            <Search size={18} style={styles.icon} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={styles.input}
            />
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        width: '300px',
        marginBottom: '16px'
    },
    icon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8'
    },
    input: {
        width: '100%',
        padding: '10px 16px 10px 40px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    }
};

export default TableSearch;
