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
app.use(cors());  // Add CORS if needed for cross-origin requests

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

const axios = require('axios');
app.get('/my-ip', async (req, res) => {
    try {
      // Make a request to ipify API to get the outgoing IP
      const response = await axios.get('https://api.ipify.org?format=json');
      
      // Send the IP address back in the response
      res.json({ ip: response.data.ip });
    } catch (error) {
      // If there's an error fetching the IP, return an error message
      res.status(500).json({ error: 'Unable to fetch IP' });
    }
  });


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


