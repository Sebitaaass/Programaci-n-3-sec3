import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductModal({ product, onClose }) {
    const { addToCart, checkout } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];

    const handleAction = async (isBuyNow = false) => {
        if (sizes.length > 0 && !selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }

        await addToCart(product, selectedSize, quantity);

        if (isBuyNow) {
            if (!user) {
                onClose();
                navigate('/login', { state: { returnTo: '/shop', checkoutAfterLogin: true } });
            } else {
                onClose();
                checkout();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="product-modal-grid">
                    <div className="product-modal-image">
                        <img src={product.image_url} alt={product.name} />
                    </div>

                    <div className="product-modal-info">
                        <h2 className="product-modal-title">{product.name}</h2>
                        <p className="product-modal-price">${product.price}</p>

                        <div className="product-modal-desc">
                            <h3>descripción</h3>
                            <p>{product.description || 'Sin descripción disponible.'}</p>
                        </div>

                        {sizes.length > 0 && (
                            <div className="product-modal-sizes">
                                <h3>seleccionar talla</h3>
                                <div className="size-selector">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="product-modal-quantity">
                            <h3>cantidad</h3>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleAction(false)}>
                                agregar al carrito
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAction(true)}>
                                comprar ahora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
