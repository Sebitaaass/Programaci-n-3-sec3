import React from 'react';
import { useCart } from '../contexts/CartContext';

export default function CartSidebar() {
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
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
            <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h2>tu carrito</h2>
                    <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-img">
                                    <img src={item.image_url} alt={item.name} />
                                </div>
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <p className="item-size-label">Talla: {item.size || 'N/A'}</p>
                                    <p className="item-price-label">${item.price}</p>

                                    <div className="item-controls">
                                        <div className="qty-btns">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        </div>
                                        <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button className="btn btn-primary checkout-btn" onClick={checkout}>
                            finalizar compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
