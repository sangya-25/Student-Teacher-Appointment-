const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login route
router.post('/login', adminController.login);

// Teacher management routes
router.get('/teachers', adminController.verifyToken, adminController.getAllTeachers);
router.put('/teachers/:id', adminController.verifyToken, adminController.editTeacher);
router.delete('/teachers/:id', adminController.verifyToken, adminController.deleteTeacher);

// Student management routes
router.get('/students', adminController.verifyToken, adminController.getAllStudents);
router.put('/students/:id/approve', adminController.verifyToken, adminController.approveStudent);
router.delete('/students/:id/reject', adminController.verifyToken, adminController.rejectStudent);
router.get('/students/approved', adminController.verifyToken, adminController.getApprovedStudents);

// Protected admin routes (will be added later)
// router.get('/dashboard', adminController.verifyToken, adminController.getDashboard);
// router.get('/profile', adminController.verifyToken, adminController.getProfile);

module.exports = router; 