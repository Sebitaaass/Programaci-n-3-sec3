import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function AuthPromptModal() {
    const { isAuthPromptOpen, setIsAuthPromptOpen } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthPromptOpen) return null;

    const handleLogin = () => {
        setIsAuthPromptOpen(false);
        navigate('/login', { state: { returnTo: location.pathname } });
    };

    const handleRegister = () => {
        setIsAuthPromptOpen(false);
        navigate('/login', { state: { returnTo: location.pathname, mode: 'register' } });
    };

    return (
        <div className="modal-overlay" onClick={() => setIsAuthPromptOpen(false)}>
            <div className="modal-content auth-prompt-modal" onClick={e => e.stopPropagation()} style={{
                maxWidth: '400px',
                padding: '2rem',
                textAlign: 'center',
                borderRadius: '12px',
                background: 'var(--bg-primary)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                <button
                    onClick={() => setIsAuthPromptOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    ×
                </button>

                <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Para continuar comprando</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Necesitas iniciar sesión o registrarte para completar tu pedido.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleLogin}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px' }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={handleRegister}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '12px' }}
                    >
                        Registrarse
                    </button>
                </div>
            </div>
        </div>
    );
}
