const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Crear tabla de usuarios
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'client'
    )`, (err) => {
            if (err) {
                console.error("Error creating table:", err);
                return;
            }

            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                category TEXT,
                image_url TEXT,
                sizes TEXT,
                stock INTEGER DEFAULT 0
            )`, (err) => {
                if (err) console.error("Error creating products table:", err);

                // Migración simple: intentar agregar la columna sizes si no existe
                db.run("ALTER TABLE products ADD COLUMN sizes TEXT", (err) => {
                    if (err && !err.message.includes("duplicate column name")) {
                        console.error("Error adding sizes column:", err.message);
                    }
                });
            });

            // Crear tabla de carrito
            db.run(`CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                size TEXT,
                quantity INTEGER DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )`, (err) => {
                if (err) console.error("Error creating cart_items table:", err);
            });

            // Crear tabla de pedidos
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total REAL NOT NULL,
                status TEXT DEFAULT 'completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Error creating orders table:", err);
            });

            // Crear tabla de items de pedido
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                size TEXT,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )`, (err) => {
                if (err) console.error("Error creating order_items table:", err);
            });

            // Crear tabla de direcciones
            db.run(`CREATE TABLE IF NOT EXISTS addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                street TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT,
                zip_code TEXT,
                country TEXT DEFAULT 'España',
                is_default INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Error creating addresses table:", err);
            });

            // Seed Admin User
            const adminEmail = 'admin@antime.com';
            const adminPass = 'admin123';
            const adminName = 'Admin Principal';

            db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
                if (err) {
                    console.error("Error checking admin:", err);
                    return;
                }
                if (!row) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(adminPass, salt);
                    db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
                        [adminName, adminEmail, hash],
                        (err) => {
                            if (err) console.error("Error creating admin seed:", err);
                            else console.log("Usuario Administrador creado por defecto: admin@antime.com / admin123");
                        });
                }
            });
        });
    });
}

module.exports = db;
