import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ProductModal from './ProductModal';

// Sample data (duplicated for now, optimally should be shared)
const categoriesData = [
    { id: 'all', label: 'Todo', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'hoodies', label: 'Sudaderas', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'jackets', label: 'Chaquetas', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'polos', label: 'Polos', img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'pantalones', label: 'Pantalones', img: 'https://images.unsplash.com/photo-1541099649105-f69ad23f324e?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'camisetas', label: 'Camisetas', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'gorras', label: 'Gorras', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'accesorios', label: 'Accesorios', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&h=200' },
];

export default function CategoryPage({ activeCategory, onCategoryChange, products = [] }) {
    const { t } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);

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
                            <div className="category-img-wrapper" style={{ width: '60px', height: '60px', borderWidth: '2px' }}>
                                <img src={cat.img} alt={cat.label} />
                            </div>
                            <span className="cat-label">{cat.label}</span>
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
                                    onClick={() => setSelectedProduct(product)}
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
                                        {product.stock <= 0 && (
                                            <div className="out-of-stock-overlay" style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                zIndex: 10
                                            }}>
                                                AGOTADO
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
