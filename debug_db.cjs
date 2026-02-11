const sqlite3 = require('./server/node_modules/sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'server/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    console.log('--- Attempting Migration ---');
    db.run("ALTER TABLE products ADD COLUMN sizes TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "sizes" already exists.');
            } else {
                console.error('Migration error:', err.message);
            }
        } else {
            console.log('Column "sizes" added successfully.');
        }

        console.log('\n--- Final Column Names: products ---');
        db.all("PRAGMA table_info(products)", (err, rows) => {
            if (err) console.error(err);
            else {
                const columns = rows.map(r => r.name);
                console.log('Columns:', columns.join(', '));
            }
            db.close();
        });
    });
});
