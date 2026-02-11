import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [userList, setUserList] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/users');
            const data = await res.json();
            setUserList(data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setMessage({ text: 'Usuario eliminado', type: 'success' });
            fetchUsers(); // Actualizar lista
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:3000/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAdmin, creatorRole: user.role })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setMessage({ text: 'Administrador creado con éxito', type: 'success' });
            setNewAdmin({ name: '', email: '', password: '' });
            fetchUsers(); // Actualizar lista
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Panel de Administración</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>Hola, {user.name}</span>
                    <button onClick={logout} className="btn" style={{ border: '1px solid var(--error)', color: 'var(--error)' }}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Gestión de Productos</h3>
                    <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>Añadir, editar o eliminar ropa del catálogo.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/products')}>Ir a Productos</button>
                </div>

                <div className="card">
                    <h3>Crear Nuevo Admin</h3>
                    <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>Dar acceso administrativo a otro usuario.</p>

                    {message.text && (
                        <div style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1rem',
                            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            color: message.type === 'error' ? 'var(--error)' : 'var(--success)'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleCreateAdmin}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input"
                                placeholder="Nombre"
                                value={newAdmin.name}
                                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                className="input"
                                placeholder="Email"
                                value={newAdmin.email}
                                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                className="input"
                                placeholder="Contraseña"
                                value={newAdmin.password}
                                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Crear Admin</button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Lista de Usuarios Registrados</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>ID</th>
                                <th style={{ padding: '0.5rem' }}>Nombre</th>
                                <th style={{ padding: '0.5rem' }}>Email</th>
                                <th style={{ padding: '0.5rem' }}>Rol</th>
                                <th style={{ padding: '0.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>{u.id}</td>
                                    <td style={{ padding: '0.5rem' }}>{u.name}</td>
                                    <td style={{ padding: '0.5rem' }}>{u.email}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            backgroundColor: u.role === 'admin' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="btn"
                                            style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--error)',
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Eliminar
                                        </button>
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
