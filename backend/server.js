const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, getDb, saveDatabase } = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve React build (static files)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

function queryAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function runSql(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  saveDatabase();
}

// --- Product Routes ---

app.get('/api/products', (req, res) => {
  const products = queryAll('SELECT * FROM products');
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = queryOne('SELECT * FROM products WHERE id = ?', [parseInt(req.params.id)]);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const reviews = queryAll('SELECT * FROM reviews WHERE product_id = ?', [parseInt(req.params.id)]);
  res.json({ ...product, reviews });
});

// --- Cart Routes ---

app.get('/api/cart', (req, res) => {
  const items = queryAll(`
    SELECT cart_items.id, cart_items.quantity, products.id as product_id, 
           products.name, products.emoji, products.image, products.price
    FROM cart_items 
    JOIN products ON cart_items.product_id = products.id
  `);
  res.json(items);
});

app.post('/api/cart', (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid product_id and quantity required' });
  }

  const existing = queryOne('SELECT * FROM cart_items WHERE product_id = ?', [product_id]);
  if (existing) {
    runSql('UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ?', [quantity, product_id]);
  } else {
    runSql('INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)', [product_id, quantity]);
  }

  res.json({ message: 'Item added to cart' });
});

app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity required' });
  }
  runSql('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, parseInt(req.params.id)]);
  res.json({ message: 'Cart updated' });
});

app.delete('/api/cart/:id', (req, res) => {
  runSql('DELETE FROM cart_items WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ message: 'Item removed from cart' });
});

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
});

// Start server after DB initialization
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Ready for ngrok: ngrok http ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
