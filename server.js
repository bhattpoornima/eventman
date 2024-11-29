const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const eventRoutes = require('./routes/event');
const authRoutes = require('./routes/auth');

dotenv.config();  // Initialize dotenv to load environment variables

const app = express();

// Allowing CORS from a dynamic origin (from .env)
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',  // Fallback for local development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Route for user authentication (registration and login)
app.use('/api/auth', authRoutes);

// Route for event management (CRUD operations)
app.use('/api/events', eventRoutes); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('MongoDB Atlas connection error:', err);
});

// Test route
app.get('/', (req, res) => {
    res.send('Event Management API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
