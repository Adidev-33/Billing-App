const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors()); 
app.use(express.json({ limit: '10mb' }));


const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // <-- Now loaded securely
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API Endpoints ---

app.get('/api/items', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM items ORDER BY item_name');
        res.json(rows);
    } catch (e) {
        console.error("Error fetching items:", e);
        res.status(500).json({ message: 'Error fetching items', error: e.message });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;
        const [r] = await dbPool.query(
            'INSERT INTO items (item_name, item_description) VALUES (?, ?)',
            [name, description || '']
        );
        res.status(201).json({ id: r.insertId, name, description });
    } catch (e) {
        console.error("Error adding item:", e);
        res.status(500).json({ message: 'Error adding item', error: e.message });
    }
});

app.put('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Item name cannot be empty.' });
        }
        const [result] = await dbPool.query(
            'UPDATE items SET item_name = ?, item_description = ? WHERE item_id = ?',
            [name, description || '', id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.status(200).json({ message: 'Item updated successfully.' });
    } catch (e) {
        console.error("Error updating item:", e);
        res.status(500).json({ message: 'Error updating item', error: e.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        await dbPool.query('DELETE FROM items WHERE item_id = ?', [req.params.id]);
        res.status(200).json({ message: 'Item deleted.' });
    } catch (e) {
        console.error("Error deleting item:", e);
        res.status(500).json({ message: 'Error deleting item', error: e.message });
    }
});

app.get('/api/materials', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM materials ORDER BY material_name');
        res.json(rows);
    } catch (e) {
        console.error("Error fetching materials:", e);
        res.status(500).json({ message: 'Error fetching materials', error: e.message });
    }
});

app.post('/api/materials', async (req, res) => {
    try {
        const { name } = req.body;
        const [r] = await dbPool.query(
            'INSERT INTO materials (material_name) VALUES (?)',
            [name]
        );
        res.status(201).json({ id: r.insertId, name });
    } catch (e) {
        console.error("Error adding material:", e);
        res.status(500).json({ message: 'Error adding material', error: e.message });
    }
});

app.put('/api/materials/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Material name cannot be empty.' });
        }
        const [result] = await dbPool.query(
            'UPDATE materials SET material_name = ? WHERE material_id = ?',
            [name, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Material not found.' });
        }
        res.status(200).json({ message: 'Material updated successfully.' });
    } catch (e) {
        console.error("Error updating material:", e);
        res.status(500).json({ message: 'Error updating material', error: e.message });
    }
});

app.delete('/api/materials/:id', async (req, res) => {
    try {
        await dbPool.query('DELETE FROM materials WHERE material_id = ?', [req.params.id]);
        res.status(200).json({ message: 'Material deleted.' });
    } catch (e) {
        console.error("Error deleting material:", e);
        res.status(500).json({ message: 'Error deleting material', error: e.message });
    }
});

app.get('/api/rates', async (req, res) => {
    try {
        const sql = `
            SELECT r.rate_id, r.rate_per_sqcm, r.uom,
                   i.item_id, i.item_name,
                   m.material_id, m.material_name
            FROM rates r
            JOIN items i ON r.item_id = i.item_id
            JOIN materials m ON r.material_id = m.material_id
            ORDER BY i.item_name, m.material_name, r.uom
        `;
        const [rows] = await dbPool.query(sql);
        res.json(rows);
    } catch (e) {
        console.error("Error fetching rates:", e);
        res.status(500).json({ message: 'Error fetching rates', error: e.message });
    }
});

app.get('/api/rate', async (req, res) => {
    try {
        const { itemId, materialId, uom } = req.query;
        if (!itemId || !materialId || !uom) {
            return res.status(400).json({ message: 'itemId, materialId, and uom are required.' });
        }
        const sql = `
            SELECT r.rate_per_sqcm, i.item_name, i.item_description, m.material_name, r.uom
            FROM rates r
            JOIN items i ON r.item_id = i.item_id
            JOIN materials m ON r.material_id = m.material_id
            WHERE r.item_id = ? AND r.material_id = ? AND r.uom = ?
        `;
        const [rows] = await dbPool.query(sql, [itemId, materialId, uom]);
        if (rows.length === 0) {
            return res.status(404).json({ message: `Rate not found for this combination (UOM: ${uom}).` });
        }
        res.json(rows[0]);
    } catch (e) {
        console.error("Error fetching single rate:", e);
        res.status(500).json({ message: 'Error fetching rate', error: e.message });
    }
});

app.post('/api/rates', async (req, res) => {
    try {
        const { itemId, materialId, rate, uom } = req.body;
        const sql = `
            INSERT INTO rates (item_id, material_id, uom, rate_per_sqcm)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE rate_per_sqcm = VALUES(rate_per_sqcm)
        `;
        await dbPool.query(sql, [itemId, materialId, uom, rate]);
        res.status(201).json({ message: 'Rate saved successfully.' });
    } catch (e) {
        console.error("Error saving rate:", e);
        res.status(500).json({ message: 'Error saving rate', error: e.message });
    }
});

app.put('/api/rates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rate } = req.body;
        if (!rate || isNaN(parseFloat(rate))) {
            return res.status(400).json({ message: 'A valid rate value is required.' });
        }
        const [result] = await dbPool.query(
            'UPDATE rates SET rate_per_sqcm = ? WHERE rate_id = ?',
            [rate, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rate not found.' });
        }
        res.status(200).json({ message: 'Rate updated successfully.' });
    } catch (e) {
        console.error("Error updating rate:", e);
        res.status(500).json({ message: 'Error updating rate', error: e.message });
    }
});

app.delete('/api/rates/:id', async (req, res) => {
    try {
        await dbPool.query('DELETE FROM rates WHERE rate_id = ?', [req.params.id]);
        res.status(200).json({ message: 'Rate deleted.' });
    } catch (e) {
        console.error("Error deleting rate:", e);
        res.status(500).json({ message: 'Error deleting rate', error: e.message });
    }
});

app.get('/api/invoices', async (req, res) => {
    try {
        const [rows] = await dbPool.query(
            'SELECT invoice_id, invoice_number, customer_name, grand_total, DATE_FORMAT(invoice_date, "%Y-%m-%d") as invoice_date, invoice_title FROM invoices ORDER BY invoice_number DESC'
        );
        res.json(rows);
    } catch (e) {
        console.error("Error fetching invoices:", e);
        res.status(500).json({ message: 'Error fetching invoices', error: e.message });
    }
});

app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const [invoiceRows] = await dbPool.query('SELECT * FROM invoices WHERE invoice_id = ?', [invoiceId]);
        if (invoiceRows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        const [itemRows] = await dbPool.query(
            'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY slno',
            [invoiceId]
        );
        res.json({ details: invoiceRows[0], items: itemRows });
    } catch (e) {
        console.error(`Error fetching invoice ${req.params.id}:`, e);
        res.status(500).json({ message: 'Error fetching invoice data.', error: e.message });
    }
});

app.post('/api/invoices', async (req, res) => {
    const { customerName, grandTotal, items, invoiceTitle } = req.body;
    if (!customerName || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required data.' });
    }
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.beginTransaction();
        const [maxNumRow] = await conn.query(
            "SELECT COALESCE(MAX(invoice_number), 0) + 1 AS nextNumber FROM invoices"
        );
        const nextInvoiceNumber = maxNumRow[0].nextNumber;
        const insertInvoiceSql =
            'INSERT INTO invoices (invoice_number, customer_name, grand_total, invoice_date, invoice_title) VALUES (?, ?, ?, ?, ?)';
        const [invRes] = await conn.query(insertInvoiceSql, [
            nextInvoiceNumber,
            customerName,
            grandTotal,
            new Date(),
            invoiceTitle || 'Invoice / Bill'
        ]);
        const invId = invRes.insertId;
        const itemsSql =
            'INSERT INTO invoice_items (invoice_id, slno, item_description, width, height, uom, quantity, unit_price, amount, tax_percentage, total_amount) VALUES ?';
        const itemsData = items.map(i => [
            invId,
            i.slno,
            `${i.itemName} (${i.materialName}) - ${i.itemDescription}`,
            i.width,
            i.height,
            i.uom,
            i.quantity,
            i.unitPrice,
            i.amount,
            i.tax_percentage || 18.00,
            i.totalAmount
        ]);
        await conn.query(itemsSql, [itemsData]);
        await conn.commit();
        res.status(201).json({
            message: 'Invoice saved!',
            invoiceId: invId,
            invoiceNumber: nextInvoiceNumber
        });
    } catch (e) {
        if (conn) await conn.rollback();
        console.error("Error saving invoice:", e);
        res.status(500).json({ message: 'Error saving invoice', error: e.message });
    } finally {
        if (conn) conn.release();
    }
});

app.put('/api/invoices/:id', async (req, res) => {
    const invoiceId = req.params.id;
    const { customerName, grandTotal, items, invoiceTitle } = req.body;
    if (!customerName || !items) {
        return res.status(400).json({ message: 'Missing required data.' });
    }
    let conn;
    try {
        conn = await dbPool.getConnection();
        await conn.beginTransaction();
        const updateInvoiceSql =
            'UPDATE invoices SET customer_name = ?, grand_total = ?, invoice_date = ?, invoice_title = ? WHERE invoice_id = ?';
        await conn.query(updateInvoiceSql, [
            customerName,
            grandTotal,
            new Date(),
            invoiceTitle || 'Invoice / Bill',
            invoiceId
        ]);
        await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
        if (items.length > 0) {
            const itemsSql =
                'INSERT INTO invoice_items (invoice_id, slno, item_description, width, height, uom, quantity, unit_price, amount, tax_percentage, total_amount) VALUES ?';
            const itemsData = items.map(i => [
                invoiceId,
                i.slno,
                `${i.itemName} (${i.materialName}) - ${i.itemDescription}`,
                i.width,
                i.height,
                i.uom,
                i.quantity,
                i.unitPrice,
                i.amount,
                i.tax_percentage || 18.00,
                i.totalAmount
            ]);
            await conn.query(itemsSql, [itemsData]);
        }
        await conn.commit();
        res.status(200).json({ message: 'Invoice updated!' });
    } catch (e) {
        if (conn) await conn.rollback();
        console.error(`Error updating invoice ${invoiceId}:`, e);
        res.status(500).json({ message: 'Error updating invoice', error: e.message });
    } finally {
        if (conn) conn.release();
    }
});

app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const invoiceId = req.params.id;
        let conn = await dbPool.getConnection();
        await conn.beginTransaction();
        await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
        await conn.query('DELETE FROM invoices WHERE invoice_id = ?', [invoiceId]);
        await conn.commit();
        conn.release();
        res.status(200).json({ success: true, message: 'Invoice deleted successfully.' });
    } catch (e) {
        console.error(`Error deleting invoice ${req.params.id}:`, e);
        res.status(500).json({ success: false, message: 'Error deleting invoice.', error: e.message });
    }
});

// --- Start Server ---

app.listen(port, () => {
    console.log(`Billing app server listening at http://localhost:${port}`);
});