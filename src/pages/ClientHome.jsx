import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import CategoryPage from '../components/CategoryPage';

export default function ClientHome() {
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const cat = searchParams.get('category');
        setActiveCategory(cat || 'all');
    }, [searchParams]);

    useEffect(() => {
        fetch('http://localhost:3000/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    return (
        <div>
            <Header
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />
            {activeCategory === 'all' ? (
                <>
                    <HeroBanner />
                    <CategoryFilter
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                    <ProductGrid activeCategory={activeCategory} products={products} />
                </>
            ) : (
                <CategoryPage
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    products={products}
                />
            )}
        </div>
    );
}
