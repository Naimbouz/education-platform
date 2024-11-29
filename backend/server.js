const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Education Platform API' });
});

// Routes
console.log('Registering auth routes...');
app.use('/api/auth', authRoutes);
console.log('Registering course routes...');
app.use('/api/courses', courseRoutes);

// MongoDB connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected successfully');
    // Log connection details
    const db = mongoose.connection;
    console.log('Database name:', db.name);
    console.log('Host:', db.host);
    console.log('Port:', db.port);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 routes - this should be after all valid routes
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.url,
        method: req.method
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET  /api/auth/test');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/register');
    console.log('- GET  /api/auth/me');
});
