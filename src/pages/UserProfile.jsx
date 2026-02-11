import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FiPackage, FiMapPin, FiShield, FiLogOut, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

export default function UserProfile() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            // Fetch Orders
            fetch(`http://localhost:3000/api/orders/user/${user.id}`)
                .then(res => res.json())
                .then(data => setOrders(data));

            // Fetch Addresses
            fetch(`http://localhost:3000/api/addresses/user/${user.id}`)
                .then(res => res.json())
                .then(data => setAddresses(data));
        }
    }, [user]);

    const handleLogoutAll = async () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar todas las sesiones activas?')) {
            const res = await fetch('http://localhost:3000/api/logout-all', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
            logout(); // También deslogueamos la actual
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page-container">
            <Header hideNewCollection={true} />

            <main className="container profile-main">
                <div className="profile-header card">
                    <div className="profile-avatar">
                        <FiUser size={40} />
                    </div>
                    <div className="profile-info-header">
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                </div>

                <div className="profile-layout">
                    <aside className="profile-sidebar">
                        <button className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            <FiUser /> Mi Perfil
                        </button>
                        <button className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <FiPackage /> Mis Pedidos
                        </button>
                        <button className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                            <FiMapPin /> Mis Direcciones
                        </button>
                        <button className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            <FiShield /> Seguridad
                        </button>
                    </aside>

                    <section className="profile-content card">
                        {activeTab === 'profile' && (
                            <div className="persona-section">
                                <h3>Descripción del Cliente</h3>
                                <div className="persona-card">
                                    <p><strong>Edad:</strong> 25-30 años</p>
                                    <p><strong>Estilo:</strong> Urbano - High Fashion. Prefiere prendas exclusivas y minimalistas que resalten su personalidad sin esfuerzo.</p>
                                    <p><strong>Comportamiento:</strong> Usuario digital nativo. Valor de compra promedio de 150€. Suele comprar durante lanzamientos de nuevas colecciones.</p>
                                    <p><strong>Necesidades:</strong> Rapidez en el envío, seguridad en el pago y facilidad para gestionar sus direcciones guardadas.</p>
                                    <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                                        "{user.name} es un cliente fiel a Antime que busca calidad y transparecia en cada compra. Utiliza su cuenta para mantener un registro impecable de sus piezas de colección."
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="orders-section">
                                <h3>Historial de Pedidos</h3>
                                {orders.length > 0 ? (
                                    <div className="orders-list">
                                        {orders.map(order => (
                                            <div key={order.id} className="order-item">
                                                <div className="order-meta">
                                                    <span>Order #{order.id}</span>
                                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="order-summary">{order.items_summary}</div>
                                                <div className="order-total">Total: ${order.total}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No tienes pedidos registrados aún.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="addresses-section">
                                <h3>Direcciones Guardadas</h3>
                                {addresses.length > 0 ? (
                                    <div className="addresses-list">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="address-item">
                                                <p>{addr.street}</p>
                                                <p>{addr.city}, {addr.state} {addr.zip_code}</p>
                                                <p>{addr.country}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No tienes direcciones guardadas.</p>
                                )}
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Agregar Dirección</button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="security-section">
                                <h3>Configuración de Cuenta</h3>
                                <div className="security-options">
                                    <div className="option-group">
                                        <h4>Sesión</h4>
                                        <button className="btn btn-outline" onClick={logout} style={{ width: '100%', marginBottom: '1rem' }}>
                                            <FiLogOut /> Cerrar Sesión
                                        </button>
                                        <button className="btn btn-outline" onClick={handleLogoutAll} style={{ width: '100%', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                            <FiShield /> Cerrar todas las sesiones activas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <style>{`
                .profile-page-container {
                    min-height: 100vh;
                    padding-bottom: 2rem;
                }
                .profile-main {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                }
                .profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                }
                .profile-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
                @media (min-width: 769px) {
                    .profile-layout {
                        grid-template-columns: 280px 1fr;
                    }
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .profile-tab-btn {
                    padding: 1rem 1.5rem;
                    text-align: left;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                    background: transparent;
                    color: var(--text-secondary);
                }
                .profile-tab-btn:hover, .profile-tab-btn.active {
                    background: white;
                    color: var(--text-primary);
                    box-shadow: var(--shadow-sm);
                }
                .profile-content {
                    min-height: 400px;
                    padding: 2rem;
                }
                .persona-card {
                    background: rgba(var(--accent), 0.05);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border-left: 4px solid var(--accent);
                    margin-top: 1rem;
                }
                .order-item {
                    border-bottom: 1px solid var(--border);
                    padding: 1rem 0;
                }
                .order-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                .order-summary {
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                .order-total {
                    font-weight: 600;
                    color: var(--accent);
                }
                .address-item {
                    padding: 1rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
