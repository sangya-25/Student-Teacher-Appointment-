const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/auth'); // Import the auth middleware

// Teacher Profile
router.get('/profile', auth, teacherController.getTeacherProfile);

// Route for teacher to schedule an appointment slot
router.post('/appointments/create', auth, teacherController.scheduleAppointment);

// Routes for teacher to get their appointments
router.get('/appointments/teacher/pending', auth, teacherController.getPendingAppointments);
router.get('/appointments/teacher/all', auth, teacherController.getAllAppointments);

// Routes for teacher to handle appointment requests
router.post('/appointments/:id/approve', auth, teacherController.acceptAppointment);
router.post('/appointments/:id/reject', auth, teacherController.rejectAppointment);

// Routes for teacher messages
router.get('/messages/teacher', auth, teacherController.getMessages);
router.post('/messages/send', auth, teacherController.sendMessage);

module.exports = router; 