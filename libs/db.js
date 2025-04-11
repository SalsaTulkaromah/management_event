// libs/db.js

const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(), // 🔥 tambahkan ini
};
