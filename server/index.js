const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Opcional si queremos usar tokens, por ahora usaremos respuesta simple
const db = require('./database');
const multer = require('multer');
const fs = require('fs');

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve(__dirname, 'public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'super_secret_key_antime'; // En prod iría en .env

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://sec3.onrender.com'
        ];
        if (allowed.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
            return callback(null, true);
        }
        return callback(null, true); // Permisivo en desarrollo
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));



// Endpoint para subir imágenes
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    // Retornamos la URL relativa para guardar en la DB
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Endpoint de Registro (Público - Solo Clientes)

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const query = "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'client')";

    db.run(query, [name, email, hash], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            return res.status(500).json({ error: err.message });
        }

        // Auto-login tras registro
        const user = { id: this.lastID, name, email, role: 'client' };
        res.json({ message: 'Registro exitoso', user });
    });
});

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        // Cambio solicitado: Mensaje específico si el correo no existe
        if (!user) {
            return res.status(404).json({
                error: 'No existe cuenta afiliada a Antime con este correo electrónico. Debe registrarse.'
            });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' }); // Mantenemos este distinto o genérico según preferencia, pero el requerimiento era específico para "no existe"
        }

        // Retornamos info del usuario (sin el hash)
        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({ message: 'Login exitoso', user: userInfo });
    });
});

// Endpoint Protegido: Crear Admin (Solo admisible si se solicitara autenticación real, 
// por simplicidad ahora validamos que quien hace la petición sea admin en el frontend, 
// o podríamos pedir un 'admin_secret' en el body)
app.post('/api/admin/create', (req, res) => {
    const { name, email, password, creatorRole } = req.body;

    // Validación básica de seguridad (en una app real usaríamos middleware de JWT)
    if (creatorRole !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const query = "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')";

    db.run(query, [name, email, hash], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Administrador creado exitosamente' });
    });
});

app.get('/api/users', (req, res) => {
    db.all("SELECT id, name, email, role FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Endpoint Protegido: Eliminar usuario
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    // Validación: Prevenir eliminar al admin principal
    // Primero buscamos el usuario para ver si es el admin seed
    db.get("SELECT email FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (row.email === 'admin@antime.com') {
            return res.status(403).json({ error: 'No se puede eliminar al Administrador Principal' });
        }

        db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Usuario eliminado correctamente' });
        });
    });
});

// -----------------------------------------
// Endpoints de Productos (CRUD)
// -----------------------------------------

// GET: Listar todos los productos
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Crear un nuevo producto
app.post('/api/products', (req, res) => {
    const { name, description, price, category, image_url, sizes, stock } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }

    const query = `INSERT INTO products (name, description, price, category, image_url, sizes, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, description, price, category, image_url, sizes, stock || 0];

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            message: 'Producto creado exitosamente',
            id: this.lastID,
            product: { id: this.lastID, name, description, price, category, image_url, sizes, stock }
        });
    });
});

// PUT: Actualizar un producto
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image_url, sizes, stock } = req.body;

    // Construimos la query dinámicamente o simple update de todo
    const query = `
        UPDATE products 
        SET name = ?, description = ?, price = ?, category = ?, image_url = ?, sizes = ?, stock = ?
        WHERE id = ?
    `;
    const params = [name, description, price, category, image_url, sizes, stock, id];

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado correctamente' });
    });
});

// DELETE: Eliminar un producto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

// -----------------------------------------
// Endpoints de Carrito (Shopping Cart)
// -----------------------------------------

// GET: Obtener items del carrito
app.get('/api/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT c.*, p.name, p.price, p.image_url 
        FROM cart_items c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    `;
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Agregar item al carrito
app.post('/api/cart/add', (req, res) => {
    const { userId, productId, size, quantity } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'UserID y ProductID son obligatorios' });
    }

    // Verificar si ya existe el mismo producto con la misma talla
    db.get("SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?",
        [userId, productId, size], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (row) {
                // Update quantity
                const newQuantity = row.quantity + (quantity || 1);
                db.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQuantity, row.id], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Cantidad actualizada', id: row.id });
                });
            } else {
                // Insert new item
                const query = "INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)";
                db.run(query, [userId, productId, size, quantity || 1], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Producto agregado al carrito', id: this.lastID });
                });
            }
        });
});

// POST: Actualizar cantidad manualmente
app.post('/api/cart/update', (req, res) => {
    const { cartItemId, quantity } = req.body;
    db.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, cartItemId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cantidad actualizada' });
    });
});

// DELETE: Eliminar item del carrito
app.delete('/api/cart/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM cart_items WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item eliminado del carrito' });
    });
});

// -----------------------------------------
// Endpoint de Checkout (Simulado)
// -----------------------------------------
// -----------------------------------------
// Endpoints de Perfil (Pedidos, Direcciones, Sesiones)
// -----------------------------------------

// GET: Historial de pedidos de un usuario
app.get('/api/orders/user/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT o.*, 
               (SELECT GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')', ', ') 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = o.id) as items_summary
        FROM orders o 
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `;
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET: Direcciones de un usuario
app.get('/api/addresses/user/:userId', (req, res) => {
    const { userId } = req.params;
    db.all("SELECT * FROM addresses WHERE user_id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Agregar dirección
app.post('/api/addresses', (req, res) => {
    const { userId, street, city, state, zipCode, country, isDefault } = req.body;
    const query = "INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.run(query, [userId, street, city, state, zipCode, country || 'España', isDefault ? 1 : 0], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Dirección guardada', id: this.lastID });
    });
});

// POST: Cerrar todas las sesiones (Simulado)
app.post('/api/logout-all', (req, res) => {
    // En una app real invalidaríamos todos los tokens del usuario en la base de datos
    res.json({ message: 'Todas las sesiones han sido cerradas correctamente (simulación)' });
});

app.post('/api/checkout', (req, res) => {
    const { userId, items, total } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    db.serialize(() => {
        // 1. Crear la orden
        const orderQuery = "INSERT INTO orders (user_id, total) VALUES (?, ?)";
        db.run(orderQuery, [userId, total], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const orderId = this.lastID;

            // 2. Crear los order_items
            const itemQuery = "INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)";
            const stmt = db.prepare(itemQuery);

            items.forEach(item => {
                stmt.run([orderId, item.product_id, item.size, item.quantity, item.price]);
            });

            stmt.finalize();

            // 3. Limpiar el carrito del usuario
            db.run("DELETE FROM cart_items WHERE user_id = ?", [userId], (err) => {
                if (err) console.error("Error clearing cart after checkout:", err);
                res.json({ message: 'Compra realizada con éxito', orderId });
            });
        });
    });
});

// Servir frontend compilado en producción
const frontendPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
