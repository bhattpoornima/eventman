const Event = require('./models/Event'); // Import Event model

// Importing the Express library
const express = require('express'); 
const app = express(); // Creating an instance of an Express app

// Middleware to parse JSON data from incoming requests
app.use(express.json());

// A basic GET route to test if the server is running
app.get('/', (req, res) => {
    res.send('Event Management Backend is running!');
});

// Start the server on port 5000 (or a port from environment variables)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//connecting to a database
const mongoose = require('mongoose'); // Import Mongoose library

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/eventManagement')
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});


//*events*
// Route to get all events
app.get('/events', async (req, res) => {
    try {
        const moment = require('moment-timezone');
        const events = await Event.find(); // Fetch all events
        // Convert each event's date from UTC to local time zone
        const eventsWithLocalTime = events.map(event => {
            const localDate = moment.utc(event.date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            return {
                ...event.toObject(),
                date: localDate, // Replace the UTC date with the converted local date
            };
        });
        res.json(eventsWithLocalTime); // Send events as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
});


// Route to create a new event
const { body, validationResult } = require('express-validator');
app.post('/events/add', 
    body('name').isString().withMessage('Event name is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const moment = require('moment-timezone');
            // Convert the date to UTC before saving
            const localDate = req.body.date;
            const utcDate = moment.tz(localDate, 'Asia/Kolkata').utc().format();

            req.body.date = utcDate; // Update the date to UTC format
            
            const newEvent = new Event(req.body);
            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(400).json({ message: 'Error creating event', error: error.message });
        }
    }
);



// Route to update an event
app.put('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id; // Get the event ID from the route
        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updated data
        });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(updatedEvent); // Respond with the updated event
    } catch (error) {
        res.status(400).json({ message: 'Error updating event', error });
    }
});


// Route to delete an event
app.delete('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id; // Get the event ID from the route
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully', deletedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
});



