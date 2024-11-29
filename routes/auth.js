const express = require('express');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Import User model

const router = express.Router();

// Register route
router.post('/register', 
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation errors occurred', errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // Check if user already exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            const newUser = new User({ name, email, password });
            await newUser.save();

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('Password comparison:', password, user.password);

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Passwords do not match');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
//logout route
// Backend - Add logout route (Express)
router.post('/logout', (req, res) => {
    // Optional: You could invalidate the token here if you want, but JWT is stateless, so usually, it's not necessary
    // For example, you could set the token to null in client-side storage (localStorage or cookies)
    
    // Assuming you're using JWT:
    res.clearCookie('token'); // Clear JWT from cookies, if it's stored there

    res.status(200).json({ message: 'Logged out successfully' });
});


module.exports = router;

