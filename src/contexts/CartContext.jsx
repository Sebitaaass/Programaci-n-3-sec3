import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config/api';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cargar carrito al iniciar sesión
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
            const data = await res.json();
            setCartItems(data);
        } catch (error) {
            console.error("Error fetching cart", error);
        }
    };

    const addToCart = async (product, size, quantity = 1) => {
        if (!user) {
            alert("Por favor, inicia sesión para agregar al carrito");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productId: product.id,
                    size,
                    quantity
                })
            });

            if (res.ok) {
                fetchCart();
                setIsCartOpen(true); // Abrir carrito al agregar
            }
        } catch (error) {
            console.error("Error adding to cart", error);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity < 1) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItemId, quantity })
            });
            if (res.ok) fetchCart();
        } catch (error) {
            console.error("Error updating quantity", error);
        }
    };

    const removeFromCart = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchCart();
        } catch (error) {
            console.error("Error removing from cart", error);
        }
    };

    const checkout = async () => {
        if (!user || cartItems.length === 0) return;

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            const res = await fetch(`${API_BASE_URL}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    items: cartItems.map(item => ({
                        product_id: item.product_id,
                        size: item.size,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total
                })
            });

            if (res.ok) {
                setCartItems([]);
                setIsCartOpen(false);
                alert("¡Compra realizada con éxito!");
            }
        } catch (error) {
            console.error("Error during checkout", error);
        }
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            updateQuantity,
            removeFromCart,
            checkout,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
