const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const courierRoutes = require('./routes/courierRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logger
app.use(morgan('dev'));

// System Health & Info Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'On-the-Go Courier Management API',
    database: db.getEngine(),
    isPostgres: db.isPostgres(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modular REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Auto-initialize DB and start server
async function startServer() {
  try {
    await db.init();
    
    // Check if tables exist, if not run migration and seed
    try {
      const checkUsers = await db.query('SELECT count(*) as count FROM users');
      if (parseInt(checkUsers.rows[0].count, 10) === 0) {
        console.log('[INIT] Database is empty. Running initial migration and demo seed...');
        const migrate = require('./db/migrate');
        const seed = require('./db/seed');
        await migrate();
        await seed();
      }
    } catch (e) {
      console.log('[INIT] Tables not detected. Running initial migration and demo seed...');
      const migrate = require('./db/migrate');
      const seed = require('./db/seed');
      await migrate();
      await seed();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 On-the-Go Courier Management Backend is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📊 DB Engine: ${db.getEngine().toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
