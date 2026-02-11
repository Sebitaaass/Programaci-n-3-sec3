import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
    es: {
        nav: {
            home: "Inicio",
            newCollection: "Nueva Colección",
            all: "Todo",
            hoodies: "Sudaderas",
            jackets: "Chaquetas",
            pants: "Pantalones",
            tshirts: "Camisetas",
            polos: "Polos",
            hats: "Gorras y Beanies",
            accessories: "Accesorios",
            items: "Items",
            viewAll: "Ver Todo",
            search: "Buscar",
            cart: "Carrito",
            logout: "Cerrar sesión"
        },
        hero: {
            title: "Colección Exclusiva",
            subtitle: "Explora las últimas tendencias en moda urbana",
            disclaimer: "* Disponibilidad limitada hasta agotar existencias",
            shopNow: "Comprar Ahora"
        },
        filters: {
            title: "Filtros",
            size: "Talla",
            price: "Precio",
            available: "Solo mostrar disponibles",
            products: "Productos",
            sort: "Ordenar"
        },
        common: {
            gift: "ENVÍO GRATIS EN PEDIDOS +200€ - REGALO EXCLUSIVO EN COMPRAS MAYORES A 150€"
        },
        categories: {
            all: "Todo",
            hoodies: "Sudaderas",
            jackets: "Chaquetas",
            pants: "Pantalones",
            tshirts: "Camisetas",
            polos: "Polos",
            hats: "Gorras y Beanies",
            accessories: "Accesorios"
        }
    },
    en: {
        nav: {
            home: "Home",
            newCollection: "New Collection",
            all: "All",
            hoodies: "Hoodies",
            jackets: "Jackets",
            pants: "Pants",
            tshirts: "T-Shirts",
            polos: "Polos",
            hats: "Hats & Beanies",
            accessories: "Accessories",
            items: "Items",
            viewAll: "View All",
            search: "Search",
            cart: "Cart",
            logout: "Logout"
        },
        hero: {
            title: "Exclusive Collection",
            subtitle: "Explore the latest urban fashion trends",
            disclaimer: "* Limited availability while stocks last",
            shopNow: "Shop Now"
        },
        filters: {
            title: "Filters",
            size: "Size",
            price: "Price",
            available: "Show available only",
            products: "Products",
            sort: "Sort"
        },
        common: {
            gift: "Envío gratis en pedidos +200€ - Regalo exclusivo en compras mayores a 150€"
        },
        categories: {
            all: "All",
            hoodies: "Hoodies",
            jackets: "Jackets",
            pants: "Pants",
            tshirts: "T-Shirts",
            polos: "Polos",
            hats: "Hats & Beanies",
            accessories: "Accessories"
        }
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('es');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'es' ? 'en' : 'es');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
