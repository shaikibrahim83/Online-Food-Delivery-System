const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- Add path module

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the parent directory (your project root)
app.use(express.static(path.join(__dirname, '../')));

// Sample Menu Database
const menuItems = [
  { id: 1, name: 'Farm Fresh Pizza', category: 'Pizza', price: 250, icon: '🍕', desc: 'Cheesy pizza with fresh vegetables.' },
  { id: 2, name: 'Classic Burger', category: 'Burger', price: 150, icon: '🍔', desc: 'Crispy patty with fresh lettuce.' },
  { id: 3, name: 'Chicken Biryani', category: 'Indian', price: 200, icon: '🍛', desc: 'Aromatic rice with delicious spices.' },
  { id: 4, name: 'Masala Dosa', category: 'Indian', price: 120, icon: '🥞', desc: 'Crispy dosa served with chutney.' },
  { id: 5, name: 'Veg Pizza', category: 'Pizza', price: 220, icon: '🍕', desc: 'Loaded with fresh vegetables and cheese.' },
  { id: 6, name: 'Chocolate Cake', category: 'Dessert', price: 130, icon: '🍰', desc: 'Soft chocolate cake with rich frosting.' },
  { id: 7, name: 'French Fries', category: 'Burger', price: 100, icon: '🍟', desc: 'Crispy golden fries with seasoning.' },
  { id: 8, name: 'Gulab Jamun', category: 'Dessert', price: 90, icon: '🍮', desc: 'Soft sweet dumplings in sugar syrup.' }
];

let orders = [];

// 1. Get Menu API
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// 2. Place Order API
app.post('/api/orders', (req, res) => {
  const newOrder = {
    orderId: 'FG' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleString(),
    ...req.body,
    status: 'Preparing'
  };
  orders.unshift(newOrder);
  res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
});

// 3. Get Orders API
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});