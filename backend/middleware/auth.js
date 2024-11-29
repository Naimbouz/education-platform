const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - headers:', req.headers);
        
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token found in Authorization header');
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Verify token
        try {
            const token = authHeader.split(' ')[1];
            console.log('Verifying token:', token);
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Decoded token:', decoded);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                console.log('User not found for token');
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('User authenticated:', user.email);
            req.user = user;
            next();
        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = auth;
