const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

const studentController = {
  // Get student profile
  getStudentProfile: async (req, res) => {
    try {
      const student = await Student.findById(req.user.id).select('-password'); // Exclude password
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all teachers for booking appointments
  getAllTeachers: async (req, res) => {
    try {
      let query = {};
      if (req.query.search) {
        // Remove common prefixes and trim
        let search = req.query.search
          .replace(/^(dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?|sir|madam)\s*/i, '')
          .trim();

        // Case-insensitive regex for any part of the name
        query = {
          $or: [
            { fullName: { $regex: search, $options: 'i' } }
          ]
        };
      }
      const teachers = await Teacher.find(query).select('-password');
      res.status(200).json(teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all available appointment slots from all teachers
  getAvailableAppointmentSlots: async (req, res) => {
    try {
      const studentId = req.user.id;

      // Find all slots (studentId: null, status: 'Available')
      const availableSlots = await Appointment.find({ studentId: null, status: 'Available' })
        .populate('teacherId', 'fullName subjectExpertise')
        .sort({ date: 1, time: 1 });

      // Find all bookings by this student
      const studentBookings = await Appointment.find({ studentId })
        .select('teacherId date time');

      // Build a set of booked slot keys for this student
      const bookedKeys = new Set(
        studentBookings.map(b => `${b.teacherId.toString()}|${b.date.toISOString()}|${b.time}`)
      );

      // Filter out slots already booked by this student
      const filteredSlots = availableSlots.filter(slot => {
        const key = `${slot.teacherId._id.toString()}|${slot.date.toISOString()}|${slot.time}`;
        return !bookedKeys.has(key);
      });

      const transformedSlots = filteredSlots.map(slot => ({
        _id: slot._id,
        teacherId: slot.teacherId._id,
        teacherName: slot.teacherId.fullName,
        subject: slot.teacherId.subjectExpertise,
        date: slot.date,
        time: slot.time,
        purpose: slot.purpose
      }));

      res.status(200).json(transformedSlots);
    } catch (error) {
      console.error('Error fetching available appointment slots:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Book an appointment with a teacher (create a new booking, don't update the slot)
  bookAppointment: async (req, res) => {
    try {
      const { slotId, studentMessage } = req.body;
      const studentId = req.user.id;

      // Find the slot (must exist and be available)
      const slot = await Appointment.findOne({ _id: slotId, studentId: null, status: 'Available' });
      if (!slot) {
        return res.status(404).json({ message: 'Appointment slot not found.' });
      }

      // Create a new booking for this student
      const newBooking = new Appointment({
        teacherId: slot.teacherId,
        date: slot.date,
        time: slot.time,
        purpose: slot.purpose,
        studentId,
        studentMessage,
        status: 'Pending'
      });

      await newBooking.save();

      // Send email to teacher
      const student = await Student.findById(studentId);
      const teacher = await Teacher.findById(slot.teacherId);
      if (student && teacher) {
        const subject = `New Appointment Request from ${student.fullName}`;
        const html = `
          <p>Hi Prof. <strong>${teacher.fullName}</strong>,</p>
          <p>You have a new appointment request from <strong>${student.fullName}</strong>.</p>
          <ul>
            <li><strong>📅 Date:</strong> ${slot.date.toLocaleDateString()}</li>
            <li><strong>🕒 Time:</strong> ${slot.time}</li>
            <li><strong>Purpose:</strong> ${slot.purpose}</li>
            <li><strong>Student Email:</strong> ${student.email}</li>
            <li><strong>Enrollment No.:</strong> ${student.enrollmentNumber || ''}</li>
            <li><strong>Message:</strong> ${studentMessage || 'N/A'}</li>
          </ul>
          <p>Please log in to your dashboard to approve or reject this appointment.</p>
        `;
        await sendEmail({
          to: teacher.email,
          subject,
          html,
          replyTo: student.email
        });
      }

      res.status(200).json({ message: 'Appointment request sent. Waiting for teacher approval.' });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get all appointments for a specific student
  getStudentAppointments: async (req, res) => {
    try {
      const studentId = req.user.id; // Get studentId from authenticated user

      const appointments = await Appointment.find({ studentId })
        .populate('teacherId', 'fullName subjectExpertise') // Populate teacher details
        .sort({ date: 1, time: 1 });

      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching student appointments:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // View messages for a student
  getMessages: async (req, res) => {
    try {
      const studentId = req.user.id; // Authenticated student's ID

      const messages = await Message.find({ to: studentId, onModel: 'Student' })
                                  .populate('from', 'fullName email') // Populate sender details (teacher)
                                  .sort({ createdAt: 1 });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Send message from student to teacher (if needed)
  sendMessage: async (req, res) => {
    try {
      const { toTeacherId, messageContent } = req.body;
      const fromStudentId = req.user.id; // Authenticated student's ID

      if (!toTeacherId || !messageContent) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const newMessage = new Message({
        from: fromStudentId,
        to: toTeacherId,
        message: messageContent
      });

      await newMessage.save();
      res.status(201).json({ message: 'Message sent successfully', message: newMessage });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // View messages sent by the student
  getMessagesSent: async (req, res) => {
    try {
      const studentId = req.user.id; // Authenticated student's ID

      const messages = await Message.find({ from: studentId, onModel: 'Student' })
                                  .populate('to', 'fullName email') // Populate teacher details
                                  .sort({ timestamp: 1 });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

module.exports = studentController; 