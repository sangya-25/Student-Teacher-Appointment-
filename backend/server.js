const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON request body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));  // logger

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);

// Serve welcome page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/index.html"));
});

// Serve admin login page
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/admin-login.html"));
});

// Serve admin dashboard page
app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/admin-dashboard.html"));
});

// Serve teacher login page
app.get("/teacher-login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/teacher-login.html"));
});

// Serve teacher signup page
app.get("/teacher-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/teacher-signup.html"));
});

// Serve student login page
app.get("/student-login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/student-login.html"));
});

// Serve student signup page
app.get("/student-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/student-signup.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
