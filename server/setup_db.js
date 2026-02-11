const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function setup() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'admin123',
    };

    console.log('--- STARTING POSTGRESQL SETUP ---');
    console.log(`Target Database: ${process.env.DB_NAME}`);
    console.log(`User: ${config.user}`);

    // Step 1: Connect to default 'postgres' database to check/create target DB
    const clientDefault = new Client({ ...config, database: 'postgres' });

    try {
        console.log('1. Connecting to PostgreSQL server...');
        await clientDefault.connect();
        console.log('   CONNECTED successfully to the server.');

        console.log(`2. Checking if database "${process.env.DB_NAME}" exists...`);
        const res = await clientDefault.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [process.env.DB_NAME]);

        if (res.rowCount === 0) {
            console.log(`   Database "${process.env.DB_NAME}" NOT found. Creating it now...`);
            await clientDefault.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log('   DATABASE created successfully.');
        } else {
            console.log(`   Database "${process.env.DB_NAME}" already exists.`);
        }
        await clientDefault.end();

        // Step 2: Connect to the new/existing database to verify tables
        console.log(`3. Connecting to "${process.env.DB_NAME}" to verify initialization...`);
        // We require the database.js to trigger the initDb() logic
        const db = require('./database');

        // Wait a bit for initDb to run (it's called at the end of database.js)
        setTimeout(async () => {
            try {
                const tables = await db.all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                console.log('   TABLES in database:', tables.map(t => t.table_name).join(', '));
                console.log('\n--- SETUP COMPLETED SUCCESSFULLY! ---');
                console.log('Now you can run "node server/migrate_data.js" to move your data.');
                process.exit(0);
            } catch (err) {
                console.error('   Error verifying tables:', err.message);
                process.exit(1);
            }
        }, 2000);

    } catch (err) {
        console.error('\n!!! CONNECTION FAILED !!!');
        console.error(`Error: ${err.message}`);
        console.log('\nTROUBLESHOOTING:');
        console.log('1. Verify your password in server/.env');
        console.log('2. Make sure PostgreSQL service is RUNNING.');
        console.log('3. If you do not know the password, check your installation notes.');
        await clientDefault.end().catch(() => { });
        process.exit(1);
    }
}

setup();
