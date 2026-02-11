const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'antime_db',
});

// Helper for queries to maintain some compatibility or ease of use
const db = {
    query: (text, params) => pool.query(text, params),
    // Compatibility wrappers for common sqlite3 patterns if needed
    run: (text, params) => pool.query(text, params),
    get: (text, params) => pool.query(text, params).then(res => res.rows[0]),
    all: (text, params) => pool.query(text, params).then(res => res.rows),
};

async function initDb() {
    try {
        // Crear tabla de usuarios
        await db.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'client',
            description TEXT
        )`);

        // Migration: add description column if it doesn't exist
        try {
            await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT`);
        } catch (e) {
            console.log("Column description already exists or error adding it:", e.message);
        }

        // Crear tabla de productos
        await db.query(`CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            category TEXT,
            image_url TEXT,
            sizes TEXT,
            stock INTEGER DEFAULT 0
        )`);

        // Crear tabla de carrito
        await db.query(`CREATE TABLE IF NOT EXISTS cart_items (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            size TEXT,
            quantity INTEGER DEFAULT 1
        )`);

        // Crear tabla de pedidos
        await db.query(`CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            total DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Crear tabla de items de pedido
        await db.query(`CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            size TEXT,
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL
        )`);

        // Crear tabla de direcciones
        await db.query(`CREATE TABLE IF NOT EXISTS addresses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT,
            zip_code TEXT,
            country TEXT DEFAULT 'España',
            is_default INTEGER DEFAULT 0
        )`);

        // Seed Admin User
        const adminEmail = 'admin@antime.com';
        const adminPass = 'admin123';
        const adminName = 'Admin Principal';

        const adminChecked = await db.get("SELECT id FROM users WHERE email = $1", [adminEmail]);
        if (!adminChecked) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(adminPass, salt);
            await db.run("INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')",
                [adminName, adminEmail, hash]);
            console.log("Usuario Administrador creado por defecto: admin@antime.com / admin123");
        }

        console.log('PostgreSQL database initialized.');
    } catch (err) {
        console.error("Error during database initialization:", err);
    }
}

initDb();

module.exports = db;
