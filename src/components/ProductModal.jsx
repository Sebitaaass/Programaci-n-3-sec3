import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

export default function ProductModal({ product, onClose }) {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            alert("Por favor selecciona una talla");
            return;
        }
        addToCart(product, selectedSize, quantity);
        onClose();
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

                        {/* Size Selector */}
                        {sizes.length > 0 && (
                            <div className="product-modal-sizes">
                                <h3>seleccionar talla</h3>
                                <div className="size-selector">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                            disabled={product.stock <= 0}
                                            style={product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock <= 0}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} disabled={product.stock <= 0}>+</button>
                            </div>
                        </div>

                        {product.stock > 0 ? (
                            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                                agregar al carrito
                            </button>
                        ) : (
                            <button className="btn btn-secondary add-to-cart-btn" disabled style={{ cursor: 'not-allowed', backgroundColor: '#ccc' }}>
                                AGOTADO
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
