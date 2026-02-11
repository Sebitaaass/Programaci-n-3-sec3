import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronDown, FiHome, FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';
import CartDropdown from './CartDropdown';

export default function Header({ activeCategory, onCategoryChange, hideNewCollection }) {
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { cartCount, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeTimer = useRef(null);

    const handleCategoryClick = (category) => {
        navigate(`/shop?category=${category}`);
        // Cerramos el menú con un pequeño delay para que no sea abrupto al hacer click
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            setIsMenuOpen(false);
        }, 500);
    };

    const handleMouseEnter = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setIsMenuOpen(true);
    };

    const handleMouseLeave = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
            setIsMenuOpen(false);
        }, 300); // 300ms de gracia para evitar cierres accidentales
    };

    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, []);

    return (
        <header className="main-header">
            <div className="header-container">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} onMouseLeave={handleMouseLeave}>
                    {activeCategory !== 'all' && (
                        <Link
                            to="/"
                            className="header-nav-link"
                            onClick={() => onCategoryChange && onCategoryChange('all')}
                            style={{ marginRight: 'var(--space-4)' }}
                        >
                            <FiHome />
                            {t.nav.home}
                        </Link>
                    )}
                    {!hideNewCollection && (
                        <div
                            className="nav-item-wrapper"
                            onMouseEnter={handleMouseEnter}
                        >
                            <button
                                className="header-nav-link"
                                onClick={() => {
                                    if (isMenuOpen) {
                                        handleMouseLeave();
                                    } else {
                                        handleMouseEnter();
                                    }
                                }}
                            >
                                {t.nav.newCollection}
                                <FiChevronDown style={{
                                    transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease'
                                }} />
                            </button>

                            <div className={`mega-menu ${isMenuOpen ? 'active' : ''}`} onMouseEnter={handleMouseEnter}>
                                <div className="mega-menu-content">
                                    <ul className="mega-menu-sidebar">
                                        <li><a href="#" onClick={() => handleCategoryClick('all')}>{t.nav.all}</a></li>
                                        <li><a href="#" onClick={() => handleCategoryClick('hoodies')}>{t.nav.hoodies}</a></li>
                                        <li><a href="#" onClick={() => handleCategoryClick('pantalones')}>{t.nav.pants}</a></li>
                                        <li><a href="#" onClick={() => handleCategoryClick('accesorios')}>{t.nav.accessories}</a></li>
                                        <li><a href="#" onClick={() => handleCategoryClick('jackets')}>{t.nav.jackets}</a></li>
                                    </ul>

                                    <div className="mega-menu-grid">
                                        <div className="mega-menu-card" onClick={() => handleCategoryClick('hoodies')}>
                                            <div className="mega-img-container">
                                                <img src="/modelo hoddie.jpg" alt="Hoodies" />
                                            </div>
                                            <span>{t.nav.hoodies}</span>
                                        </div>
                                        <div className="mega-menu-card" onClick={() => handleCategoryClick('pantalones')}>
                                            <div className="mega-img-container">
                                                <img src="/modelo pants.jpg" alt="Pants" />
                                            </div>
                                            <span>{t.nav.pants}</span>
                                        </div>
                                        <div className="mega-menu-card" onClick={() => handleCategoryClick('accesorios')}>
                                            <div className="mega-img-container">
                                                <img src="/modelo accesorios.jpg" alt="Accesorios" />
                                            </div>
                                            <span>{t.nav.accessories}</span>
                                        </div>
                                        <div className="mega-menu-card" onClick={() => handleCategoryClick('jackets')}>
                                            <div className="mega-img-container">
                                                <img src="/modelo jackets.jpg" alt="Jackets" />
                                            </div>
                                            <span>{t.nav.jackets}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                <Link
                    to="/"
                    className="logo"
                    onClick={() => onCategoryChange && onCategoryChange('all')}
                >
                    antime
                </Link>

                <div className="header-actions">
                    <div className="lang-selector">
                        <button
                            onClick={() => setLanguage('es')}
                            style={{ fontWeight: language === 'es' ? 'bold' : 'normal', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            ES
                        </button>
                        <span>|</span>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{ fontWeight: language === 'en' ? 'bold' : 'normal', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            EN
                        </button>
                    </div>

                    <button className="header-action-btn">
                        <FiSearch />
                    </button>

                    <div className="cart-menu-wrapper" style={{ position: 'relative' }}>
                        <button className="header-action-btn" onClick={() => setIsCartOpen(!isCartOpen)} style={{ position: 'relative' }}>
                            <FiShoppingBag />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </button>
                        <CartDropdown />
                    </div>

                    <div className="user-menu">
                        {user ? (
                            <>
                                <button
                                    className="header-action-btn"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <FiUser />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="user-dropdown">
                                        <div className="user-dropdown-info" style={{ padding: '10px 15px', borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                                            <strong>{user.name}</strong><br />
                                            <span style={{ color: '#666' }}>{user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
                                        </div>
                                        <button
                                            className="user-dropdown-item"
                                            onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }}
                                        >
                                            Mi Perfil
                                        </button>
                                        {user.role === 'admin' && (
                                            <button
                                                className="user-dropdown-item"
                                                onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
                                            >
                                                Panel Admin
                                            </button>
                                        )}
                                        <button
                                            className="user-dropdown-item"
                                            onClick={() => { logout(); navigate('/login'); }}
                                            style={{ color: '#e53935' }}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="auth-buttons" style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        border: '1px solid var(--text-primary)',
                                        background: 'transparent',
                                        padding: '5px 15px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
