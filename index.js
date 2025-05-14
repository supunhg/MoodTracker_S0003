require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const JournalEntry = require('./models/JournalEntry');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}). catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to MoodTracker API!');
});

// Routes (get)
// My Details
app.get('/api/user', (req, res) => {
    res.json({
        name: 'Supun Hewagamage',
        age: 21,
        interests: ['coding', 'hacking', 'pizza'],
        mood: 'burntout',
        favourite_programming_language: 'Java'
    });
});

// Status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Server is healthy and alive',
        timestamp: new Date().toISOString()
    });
});

// Journal - All || Filtered Journal Entries
app.get('/api/journal', async (req, res) => {
    const { title } = req.query;
    const filter = title ? {
        $or: [
            { title: { $regex: title, $options: 'i' } },
            { entry: { $regex: title, $options: 'i' } }
        ] 
    }: {

    };

    try {
        const entries = await JournalEntry.find(filter);
        res.json(entries);
    } catch (err) {
        res.status(500).json({ 
            error: 'Failed to retrieve journal entries.'
        });
    }
});

// Specific Journal Entry by ID
app.get('/api/journal/:id', async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ 
            error: 'Journal entry not found' 
        });
        res.json(entry);
    } catch (err) {
        res.status(500).json({
            error: 'Invalid ID or entry not found.'
        });
    }
});

// Routes (post)
// Mood
app.post('/api/mood', (req, res) => {
    const { mood } = req.body;
    if (!mood) {
        return res.status(400).json({ 
            error: 'Mood is required.' 
        });
    }

    res.json({ 
        message: `Mood received: ${mood}. Stay strong, Supun.` 
    });
});

// Journal
app.post('/api/journal', async (req, res) => {
    const { title, entry } = req.body;
    if (!title && ! entry) {
        return res.status(400).json({
            error: 'At least one of title or entry is required.'
        });
    }

    try {
        const newEntry = new JournalEntry({ title, entry });
        await newEntry.save();
        res.json({ 
            message: 'Journal saved.', entry: newEntry
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to save journal entry.'
        });
    }
});

// Routes (delete)
// Journal
app.delete('/api/journal/:id', async (req, res) => {
    try {
        const deleted = await JournalEntry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ 
            error: 'Journal entry not found' 
        });

        res.json({ 
            message: 'Journal entry deleted.', entry: deleted 
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete journal entry.' });
    }
});


// Routes (put)
app.put('/api/journal/:id', async (req, res) => {
    const { title, entry } = req.body;
    if (!title && !entry) {
        return res.status(400).json({ 
            error: 'At least one of title or entry is required.' 
        });
    }

    try {
        const updated = await JournalEntry.findByIdAndUpdate(
            req.params.id,
            { ...(title && { title }), ...(entry && { entry }) },
            { new: true }
        );

        if (!updated) return res.status(404).json({ 
            error: 'Journal entry not found' 
        });

        res.json({ 
            message: 'Journal entry updated.', entry: updated 
        });
    } catch (err) {
        res.status(500).json({ 
            error: 'Failed to update journal entry.' 
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found')
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});