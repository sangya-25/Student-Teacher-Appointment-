// DOM Elements
const viewTeachersBtn = document.getElementById('viewTeachers');
const bookAppointmentBtn = document.getElementById('bookAppointment');
const myAppointmentsBtn = document.getElementById('myAppointments');
const logoutBtn = document.getElementById('logout');
const searchInput = document.getElementById('searchInput');
const teachersListSection = document.getElementById('teachersListSection');
const bookFormSection = document.getElementById('bookFormSection');
const myAppointmentsSection = document.getElementById('myAppointmentsSection');
const teachersTable = document.getElementById('teachersTable');
const availableAppointmentsTable = document.getElementById('availableAppointmentsTable');
const myAppointmentsTable = document.getElementById('myAppointmentsTable');
const modalOverlay = document.getElementById('modalOverlay');
const bookingModal = document.getElementById('bookingModal');
const confirmBookingBtn = document.getElementById('confirmBooking');
const profileIcon = document.querySelector('.profile-icon');
const profileDialog = document.getElementById('profileDialog');
const profileOverlay = document.getElementById('profileOverlay');

// Student Profile Section Logic
let studentProfileData = null;

// Message modal logic
const messageModal = document.getElementById('messageModal');
const messageTeacherIdInput = document.getElementById('messageTeacherId');
const messageTextInput = document.getElementById('messageText');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const cancelMessageBtn = document.getElementById('cancelMessageBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/student-login.html';
        return;
    }

    // Event listeners for sidebar
    document.getElementById('viewTeachers').addEventListener('click', showTeachersSection);
    document.getElementById('bookAppointment').addEventListener('click', showBookSection);
    document.getElementById('myAppointments').addEventListener('click', showMyAppointmentsSection);
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('confirmBooking').addEventListener('click', handleBookingConfirmation);

    // Add search event listener
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const search = this.value.trim();
            loadTeachers(search);
        });
    }

    // Initial load
    showTeachersSection();
});

function showTeachersSection() {
    document.getElementById('teachersListSection').style.display = 'block';
    document.getElementById('bookFormSection').style.display = 'none';
    document.getElementById('myAppointmentsSection').style.display = 'none';
    loadTeachers();
}

function showBookSection() {
    document.getElementById('teachersListSection').style.display = 'none';
    document.getElementById('bookFormSection').style.display = 'block';
    document.getElementById('myAppointmentsSection').style.display = 'none';
    loadAvailableAppointmentSlots();
}

function showMyAppointmentsSection() {
    document.getElementById('teachersListSection').style.display = 'none';
    document.getElementById('bookFormSection').style.display = 'none';
    document.getElementById('myAppointmentsSection').style.display = 'block';
    loadStudentAppointments();
}

// Data Loading Functions
async function loadTeachers(search = '') {
    const tbody = document.getElementById('teachersTable');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    try {
        let url = '/api/student/teachers';
        if (search) url += `?search=${encodeURIComponent(search)}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load teachers');
        const teachers = await response.json();
        if (!teachers.length) {
            tbody.innerHTML = '<tr><td colspan="4">No teachers found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        teachers.forEach(teacher => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${teacher.fullName}</td>
                <td>${teacher.department || '-'}</td>
                <td>${teacher.subjectExpertise || '-'}</td>
                <td><button class="btn-primary" onclick="openMessageModal('${teacher._id}', '${teacher.fullName.replace(/'/g, "\\'")}')">Message</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
    }
}

async function loadAvailableAppointmentSlots() {
    const tbody = document.getElementById('availableAppointmentsTable');
    tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    try {
        const response = await fetch('/api/student/appointments/available', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load appointment slots');
        const slots = await response.json();
        if (!slots.length) {
            tbody.innerHTML = '<tr><td colspan="6">No available slots found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        slots.forEach(slot => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${slot.teacherName}</td>
                <td>${slot.subject}</td>
                <td>${new Date(slot.date).toLocaleDateString()}</td>
                <td>${slot.time}</td>
                <td>${slot.purpose || '-'}</td>
                <td>
                    <button class="book-btn" onclick="openBookingModal('${slot._id}', '${slot.teacherName}', '${slot.date}', '${slot.time}')">Book</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
    }
}

async function loadStudentAppointments() {
    const tbody = document.getElementById('myAppointmentsTable');
    tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    try {
        const response = await fetch('/api/student/appointments/student', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load appointments');
        const appointments = await response.json();
        if (!appointments.length) {
            tbody.innerHTML = '<tr><td colspan="7">No appointments found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        appointments.forEach(app => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${app.teacherId.fullName}</td>
                <td>${app.teacherId.subjectExpertise}</td>
                <td>${new Date(app.date).toLocaleDateString()}</td>
                <td>${app.time}</td>
                <td>${app.purpose || '-'}</td>
                <td>${app.status}</td>
                <td>${app.studentMessage || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7">${err.message}</td></tr>`;
    }
}

// Booking modal logic
window.openBookingModal = function (slotId, teacherName, date, time) {
    document.getElementById('appointmentId').value = slotId;
    document.getElementById('teacherName').textContent = teacherName;
    document.getElementById('appointmentDate').textContent = new Date(date).toLocaleDateString();
    document.getElementById('appointmentTime').textContent = time;
    document.getElementById('bookingModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
};

window.closeModal = function () {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('messageTextarea').value = '';
};

async function handleBookingConfirmation() {
    const slotId = document.getElementById('appointmentId').value;
    const studentMessage = document.getElementById('messageTextarea').value.trim();
    if (!studentMessage) {
        alert('Please enter a message for the teacher');
        return;
    }
    try {
        const response = await fetch('/api/student/appointments/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ slotId, studentMessage })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to book appointment');
        alert('Appointment booked successfully!');
        closeModal();
        loadAvailableAppointmentSlots();
        loadStudentAppointments();
    } catch (err) {
        alert(err.message);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('studentData');
    window.location.href = '/pages/student-login.html';
}

// Utility Functions
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger reflow
    notification.offsetHeight;

    // Add show class for animation
    notification.classList.add('show');

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

async function fetchStudentProfile() {
    try {
        const response = await fetch('/api/student/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to load student profile');
        studentProfileData = await response.json();
        // Set name in top right
        document.getElementById('studentProfileName').textContent = studentProfileData.fullName;
        // Set dialog info
        document.getElementById('profileName').textContent = studentProfileData.fullName;
        document.getElementById('profileEmail').textContent = studentProfileData.email;
        document.getElementById('profileEnrollment').textContent = studentProfileData.enrollmentNumber;
        document.getElementById('profileBranch').textContent = studentProfileData.courseProgram;
    } catch (err) {
        document.getElementById('studentProfileName').textContent = 'Student';
    }
}

function openProfileDialog() {
    document.getElementById('profileDialog').classList.add('active');
    document.getElementById('profileDialogOverlay').classList.add('active');
}

function closeProfileDialog() {
    document.getElementById('profileDialog').classList.remove('active');
    document.getElementById('profileDialogOverlay').classList.remove('active');
}

// Attach event listeners for profile section
const profileSection = document.getElementById('profileSection');
const profileDialogOverlay = document.getElementById('profileDialogOverlay');
const closeProfileDialogBtn = document.getElementById('closeProfileDialog');
if (profileSection) profileSection.addEventListener('click', openProfileDialog);
if (profileDialogOverlay) profileDialogOverlay.addEventListener('click', closeProfileDialog);
if (closeProfileDialogBtn) closeProfileDialogBtn.addEventListener('click', closeProfileDialog);

// Fetch profile on load
fetchStudentProfile();

// Message modal logic
function openMessageModal(teacherId, teacherName) {
    messageTeacherIdInput.value = teacherId;
    messageTextInput.value = '';
    messageModal.style.display = 'block';
    messageModal.querySelector('h3').textContent = `Send Message to ${teacherName}`;
}

function closeMessageModal() {
    messageModal.style.display = 'none';
}

sendMessageBtn.addEventListener('click', async () => {
    const teacherId = messageTeacherIdInput.value;
    const messageContent = messageTextInput.value.trim();
    if (!messageContent) {
        alert('Please enter a message.');
        return;
    }
    try {
        const response = await fetch('/api/student/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ toTeacherId: teacherId, messageContent })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send message');
        alert('Message sent successfully!');
        closeMessageModal();
    } catch (err) {
        alert(err.message);
    }
});

cancelMessageBtn.addEventListener('click', closeMessageModal);