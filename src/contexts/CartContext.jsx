import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
            const data = await res.json();
            setCartItems(data);
        } catch (error) {
            console.error("Error fetching cart", error);
        }
    }, [user]);

    const syncGuestCart = useCallback(async (userId) => {
        const localCart = localStorage.getItem('guest_cart');
        if (!localCart) return;

        const items = JSON.parse(localCart);
        if (items.length === 0) return;

        try {
            // Enviar cada item al servidor
            for (const item of items) {
                await fetch(`${API_BASE_URL}/api/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        productId: item.product_id,
                        size: item.size,
                        quantity: item.quantity
                    })
                });
            }
            localStorage.removeItem('guest_cart');
        } catch (error) {
            console.error("Error syncing cart", error);
        }
    }, []);

    // Cargar carrito al iniciar sesión o desde localStorage para invitados
    useEffect(() => {
        const initCart = async () => {
            if (user) {
                await syncGuestCart(user.id);
                fetchCart();
            } else {
                const localCart = localStorage.getItem('guest_cart');
                if (localCart) {
                    setCartItems(JSON.parse(localCart));
                } else {
                    setCartItems([]);
                }
            }
        };
        initCart();
    }, [user, fetchCart, syncGuestCart]);

    // Guardar carrito en localStorage si es invitado
    useEffect(() => {
        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (product, size, quantity = 1) => {
        if (!user) {
            // Lógica para invitados: agregar al estado local
            const newItem = {
                id: Date.now(), // ID temporal para invitados
                product_id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                size,
                quantity
            };

            setCartItems(prev => {
                const existing = prev.find(item => item.product_id === product.id && item.size === size);
                if (existing) {
                    return prev.map(item =>
                        (item.product_id === product.id && item.size === size)
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prev, newItem];
            });
            setIsCartOpen(true);
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
        if (!user) {
            setCartItems(prev => prev.map(item =>
                item.id === cartItemId ? { ...item, quantity } : item
            ));
            return;
        }
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
        if (!user) {
            setCartItems(prev => prev.filter(item => item.id !== id));
            return;
        }
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
        if (!user) {
            setIsCartOpen(false);
            navigate('/login', { state: { returnTo: '/shop', checkoutAfterLogin: true } });
            return;
        }

        if (cartItems.length === 0) return;

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
