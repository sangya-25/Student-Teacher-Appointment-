const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth'); // Import the auth middleware

// Student Profile
router.get('/profile', auth, studentController.getStudentProfile);

// Get all teachers
router.get('/teachers', auth, studentController.getAllTeachers);

// Book an appointment
router.post('/appointments/book', auth, studentController.bookAppointment);

// Get student's appointments
router.get('/appointments/student', auth, studentController.getStudentAppointments);

// Get all available appointment slots
router.get('/appointments/available', auth, studentController.getAvailableAppointmentSlots);

// Student messages
router.get('/messages/student', auth, studentController.getMessagesSent);
router.post('/messages/send', auth, studentController.sendMessage);

module.exports = router; 