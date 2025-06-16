const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'sample_test_key25'; // In production, always use a strong secret key

const adminController = {
    // Admin login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Check if username matches admin email
            if (username !== ADMIN_EMAIL) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare password with hashed password
            const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    email: ADMIN_EMAIL,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send success response with token
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    email: ADMIN_EMAIL,
                    role: 'admin'
                }
            });

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Verify admin token middleware
    verifyToken: (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
};

module.exports = adminController; 