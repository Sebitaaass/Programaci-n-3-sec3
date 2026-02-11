import React, { useState } from 'react';
import ProductModal from './ProductModal';

export default function ProductGrid({ activeCategory, products = [] }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const safeProducts = Array.isArray(products) ? products : [];

    const filteredProducts = activeCategory === 'all'
        ? safeProducts
        : safeProducts.filter(p => p.category === activeCategory);

    return (
        <>
            <section className="products-section">
                <div className="products-grid">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div className="product-image-container" style={{ position: 'relative' }}>
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="product-placeholder"
                                        style={{
                                            background: product.color || '#f0f0f0',
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '3rem',
                                            opacity: 0.4,
                                            filter: 'grayscale(50%)'
                                        }}>
                                            👕
                                        </span>
                                    </div>
                                )}
                                {product.sizes && (
                                    <div className="size-overlay">
                                        {product.sizes.split(',').map((size, idx) => (
                                            <span key={idx} className="size-tag">
                                                {size.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">{typeof product.price === 'number' ? `$${product.price}` : product.price}</p>

                                {product.sizes && (
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                        {product.sizes.split(',').map((size, idx) => (
                                            <span key={idx} style={{
                                                fontSize: '0.6rem',
                                                padding: '1px 5px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'rgba(255,255,255,0.3)',
                                                borderRadius: '2px'
                                            }}>
                                                {size.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {
                    filteredProducts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-family)',
                            fontSize: '1.5rem'
                        }}>
                            No hay productos en esta categoría
                        </div>
                    )
                }
            </section >

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}
