const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    };

    try {
        console.log('--- Testing with specific database:', process.env.DB_NAME, '---');
        const client = new Client({ ...config, database: process.env.DB_NAME });
        await client.connect();
        console.log('Successfully connected to', process.env.DB_NAME);
        await client.end();
    } catch (err) {
        console.error('Failed to connect to', process.env.DB_NAME, ':', err.message);

        console.log('\n--- Testing with default "postgres" database ---');
        try {
            const clientDefault = new Client({ ...config, database: 'postgres' });
            await clientDefault.connect();
            console.log('Successfully connected to "postgres" database! Credentials are correct.');

            const res = await clientDefault.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [process.env.DB_NAME]);
            if (res.rowCount === 0) {
                console.log(`\n[IMPORTANT] The database "${process.env.DB_NAME}" does NOT exist. You need to create it.`);
            } else {
                console.log(`\nThe database "${process.env.DB_NAME}" exists. Check permissions.`);
            }
            await clientDefault.end();
        } catch (errDefault) {
            console.error('Failed to connect to "postgres" database as well:', errDefault.message);
            console.log('\nThe password for user "' + config.user + '" in .env is definitely incorrect.');
        }
    }
}

testConnection();
