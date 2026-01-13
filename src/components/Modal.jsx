export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <button
                        style={styles.closeBtn}
                        onClick={onClose}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        ×
                    </button>
                </div>
                <div style={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: 20
    },
    modal: {
        background: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 480,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0'
    },
    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: 600,
        color: '#0f172a'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: 28,
        cursor: 'pointer',
        color: '#94a3b8',
        padding: 0,
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        transition: 'all 0.15s ease',
        lineHeight: 1
    },
    body: {
        padding: 24
    }
};
