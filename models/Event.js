const mongoose = require('mongoose');

// Define Event schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, // Name is required and trimmed
    date: { type: Date, required: true }, // Date is required
    startTime: {type: String,required: true},//start time is required
    endTime: {type: String,required: true},//end time is required
    location: { type: String, required: true, trim: true }, // Location is required
    description: { type: String, maxlength: 500 }, // Description is optional but limited to 500 characters
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],// Array of user IDs
});

// Create Event model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event; // Export the Event model
