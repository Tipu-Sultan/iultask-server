const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./models/db');
const app = express();

// Middleware
app.use(cors()); 

// Body parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize MongoDB connection
connectDB();

// Routes
app.use('/api', require('./routes/transactionRoutes')); 

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
