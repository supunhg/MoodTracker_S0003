const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    entry: {
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);