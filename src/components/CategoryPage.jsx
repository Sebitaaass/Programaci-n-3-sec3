import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductModal from './ProductModal';

// Sample data (duplicated for now, optimally should be shared)
const categoriesData = [
    { id: 'hoodies', icon: null },
    { id: 'jackets', icon: null },
    { id: 'pantalones', icon: null },
    { id: 'polos', icon: null },
    { id: 'camisetas', icon: null },
    { id: 'gorras', icon: null },
    { id: 'accesorios', icon: null },
    { id: 'items', icon: null },
];

export default function CategoryPage({ activeCategory, onCategoryChange, products = [] }) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);

    const handleProductClick = (product) => {
        if (!user) {
            navigate('/login', { state: { returnTo: location.pathname } });
            return;
        }
        setSelectedProduct(product);
    };

    return (
        <>
            <div className="category-page">
                {/* Top Category Nav Icons */}
                <div className="category-top-nav">
                    {categoriesData.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`cat-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                            <span className="cat-icon">
                                {cat.icon ? (
                                    <img src={cat.icon} alt={cat.id} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                ) : (
                                    <span>•</span>
                                )}
                            </span>
                            <span className="cat-label">{t.categories[cat.id] || cat.id}</span>
                        </button>
                    ))}
                </div>

                <div className="category-layout">
                    {/* Sidebar Filters */}
                    <aside className="category-sidebar">
                        <div className="filter-group">
                            <h3>{t.filters.title}</h3>
                        </div>
                        <div className="filter-group">
                            <div className="filter-header">{t.filters.size} <span>▼</span></div>
                        </div>
                        <div className="filter-group">
                            <div className="filter-header">{t.filters.price} <span>▼</span></div>
                        </div>
                        <div className="filter-group toggle-group">
                            <span>{t.filters.available}</span>
                            <div className="toggle-switch"></div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="category-main">
                        <div className="products-header">
                            <span>{filteredProducts.length} {t.filters.products}</span>
                            <div className="products-controls">
                                <button>▦</button>
                                <button>{t.filters.sort} ▼</button>
                            </div>
                        </div>

                        <div className="enhanced-grid">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="enhanced-card"
                                    onClick={() => handleProductClick(product)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-image-wrapper">
                                        <div className="card-placeholder" style={{ backgroundColor: product.color || '#e0e0e0' }}>
                                            {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
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
                                        <h3>{product.name}</h3>
                                        <p className="product-category">{t.categories[product.category] || product.category}</p>

                                        <p className="product-price">{typeof product.price === 'number' ? `$${product.price}` : product.price}</p>

                                        {product.sizes && (
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                {product.sizes.split(',').map((size, idx) => (
                                                    <span key={idx} style={{
                                                        fontSize: '0.6rem',
                                                        padding: '1px 5px',
                                                        border: '1px solid var(--border)',
                                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                                        borderRadius: '2px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {size.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="color-dots">
                                            <span className="color-dot" style={{ backgroundColor: '#c00' }}></span>
                                            <span className="color-dot" style={{ backgroundColor: '#ccc' }}></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}
