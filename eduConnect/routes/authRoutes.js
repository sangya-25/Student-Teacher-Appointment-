const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Teacher Signup
router.post('/teacher/signup', async (req, res) => {
  try {
    const { fullName, email, password, department, subjectExpertise } = req.body;

    // Check if teacher already exists
    let teacher = await Teacher.findOne({ email });
    if (teacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new teacher
    teacher = new Teacher({
      fullName,
      email,
      password: hashedPassword,
      department,
      subjectExpertise
    });

    await teacher.save();

    // Create JWT token
    const token = jwt.sign(
      { id: teacher._id, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        department: teacher.department,
        subjectExpertise: teacher.subjectExpertise
      }
    });
  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher Login
router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if teacher exists
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: teacher._id, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        department: teacher.department,
        subjectExpertise: teacher.subjectExpertise
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Signup
router.post('/student/signup', async (req, res) => {
  try {
    const { fullName, email, password, enrollmentNumber, courseProgram } = req.body;

    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    student = new Student({
      fullName,
      email,
      password: hashedPassword,
      enrollmentNumber,
      courseProgram
    });

    await student.save();

    // Create JWT token
    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        courseProgram: student.courseProgram
      }
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Only allow login if approved
    if (!student.approved) {
      return res.status(403).json({ message: 'Your registration is pending approval by the admin.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        course: student.course
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
 