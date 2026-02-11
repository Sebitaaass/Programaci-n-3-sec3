import { useLanguage } from '../contexts/LanguageContext';
// Images
const categories = [
    { id: 'all', label: 'Todo', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'hoodies', label: 'Sudaderas', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'jackets', label: 'Chaquetas', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'polos', label: 'Polos', img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'pantalones', label: 'Pantalones', img: 'https://images.unsplash.com/photo-1541099649105-f69ad23f324e?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'camisetas', label: 'Camisetas', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'gorras', label: 'Gorras', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 'accesorios', label: 'Accesorios', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&h=200' },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
    return (
        <div className="category-filter">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    className={`category-item-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    <div className="category-img-wrapper">
                        <img src={cat.img} alt={cat.label} />
                    </div>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
    );
}
