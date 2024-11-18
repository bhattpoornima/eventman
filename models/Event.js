const mongoose = require('mongoose');

// Define Event schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // Name is required and trimmed
    date: { type: Date, required: true }, // Date is required
    location: { type: String, required: true, trim: true }, // Location is required
    description: { type: String, maxlength: 500 }, // Description is optional but limited to 500 characters
});

// Create Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event; // Export the Event model
