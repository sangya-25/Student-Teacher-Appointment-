const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login route
router.post('/login', adminController.login);

// Protected admin routes (will be added later)
// router.get('/dashboard', adminController.verifyToken, adminController.getDashboard);
// router.get('/profile', adminController.verifyToken, adminController.getProfile);

module.exports = router; 