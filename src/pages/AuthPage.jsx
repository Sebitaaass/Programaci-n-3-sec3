import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import loginBg from '../assets/login-bg.jpg';

export default function AuthPage() {
    const { login, register } = useAuth();
    const { checkout } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.name, formData.email, formData.password);
        }

        if (result.success) {
            const { returnTo, checkoutAfterLogin } = location.state || {};
            if (checkoutAfterLogin) {
                // Pequeño delay para asegurar que el usuario ya está en el context
                setTimeout(() => checkout(), 500);
            }
            navigate(returnTo || '/');
        } else {
            setError(result.error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
        }}>
            {/* Overlay for better readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 0
            }} />

            {/* Liquid Glass Card - Apple Style */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '420px',
                margin: '1rem',
                padding: '2.5rem',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.1)
                `,
            }}>
                {/* Logo */}
                <h1 style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: '3.5rem',
                    fontWeight: '400',
                    color: '#ffffff',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    letterSpacing: '2px',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                    Antime
                </h1>

                <h2 style={{
                    marginBottom: '2rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '400',
                    fontSize: '1rem'
                }}>
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.3)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#fecaca',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'block',
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '0.875rem',
                                marginBottom: '0.5rem',
                                fontWeight: '500'
                            }}>
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Tu nombre completo"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    color: '#ffffff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                color: '#ffffff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.875rem',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                color: '#ffffff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                            color: '#1a1a1a',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                        }}
                    >
                        {isLogin ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                <p style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)'
                }}>
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            padding: '0 0.5rem',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    >
                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
}
