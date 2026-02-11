import { useLanguage } from '../contexts/LanguageContext';
// Images
// import hoodieIcon from '../assets/icons/hoodie.png';
const hoodieIcon = "https://cdn-icons-png.flaticon.com/512/9385/9385202.png"; // Placeholder online icon

const categories = [
    { id: 'all', label: 'Todo', icon: null },
    { id: 'hoodies', label: 'Hoodies', icon: hoodieIcon },
    { id: 'pantalones', label: 'Pantalones', icon: null },
    { id: 'camisetas', label: 'Camisetas', icon: null },
    { id: 'gorras', label: 'Gorras', icon: null },
    { id: 'accesorios', label: 'Accesorios', icon: null },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
    const { t } = useLanguage(); // Using t if you want to reuse translations or just fallback to labels

    return (
        <div className="category-filter">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {cat.icon && (
                        <img src={cat.icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    )}
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
