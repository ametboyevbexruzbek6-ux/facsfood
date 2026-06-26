const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- PRODUCT ROUTES ---
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM Products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, description, price, status, isTop } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const query = `INSERT INTO Products (name, description, price, image, status, isTop) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, description, price, image, status || 'Mavjud', isTop === 'true' || isTop === true ? 1 : 0], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, description, price, image, status, isTop });
    });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, description, price, status, isTop } = req.body;
    
    const isTopVal = isTop === 'true' || isTop === true ? 1 : 0;
    
    if (req.file) {
        const image = `/uploads/${req.file.filename}`;
        const query = `UPDATE Products SET name = ?, description = ?, price = ?, image = ?, status = ?, isTop = ? WHERE id = ?`;
        db.run(query, [name, description, price, image, status, isTopVal, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
    } else {
        const query = `UPDATE Products SET name = ?, description = ?, price = ?, status = ?, isTop = ? WHERE id = ?`;
        db.run(query, [name, description, price, status, isTopVal, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Products WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- ORDER ROUTES ---
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM Orders ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Retrieve order items
        db.all('SELECT * FROM OrderItems', [], (err, items) => {
             if (err) return res.status(500).json({ error: err.message });
             
             db.all('SELECT id, name FROM Products', [], (err, products) => {
                 const ordersWithItems = rows.map(order => {
                     const orderItems = items.filter(item => item.orderId === order.id).map(item => {
                         const product = products.find(p => p.id === item.productId);
                         return { ...item, productName: product ? product.name : "Noma'lum mahsulot" };
                     });
                     return { ...order, items: orderItems };
                 });
                 res.json(ordersWithItems);
             });
        });
    });
});

app.post('/api/orders', (req, res) => {
    const { customerName, phone, deliveryType, address, paymentType, totalAmount, items } = req.body;
    
    db.run(
        `INSERT INTO Orders (customerName, phone, deliveryType, address, paymentType, totalAmount) VALUES (?, ?, ?, ?, ?, ?)`,
        [customerName, phone, deliveryType, address, paymentType, totalAmount],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const orderId = this.lastID;
            
            if (items && items.length > 0) {
                const stmt = db.prepare('INSERT INTO OrderItems (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)');
                items.forEach(item => {
                    stmt.run([orderId, item.productId, item.quantity, item.price]);
                });
                stmt.finalize();
            }
            res.json({ orderId, status: 'Kutilmoqda' });
        }
    );
});

app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run('UPDATE Orders SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// --- DASHBOARD STATS ---
app.get('/api/stats', (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as total FROM Orders', [], (err, row) => {
        stats.totalOrders = row ? row.total : 0;
        db.get("SELECT COUNT(*) as pending FROM Orders WHERE status = 'Kutilmoqda'", [], (err, row) => {
            stats.pendingOrders = row ? row.pending : 0;
            // Revenue only from Yetkazildi orders, or all? Let's say all orders that are not bekor qilingan
            db.get("SELECT SUM(totalAmount) as totalRevenue FROM Orders WHERE status != 'Bekor qilingan'", [], (err, row) => {
                stats.totalRevenue = row && row.totalRevenue ? row.totalRevenue : 0;
                db.get("SELECT COUNT(*) as totalProducts FROM Products", [], (err, row) => {
                    stats.totalProducts = row ? row.totalProducts : 0;
                    res.json(stats);
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
