const Appointment = require('../models/Appointment');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

const teacherController = {
  // Get teacher profile
  getTeacherProfile: async (req, res) => {
    try {
      const teacher = await Teacher.findById(req.user.id).select('-password'); // Exclude password
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found.' });
      }
      res.status(200).json(teacher);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Schedule an appointment slot
  scheduleAppointment: async (req, res) => {
    try {
      const { date, time, purpose } = req.body;
      const teacherId = req.user.id; // Get teacherId from authenticated user

      // Basic validation
      if (!date || !time || !purpose) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
      }

      // Validate date is not in the past
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        return res.status(400).json({ message: 'Cannot schedule appointments in the past.' });
      }

      // Check if slot is already booked
      const existingAppointment = await Appointment.findOne({
        teacherId,
        date: appointmentDate,
        time,
        status: { $in: ['Available', 'Pending', 'Accepted'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'This time slot is already booked.' });
      }

      const newAppointment = new Appointment({
        teacherId,
        date: appointmentDate,
        time,
        purpose,
        status: 'Available' // Initially available
      });

      await newAppointment.save();
      res.status(201).json({ message: 'Appointment slot scheduled successfully', appointment: newAppointment });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get pending appointments for a specific teacher
  getPendingAppointments: async (req, res) => {
    try {
      const teacherId = req.user.id; // Get teacherId from authenticated user

      const pendingAppointments = await Appointment.find({ teacherId, status: 'Pending' })
        .populate('studentId', 'fullName email') // Populate student details
        .sort({ date: 1, time: 1 });

      res.status(200).json(pendingAppointments);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all booked appointments for a specific teacher
  getAllAppointments: async (req, res) => {
    try {
      const teacherId = req.user.id; // Get teacherId from authenticated user

      // Only fetch appointments that have been booked by students (studentId is not null)
      const allAppointments = await Appointment.find({ teacherId, studentId: { $ne: null } })
        .populate('studentId', 'fullName email')
        .sort({ date: 1, time: 1 });

      res.status(200).json(allAppointments);
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Accept an appointment request from a student
  acceptAppointment: async (req, res) => {
    try {
      const { id } = req.params; // Appointment ID
      const teacherId = req.user.id; // Authenticated teacher's ID

      const appointment = await Appointment.findOne({ _id: id, teacherId }).populate('studentId', 'fullName email enrollmentNumber');
      const teacher = await Teacher.findById(teacherId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found or not authorized.' });
      }

      if (appointment.status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending appointments can be accepted.' });
      }

      appointment.status = 'Accepted';
      await appointment.save();

      // Send email to student
      if (appointment.studentId && teacher) {
        const subject = `Appointment Status Update from Prof. ${teacher.fullName}`;
        const html = `
          <p>Hi <strong>${appointment.studentId.fullName}</strong>,</p>
          <p>Your appointment request with Prof. <strong>${teacher.fullName}</strong> has been <span style="color:green;font-weight:bold;">Approved</span>.</p>
          <ul>
            <li><strong>📅 Date:</strong> ${appointment.date.toLocaleDateString()}</li>
            <li><strong>🕒 Time:</strong> ${appointment.time}</li>
            <li><strong>Status:</strong> ✅ Approved</li>
          </ul>
          <p>Please be on time and come prepared.</p>
        `;
        await sendEmail({
          to: appointment.studentId.email,
          subject,
          html
        });
      }

      res.status(200).json({ message: 'Appointment accepted successfully.', appointment });
    } catch (error) {
      console.error('Error accepting appointment:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Reject an appointment request from a student
  rejectAppointment: async (req, res) => {
    try {
      const { id } = req.params; // Appointment ID
      const teacherId = req.user.id; // Authenticated teacher's ID

      const appointment = await Appointment.findOne({ _id: id, teacherId }).populate('studentId', 'fullName email enrollmentNumber');
      const teacher = await Teacher.findById(teacherId);

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found or not authorized.' });
      }

      if (appointment.status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending appointments can be rejected.' });
      }

      appointment.status = 'Rejected';
      await appointment.save();

      // Send email to student
      if (appointment.studentId && teacher) {
        const subject = `Appointment Status Update from Prof. ${teacher.fullName}`;
        const html = `
          <p>Hi <strong>${appointment.studentId.fullName}</strong>,</p>
          <p>Your appointment request with Prof. <strong>${teacher.fullName}</strong> has been <span style="color:red;font-weight:bold;">Rejected</span>.</p>
          <ul>
            <li><strong>📅 Date:</strong> ${appointment.date.toLocaleDateString()}</li>
            <li><strong>🕒 Time:</strong> ${appointment.time}</li>
            <li><strong>Status:</strong> ❌ Rejected</li>
          </ul>
          <p>If you have questions, please contact your teacher.</p>
        `;
        await sendEmail({
          to: appointment.studentId.email,
          subject,
          html
        });
      }

      res.status(200).json({ message: 'Appointment rejected successfully.', appointment });
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // View messages received by the teacher
  getMessages: async (req, res) => {
    try {
      const teacherId = req.user.id; // Authenticated teacher's ID

      // Fetch messages where `to` is the teacher
      const messages = await Message.find({ to: teacherId })
                                  .populate('from', 'fullName enrollmentNumber email') // Populate student details
                                  .sort({ timestamp: 1 });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Send message from teacher to student (if needed)
  sendMessage: async (req, res) => {
    try {
      const { toStudentId, messageContent } = req.body;
      const fromTeacherId = req.user.id; // Authenticated teacher's ID

      if (!toStudentId || !messageContent) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const newMessage = new Message({
        from: fromTeacherId,
        to: toStudentId,
        onModel: 'Teacher', // Recipient is Student
        message: messageContent
      });

      await newMessage.save();
      res.status(201).json({ message: 'Message sent successfully', message: newMessage });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = teacherController; 