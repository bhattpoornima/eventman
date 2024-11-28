const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event'); // Import Event model
const authMiddleware = require('../middleware/auth'); // Import authMiddleware
const router = express.Router();
const moment = require('moment-timezone'); // For handling time zone conversion

// Route to get all events (No authentication needed for viewing events)
router.get('/', async (req, res) => {
    try {
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

// Route to create a new event (requires authentication)
router.post('/add', authMiddleware, // Use the authMiddleware here
    // Validate input fields
    body('name').isString().withMessage('Event name is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid start time format (HH:mm)'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid end time format (HH:mm)'),
    body('location').isString().trim().notEmpty().withMessage('Location is required'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be 500 characters or less'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, date, startTime, endTime, location, description } = req.body;

            // Convert the date to UTC before saving
            const localDate = date;
            const utcDate = moment.tz(localDate, 'Asia/Kolkata').utc().format();
            req.body.date = utcDate; // Update the date to UTC format

            // Check for duplicate events with same name, date, start time, and location
            const existingEvent = await Event.findOne({
                name: name,
                date: utcDate,
                startTime: startTime,
                location: location
            });

            if (existingEvent) {
                return res.status(409).json({ message: 'Event with the same name, date, start time, and location already exists' });
            }

            // Create and save the new event
            const newEvent = new Event(req.body);
            const savedEvent = await newEvent.save();
            res.status(201).json(savedEvent);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(400).json({ message: 'Error creating event', error: error.message });
        }
    }
);

// Route to get details of a single event by ID
router.get('/:id', async (req, res) => {
    try {
      const eventId = req.params.id; // Get the event ID from the route
      const event = await Event.findById(eventId); // Fetch event by ID
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event); // Respond with the event details
    } catch (error) {
      res.status(400).json({ message: 'Error fetching event details', error });
    }
  });
  

// Route to delete an event (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
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
//users registering for the event
router.post('/:id/register', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if the user has already registered
        if (event.attendees.includes(req.user.userId)) {
        return res.status(400).json({ message: 'You have already registered for this event' });
        }

        // Add user to the attendees list
        event.attendees.push(req.user.userId);
        await event.save();

        res.json({ message: 'Successfully registered as an attendee', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
  
// Get list of attendees for an event
router.get('/:id/attendees', authMiddleware, async (req, res) => {
try {
    const event = await Event.findById(req.params.id).populate('attendees', 'name email'); // Populate to get user details
    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event.attendees);
} catch (error) {
    res.status(500).json({ message: 'Server error', error });
}
});

// List all events the authenticated user is enrolled in
router.get('/my-events', authMiddleware, async (req, res) => {
    try {
      // Find events where the attendees list includes the user's ID
      const events = await Event.find({ attendees: req.user.userId });
  
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

module.exports = router;
