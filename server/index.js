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

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const query = "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'client') RETURNING id";

    try {
        const result = await db.query(query, [name, email, hash]);
        const newUser = { id: result.rows[0].id, name, email, role: 'client' };
        res.json({ message: 'Registro exitoso', user: newUser });
    } catch (err) {
        if (err.message.includes('unique constraint') || err.code === '23505') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.get("SELECT * FROM users WHERE email = $1", [email]);

        if (!user) {
            return res.status(404).json({
                error: 'No existe cuenta afiliada a Antime con este correo electrónico. Debe registrarse.'
            });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const userInfo = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({ message: 'Login exitoso', user: userInfo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Protegido: Crear Admin (Solo admisible si se solicitara autenticación real, 
// por simplicidad ahora validamos que quien hace la petición sea admin en el frontend, 
// o podríamos pedir un 'admin_secret' en el body)
app.post('/api/admin/create', async (req, res) => {
    const { name, email, password, creatorRole } = req.body;

    if (creatorRole !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const query = "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')";

    try {
        await db.run(query, [name, email, hash]);
        res.json({ message: 'Administrador creado exitosamente' });
    } catch (err) {
        if (err.message.includes('unique constraint') || err.code === '23505') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const rows = await db.all("SELECT id, name, email, role FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint Protegido: Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const row = await db.get("SELECT email FROM users WHERE id = $1", [id]);
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (row.email === 'admin@antime.com') {
            return res.status(403).json({ error: 'No se puede eliminar al Administrador Principal' });
        }

        await db.run("DELETE FROM users WHERE id = $1", [id]);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Actualizar descripción del usuario
app.put('/api/users/:id/description', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    try {
        const result = await db.run("UPDATE users SET description = $1 WHERE id = $2", [description, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Descripción actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------
// Endpoints de Productos (CRUD)
// -----------------------------------------

// GET: Listar todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM products");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Crear un nuevo producto
app.post('/api/products', async (req, res) => {
    const { name, description, price, category, image_url, sizes, stock } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }

    const query = `INSERT INTO products (name, description, price, category, image_url, sizes, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    const params = [name, description, price, category, image_url, sizes, stock || 0];

    try {
        const result = await db.query(query, params);
        const productId = result.rows[0].id;
        res.json({
            message: 'Producto creado exitosamente',
            id: productId,
            product: { id: productId, name, description, price, category, image_url, sizes, stock }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Actualizar un producto
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image_url, sizes, stock } = req.body;

    const query = `
        UPDATE products 
        SET name = $1, description = $2, price = $3, category = $4, image_url = $5, sizes = $6, stock = $7
        WHERE id = $8
    `;
    const params = [name, description, price, category, image_url, sizes, stock, id];

    try {
        const result = await db.run(query, params);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run("DELETE FROM products WHERE id = $1", [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------
// Endpoints de Carrito (Shopping Cart)
// -----------------------------------------

// GET: Obtener items del carrito
app.get('/api/cart/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT c.*, p.name, p.price, p.image_url 
        FROM cart_items c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = $1
    `;
    try {
        const rows = await db.all(query, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Agregar item al carrito
app.post('/api/cart/add', async (req, res) => {
    const { userId, productId, size, quantity } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ error: 'UserID y ProductID son obligatorios' });
    }

    try {
        const row = await db.get("SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3",
            [userId, productId, size]);

        if (row) {
            const newQuantity = row.quantity + (quantity || 1);
            await db.run("UPDATE cart_items SET quantity = $1 WHERE id = $2", [newQuantity, row.id]);
            res.json({ message: 'Cantidad actualizada', id: row.id });
        } else {
            const query = "INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4) RETURNING id";
            const result = await db.query(query, [userId, productId, size, quantity || 1]);
            res.json({ message: 'Producto agregado al carrito', id: result.rows[0].id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Actualizar cantidad manualmente
app.post('/api/cart/update', async (req, res) => {
    const { cartItemId, quantity } = req.body;
    try {
        await db.run("UPDATE cart_items SET quantity = $1 WHERE id = $2", [quantity, cartItemId]);
        res.json({ message: 'Cantidad actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Eliminar item del carrito
app.delete('/api/cart/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM cart_items WHERE id = $1", [id]);
        res.json({ message: 'Item eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------
// Endpoint de Checkout (Simulado)
// -----------------------------------------
// -----------------------------------------
// Endpoints de Perfil (Pedidos, Direcciones, Sesiones)
// -----------------------------------------

// GET: Historial de pedidos de un usuario
app.get('/api/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;
    // Note: GROUP_CONCAT is SQLite specific. PostgreSQL uses string_agg.
    const query = `
        SELECT o.*, 
               (SELECT string_agg(p.name || ' (x' || oi.quantity || ')', ', ') 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = o.id) as items_summary
        FROM orders o 
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
    `;
    try {
        const rows = await db.all(query, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Direcciones de un usuario
app.get('/api/addresses/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const rows = await db.all("SELECT * FROM addresses WHERE user_id = $1", [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Agregar dirección
app.post('/api/addresses', async (req, res) => {
    const { userId, street, city, state, zipCode, country, isDefault } = req.body;
    const query = "INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
    try {
        const result = await db.query(query, [userId, street, city, state, zipCode, country || 'España', isDefault ? 1 : 0]);
        res.json({ message: 'Dirección guardada', id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Cerrar todas las sesiones (Simulado)
app.post('/api/logout-all', (req, res) => {
    // En una app real invalidaríamos todos los tokens del usuario en la base de datos
    res.json({ message: 'Todas las sesiones han sido cerradas correctamente (simulación)' });
});

app.post('/api/checkout', async (req, res) => {
    const { userId, items, total } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    try {
        // 1. Crear la orden
        const orderQuery = "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id";
        const orderResult = await db.query(orderQuery, [userId, total]);
        const orderId = orderResult.rows[0].id;

        // 2. Crear los order_items
        const itemQuery = "INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES ($1, $2, $3, $4, $5)";

        for (const item of items) {
            await db.run(itemQuery, [orderId, item.product_id, item.size, item.quantity, item.price]);
        }

        // 3. Limpiar el carrito del usuario
        await db.run("DELETE FROM cart_items WHERE user_id = $1", [userId]);

        res.json({ message: 'Compra realizada con éxito', orderId });
    } catch (err) {
        console.error("Error during checkout:", err);
        res.status(500).json({ error: err.message });
    }
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
