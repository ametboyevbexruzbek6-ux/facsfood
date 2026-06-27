const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Often required for managed DBs like Supabase
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Baza ulanishida xatolik (Supabase):', err.message);
  } else {
    console.log('Supabase (PostgreSQL) bazasiga ulanish muvaffaqiyatli.');
  }
});

// Jadvallarni yaratish
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price INTEGER NOT NULL,
                image TEXT,
                status TEXT DEFAULT 'Mavjud',
                "isTop" BOOLEAN DEFAULT false
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id SERIAL PRIMARY KEY,
                "customerName" TEXT NOT NULL,
                phone TEXT NOT NULL,
                "deliveryType" TEXT NOT NULL,
                address TEXT,
                "paymentType" TEXT NOT NULL,
                "totalAmount" INTEGER NOT NULL,
                status TEXT DEFAULT 'Kutilmoqda',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id SERIAL PRIMARY KEY,
                "orderId" INTEGER REFERENCES Orders(id),
                "productId" INTEGER REFERENCES Products(id),
                quantity INTEGER NOT NULL,
                price INTEGER NOT NULL
            );
        `);
        console.log('Jadvallar muvaffaqiyatli tekshirildi/yaratildi.');
    } catch (err) {
        console.error('Jadvallarni yaratishda xatolik:', err.message);
    }
};

initDb();

module.exports = {
    query: (text, params) => pool.query(text, params)
};
