const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// ---------- In-memory "database" ----------
let items = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Mouse', price: 19.99 },
];

const getNextId = () => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// ---------- Validation rules (reusable) ----------
const validateItem = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

// ---------- Routes ----------

// GET /items – fetch all items
app.get('/items', (req, res) => {
  res.status(200).json({
    success: true,
    data: items,
    count: items.length,
  });
});

// POST /items – create a new item (with validation)
app.post('/items', validateItem, (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }

  // Create and store the new item
  const { name, price } = req.body;
  const newItem = {
    id: getNextId(),
    name: name.trim(),
    price: parseFloat(price),
  };
  items.push(newItem);

  res.status(201).json({
    success: true,
    data: newItem,
    message: 'Item created successfully',
  });
});

// ---------- Global error handler (catches unexpected errors) ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ---------- Start the server ----------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`   GET  /items  → list all items`);
  console.log(`   POST /items  → add a new item (name + price)`);
});
