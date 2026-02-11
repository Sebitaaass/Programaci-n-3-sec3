const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbPath = path.resolve(__dirname, 'database.sqlite');
const sqliteDb = new sqlite3.Database(dbPath);

const pgClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'antime_db',
});

async function migrate() {
    try {
        await pgClient.connect();
        console.log('Connected to PostgreSQL.');

        // Helper to get all from SQLite
        const getAll = (query) => new Promise((resolve, reject) => {
            sqliteDb.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 1. Migrate Users
        console.log('Migrating users...');
        const users = await getAll("SELECT * FROM users");
        for (const user of users) {
            // Check if user exists (admin might be there already)
            const check = await pgClient.query("SELECT id FROM users WHERE email = $1", [user.email]);
            if (check.rowCount === 0) {
                await pgClient.query(
                    "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
                    [user.id, user.name, user.email, user.password_hash, user.role]
                );
            }
        }
        await pgClient.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");

        // 2. Migrate Products
        console.log('Migrating products...');
        const products = await getAll("SELECT * FROM products");
        for (const p of products) {
            await pgClient.query(
                "INSERT INTO products (id, name, description, price, category, image_url, sizes, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [p.id, p.name, p.description, p.price, p.category, p.image_url, p.sizes, p.stock]
            );
        }
        await pgClient.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");

        // 3. Migrate Cart Items
        console.log('Migrating cart items...');
        const cartItems = await getAll("SELECT * FROM cart_items");
        for (const item of cartItems) {
            await pgClient.query(
                "INSERT INTO cart_items (id, user_id, product_id, size, quantity) VALUES ($1, $2, $3, $4, $5)",
                [item.id, item.user_id, item.product_id, item.size, item.quantity]
            );
        }
        await pgClient.query("SELECT setval('cart_items_id_seq', (SELECT MAX(id) FROM cart_items))");


        // 4. Migrate Orders
        console.log('Migrating orders...');
        const orders = await getAll("SELECT * FROM orders");
        for (const o of orders) {
            await pgClient.query(
                "INSERT INTO orders (id, user_id, total, status, created_at) VALUES ($1, $2, $3, $4, $5)",
                [o.id, o.user_id, o.total, o.status, o.created_at]
            );
        }
        await pgClient.query("SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders))");

        // 5. Migrate Order Items
        console.log('Migrating order items...');
        const orderItems = await getAll("SELECT * FROM order_items");
        for (const oi of orderItems) {
            await pgClient.query(
                "INSERT INTO order_items (id, order_id, product_id, size, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)",
                [oi.id, oi.order_id, oi.product_id, oi.size, oi.quantity, oi.price]
            );
        }
        await pgClient.query("SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items))");

        // 6. Migrate Addresses
        console.log('Migrating addresses...');
        const addresses = await getAll("SELECT * FROM addresses");
        for (const a of addresses) {
            await pgClient.query(
                "INSERT INTO addresses (id, user_id, street, city, state, zip_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [a.id, a.user_id, a.street, a.city, a.state, a.zip_code, a.country, a.is_default]
            );
        }
        await pgClient.query("SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses))");

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        sqliteDb.close();
        await pgClient.end();
    }
}

migrate();
