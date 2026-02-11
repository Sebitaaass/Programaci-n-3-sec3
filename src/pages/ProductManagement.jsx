import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function ProductManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        sizes: '',
        stock: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);


    const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const toggleSize = (size) => {
        let currentSizes = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s !== '') : [];
        if (currentSizes.includes(size)) {
            currentSizes = currentSizes.filter(s => s !== size);
        } else {
            currentSizes.push(size);
        }
        setFormData({ ...formData, sizes: currentSizes.join(', ') });
    };
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products`);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const formDataUpload = new FormData();
        formDataUpload.append('image', imageFile);

        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formDataUpload
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
            return data.imageUrl;
        } catch (error) {
            console.error("Error uploading image", error);
            throw error;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const url = editingId
            ? `${API_BASE_URL}/api/products/${editingId}`
            : `${API_BASE_URL}/api/products`;

        const method = editingId ? 'PUT' : 'POST';

        try {
            let finalImageUrl = formData.image_url;

            // Si hay una nueva imagen seleccionada, subirla primero
            if (imageFile) {
                setMessage({ text: 'Subiendo imagen...', type: 'info' });
                const uploadedUrl = await uploadImage();
                finalImageUrl = `${API_BASE_URL}${uploadedUrl}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image_url: finalImageUrl })
            });


            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setMessage({
                text: editingId ? 'Producto actualizado' : 'Producto creado',
                type: 'success'
            });

            setFormData({ name: '', description: '', price: '', category: '', image_url: '', sizes: '', stock: '' });
            setImageFile(null);
            setImagePreview(null);
            setEditingId(null);
            fetchProducts();

        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || '',
            image_url: product.image_url || '',
            sizes: product.sizes || '',
            stock: product.stock || 0
        });
        setEditingId(product.id);
        setImagePreview(product.image_url);
        setImageFile(null);
        window.scrollTo(0, 0);
    };


    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error eliminando producto');

            setMessage({ text: 'Producto eliminado', type: 'success' });
            fetchProducts();
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleCancelEdit = () => {
        setFormData({ name: '', description: '', price: '', category: '', image_url: '', sizes: '', stock: '' });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
    };


    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Gestión de Productos</h2>
                <button onClick={() => navigate('/admin')} className="btn">
                    Volver al Dashboard
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>

                {message.text && (
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1rem',
                        marginTop: '1rem',
                        backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: message.type === 'error' ? 'var(--error)' : 'var(--success)'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div className="input-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Precio</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Categoría</label>
                        <select
                            className="input"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar categoría...</option>
                            <option value="hoodies">Sudaderas / Hoodies</option>
                            <option value="jackets">Chaquetas / Jackets</option>
                            <option value="pantalones">Pantalones</option>
                            <option value="polos">Polos</option>
                            <option value="camisetas">Camisetas</option>
                            <option value="gorras">Gorras</option>
                            <option value="accesorios">Accesorios</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            className="input"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Tallas Disponibles</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {availableSizes.map(size => {
                                const isSelected = formData.sizes.split(',').map(s => s.trim()).includes(size);
                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleSize(size)}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid',
                                            borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                                            backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                                            color: isSelected ? 'white' : 'var(--text-primary)',
                                            fontWeight: isSelected ? 'bold' : 'normal',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Haz clic para seleccionar o quitar tallas.
                        </p>
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Imagen del Producto</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                backgroundColor: 'var(--surface)'
                            }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem', opacity: 0.3 }}>🖼️</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="btn" style={{ display: 'inline-block', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                    {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                                </label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    O pega una URL directamente abajo:
                                </p>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        setImagePreview(e.target.value);
                                        setImageFile(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Descripción</label>
                        <textarea
                            className="input"
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {editingId ? 'Actualizar Producto' : 'Crear Producto'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="btn" style={{ flex: 1, backgroundColor: 'var(--surface)' }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <h3>Inventario Actual</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>Img</th>
                                <th style={{ padding: '0.5rem' }}>Producto</th>
                                <th style={{ padding: '0.5rem' }}>Precio</th>
                                <th style={{ padding: '0.5rem' }}>Stock</th>
                                <th style={{ padding: '0.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                        {p.image_url && <img src={p.image_url} alt="min" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.category}</div>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>${p.price}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.stock}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => navigate(`/shop?category=${p.category}`)}
                                                className="btn"
                                                style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--accent)', color: 'white' }}
                                            >
                                                Ver en tienda 👁️
                                            </button>
                                            <button onClick={() => handleEdit(p)} className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>Editar</button>
                                            <button onClick={() => handleDelete(p.id)} className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: 'var(--error)' }}>X</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
