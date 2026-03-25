const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const Contact = require('../models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'https://rekhakj1206.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.static('../'));  // Serve files from the parent directory

// HEALTH CHECK ROUTE (for Render to verify app is running)
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// CONNECT TO MONGODB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
    console.warn('⚠️ MongoDB URI is missing or invalid. Set MONGO_URI to mongodb://... or mongodb+srv://...');
} else {
    mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// ROUTE TO SAVE CONTACT
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});