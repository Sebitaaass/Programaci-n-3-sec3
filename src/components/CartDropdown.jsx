import React from 'react';
import { useCart } from '../contexts/CartContext';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

export default function CartDropdown() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        checkout,
        isCartOpen,
        setIsCartOpen
    } = useCart();

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!isCartOpen) return null;

    return (
        <div className="cart-dropdown-container" onClick={e => e.stopPropagation()}>
            <div className="cart-dropdown-header">
                <h3>Mi Carrito ({cartItems.length})</h3>
                <button className="cart-dropdown-close" onClick={() => setIsCartOpen(false)}>
                    <FiX />
                </button>
            </div>

            <div className="cart-dropdown-items">
                {cartItems.length === 0 ? (
                    <div className="cart-dropdown-empty">
                        <p>Tu carrito está vacío</p>
                    </div>
                ) : (
                    cartItems.map(item => (
                        <div key={item.id} className="cart-dropdown-item">
                            <div className="cart-dropdown-item-img">
                                <img src={item.image_url} alt={item.name} />
                            </div>
                            <div className="cart-dropdown-item-info">
                                <div className="cart-dropdown-item-header">
                                    <h4>{item.name}</h4>
                                    <button
                                        className="cart-dropdown-remove"
                                        onClick={() => removeFromCart(item.id)}
                                        title="Eliminar"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <p className="cart-dropdown-item-size">Talla: {item.size || 'N/A'}</p>
                                <div className="cart-dropdown-item-footer">
                                    <div className="cart-dropdown-qty">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <FiMinus />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <span className="cart-dropdown-price">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cartItems.length > 0 && (
                <div className="cart-dropdown-footer">
                    <div className="cart-dropdown-total">
                        <span>Total de productos</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button className="cart-dropdown-btn-premium" onClick={checkout}>
                        Finalizar Compra
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.65rem', marginTop: '15px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Gastos de envío e impuestos calculados al pagar
                    </p>
                </div>
            )}
        </div>
    );
}
