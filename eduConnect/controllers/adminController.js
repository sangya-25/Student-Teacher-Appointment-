const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

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
    },

    // Get all teachers
    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find().select('-password');
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching teachers' });
        }
    },

    // Edit a teacher
    editTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const update = req.body;
            if (update.password) delete update.password; // Don't allow password change here
            const teacher = await Teacher.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-password');
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(200).json(teacher);
        } catch (error) {
            res.status(500).json({ message: 'Error updating teacher' });
        }
    },

    // Delete a teacher
    deleteTeacher: async (req, res) => {
        try {
            const { id } = req.params;
            const teacher = await Teacher.findByIdAndDelete(id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(200).json({ message: 'Teacher deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting teacher' });
        }
    },

    // Get all students (with approval status)
    getAllStudents: async (req, res) => {
        try {
            const students = await Student.find().select('-password');
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching students' });
        }
    },

    // Approve a student
    approveStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const student = await Student.findByIdAndUpdate(id, { approved: true }, { new: true });
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json(student);
        } catch (error) {
            res.status(500).json({ message: 'Error approving student' });
        }
    },

    // Reject (delete) a student
    rejectStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const student = await Student.findByIdAndDelete(id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ message: 'Student registration rejected and deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error rejecting student' });
        }
    },

    // Get all approved students
    getApprovedStudents: async (req, res) => {
        try {
            const students = await Student.find({ approved: true }).select('-password');
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching approved students' });
        }
    }
};

module.exports = adminController; 