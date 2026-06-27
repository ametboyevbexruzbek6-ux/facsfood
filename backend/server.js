const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');
const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// --- TELEGRAM BOT SOZLAMALARI ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8898043020:AAFsCUU4GAyfkbAWLvDE2yLo6NOd1HgPtBI"; 
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7396412793";

const sendTelegramMessage = (message) => {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "SIZNING_BOT_TOKENINGIZ_SHU_YERGA") return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
    }).catch(err => console.error("Telegram bot xatosi:", err));
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- SUPABASE SETUP ---
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://xyz.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'xyz'
);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToSupabase = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype
        });
        
    if (error) {
        console.error("Supabase upload error:", error);
        return null;
    }
    
    const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
        
    return publicUrlData.publicUrl;
};

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, status, isTop } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToSupabase(req.file);
        }
        
        const isTopVal = isTop === 'true' || isTop === true;
        const query = `INSERT INTO Products (name, description, price, image, status, "isTop") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const result = await db.query(query, [name, description, price, imageUrl, status || 'Mavjud', isTopVal]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, status, isTop } = req.body;
        const isTopVal = isTop === 'true' || isTop === true;
        
        let query, params;
        if (req.file) {
            const imageUrl = await uploadToSupabase(req.file);
            query = `UPDATE Products SET name = $1, description = $2, price = $3, image = $4, status = $5, "isTop" = $6 WHERE id = $7 RETURNING *`;
            params = [name, description, price, imageUrl, status, isTopVal, id];
        } else {
            query = `UPDATE Products SET name = $1, description = $2, price = $3, status = $4, "isTop" = $5 WHERE id = $6 RETURNING *`;
            params = [name, description, price, status, isTopVal, id];
        }
        
        const result = await db.query(query, params);
        res.json({ updated: result.rowCount, product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM Products WHERE id = $1', [req.params.id]);
        res.json({ deleted: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ORDER ROUTES ---
app.get('/api/orders', async (req, res) => {
    try {
        const ordersRes = await db.query('SELECT * FROM Orders ORDER BY "createdAt" DESC');
        const itemsRes = await db.query('SELECT * FROM OrderItems');
        const productsRes = await db.query('SELECT id, name FROM Products');
        
        const orders = ordersRes.rows;
        const items = itemsRes.rows;
        const products = productsRes.rows;
        
        const ordersWithItems = orders.map(order => {
            const orderItems = items.filter(item => item.orderId === order.id).map(item => {
                const product = products.find(p => p.id === item.productId);
                return { ...item, productName: product ? product.name : "Noma'lum mahsulot" };
            });
            return { ...order, items: orderItems };
        });
        
        res.json(ordersWithItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, phone, deliveryType, address, paymentType, totalAmount, items } = req.body;
        
        const orderRes = await db.query(
            `INSERT INTO Orders ("customerName", phone, "deliveryType", address, "paymentType", "totalAmount") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [customerName, phone, deliveryType, address, paymentType, totalAmount]
        );
        const orderId = orderRes.rows[0].id;
        
        if (items && items.length > 0) {
            for (const item of items) {
                await db.query(
                    'INSERT INTO OrderItems ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4)',
                    [orderId, item.productId, item.quantity, item.price]
                );
            }
            
            const productsRes = await db.query('SELECT id, name FROM Products');
            const products = productsRes.rows;
            let orderDetails = items.map(item => {
                const prod = products.find(p => p.id === item.productId);
                return `▪️ ${prod ? prod.name : "Taom"} x ${item.quantity} ta - ${item.price} so'm`;
            }).join('\n');
            
            const message = `
🔔 <b>YANGI BUYURTMA #${orderId}</b>

👤 <b>Mijoz:</b> ${customerName}
📞 <b>Tel:</b> ${phone}
🚚 <b>Tur:</b> ${deliveryType}
📍 <b>Manzil:</b> ${address || '-'}
💳 <b>To'lov turi:</b> ${paymentType}

🛒 <b>Buyurtmalar:</b>
${orderDetails}

💰 <b>Umumiy summa:</b> ${totalAmount} so'm
`;
            sendTelegramMessage(message);
        } else {
             const message = `
🔔 <b>YANGI BUYURTMA #${orderId}</b>
👤 <b>Mijoz:</b> ${customerName}
📞 <b>Tel:</b> ${phone}
💰 <b>Umumiy summa:</b> ${totalAmount} so'm
`;
             sendTelegramMessage(message);
        }
        
        res.json({ orderId, status: 'Kutilmoqda' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await db.query('UPDATE Orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ updated: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD STATS ---
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {};
        const totalOrdersRes = await db.query('SELECT COUNT(*) as total FROM Orders');
        stats.totalOrders = parseInt(totalOrdersRes.rows[0].total) || 0;
        
        const pendingOrdersRes = await db.query("SELECT COUNT(*) as pending FROM Orders WHERE status = 'Kutilmoqda'");
        stats.pendingOrders = parseInt(pendingOrdersRes.rows[0].pending) || 0;
        
        const totalRevenueRes = await db.query("SELECT SUM(\"totalAmount\") as totalrevenue FROM Orders WHERE status != 'Bekor qilingan'");
        stats.totalRevenue = parseInt(totalRevenueRes.rows[0].totalrevenue) || 0;
        
        const totalProductsRes = await db.query("SELECT COUNT(*) as totalproducts FROM Products");
        stats.totalProducts = parseInt(totalProductsRes.rows[0].totalproducts) || 0;
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
