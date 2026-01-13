import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div style={styles.container}>
            <button
                style={{
                    ...styles.button,
                    ...(currentPage === 0 ? styles.disabled : {})
                }}
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>
            <span style={styles.info}>
                Page {currentPage + 1} of {totalPages || 1}
            </span>
            <button
                style={{
                    ...styles.button,
                    ...(currentPage >= totalPages - 1 ? styles.disabled : {})
                }}
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '20px',
        gap: '12px',
        padding: '10px 0'
    },
    button: {
        padding: '8px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#334155',
        fontWeight: 500,
        transition: 'all 0.2s'
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: '#f8fafc'
    },
    info: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: 500
    }
};

export default Pagination;
