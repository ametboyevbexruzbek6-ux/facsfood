const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Baza ulanishida xatolik:', err.message);
    } else {
        console.log('SQLite bazasiga ulanish muvaffaqiyatli.');
    }
});

// Jadvallarni yaratish
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            image TEXT,
            status TEXT DEFAULT 'Mavjud',
            isTop BOOLEAN DEFAULT 0
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerName TEXT NOT NULL,
            phone TEXT NOT NULL,
            deliveryType TEXT NOT NULL,
            address TEXT,
            paymentType TEXT NOT NULL,
            totalAmount INTEGER NOT NULL,
            status TEXT DEFAULT 'Kutilmoqda',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS OrderItems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER,
            productId INTEGER,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            FOREIGN KEY(orderId) REFERENCES Orders(id),
            FOREIGN KEY(productId) REFERENCES Products(id)
        )
    `);
});

module.exports = db;
