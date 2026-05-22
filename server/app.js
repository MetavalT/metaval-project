const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dataRoutes = require('./routes/dataRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json());

// Routes
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/review', reviewRoutes);

// Default Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Metaval AI Backend Running Successfully',
  });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});