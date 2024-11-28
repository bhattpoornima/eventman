const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const eventRoutes = require('./routes/event');
const authRoutes = require('./routes/auth');
// Initialize dotenv to load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://event-managment-frontent.vercel.app/" }));  // Add CORS if needed for cross-origin requests

// Route for user authentication (registration and login)
app.use('/api/auth', authRoutes);

// Route for event management (CRUD operations)
app.use('/api/events', eventRoutes); // Apply authMiddleware to protect event routes

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


