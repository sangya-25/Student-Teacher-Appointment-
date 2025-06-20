document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/teacher-login';
        return;
    }

    // Profile Dialog Logic
    const teacherProfileIcon = document.getElementById('teacherProfileIcon');
    const teacherProfileDialog = document.getElementById('teacherProfileDialog');
    const teacherProfileDialogOverlay = document.getElementById('teacherProfileDialogOverlay');
    const closeTeacherProfileDialogBtn = document.getElementById('closeTeacherProfileDialog');
    const teacherProfileName = document.getElementById('teacherProfileName');

    // Fetch and set teacher profile info
    async function fetchTeacherProfile() {
        try {
            console.log('Fetching teacher profile...');
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
            console.log('Request headers:', headers);
            const response = await fetch('/api/teacher/profile', { headers });
            console.log('Profile fetch response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Profile fetch failed:', errorText);
                if (teacherProfileName) teacherProfileName.textContent = 'Error loading profile';
                window.location.href = '/teacher-login';
                return;
            }
            const teacher = await response.json();
            console.log('Teacher profile data:', teacher);
            if (teacherProfileName) teacherProfileName.textContent = teacher.fullName || 'Teacher';
            const nameSpan = document.getElementById('profileTeacherName');
            const emailSpan = document.getElementById('profileTeacherEmail');
            const deptSpan = document.getElementById('profileTeacherDepartment');
            const subjSpan = document.getElementById('profileTeacherSubject');
            if (nameSpan) nameSpan.textContent = teacher.fullName || '-';
            if (emailSpan) emailSpan.textContent = teacher.email || '-';
            if (deptSpan) deptSpan.textContent = teacher.department || '-';
            if (subjSpan) subjSpan.textContent = teacher.subjectExpertise || '-';
        } catch (err) {
            console.error('Error fetching teacher profile:', err);
            if (teacherProfileName) teacherProfileName.textContent = 'Error loading profile';
        }
    }

    // Show/Hide dialog
    if (teacherProfileIcon && teacherProfileDialog && teacherProfileDialogOverlay) {
        teacherProfileIcon.addEventListener('click', () => {
            teacherProfileDialog.classList.add('active');
            teacherProfileDialogOverlay.classList.add('active');
        });
        closeTeacherProfileDialogBtn.addEventListener('click', () => {
            teacherProfileDialog.classList.remove('active');
            teacherProfileDialogOverlay.classList.remove('active');
        });
        teacherProfileDialogOverlay.addEventListener('click', () => {
            teacherProfileDialog.classList.remove('active');
            teacherProfileDialogOverlay.classList.remove('active');
        });
    }

    // Fetch profile on load
    fetchTeacherProfile();

    // Sidebar navigation
    document.getElementById('scheduleSlotBtn').addEventListener('click', showScheduleSlotSection);
    document.getElementById('viewAllAppointmentsBtn').addEventListener('click', showAllAppointmentsSection);
    document.getElementById('pendingAppointmentsBtn').addEventListener('click', showPendingAppointmentsSection);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('viewMessagesBtn').addEventListener('click', showMessagesSection);

    // Initial load
    showScheduleSlotSection();

    // Handle Add Slot form submission
    const slotForm = document.getElementById('slotForm');
    slotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const appointmentData = {
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            purpose: document.getElementById('appointmentPurpose').value
        };

        try {
            const response = await fetch('/api/teacher/appointments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                showNotification('Appointment slot created successfully!', 'success');
                slotForm.reset();
                loadAllAppointments(); // Reload appointments after adding new one
            } else {
                const data = await response.json();
                showNotification(data.message || 'Failed to create appointment slot', 'error');
            }
        } catch (error) {
            console.error('Error creating appointment slot:', error);
            showNotification('An error occurred while creating the appointment slot', 'error');
        }
    });

    // Handle approve/reject actions (use correct table body ID)
    const pendingAppointmentsTable = document.getElementById('pendingAppointmentsTable');
    if (pendingAppointmentsTable) {
        pendingAppointmentsTable.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('accept-btn') || target.classList.contains('reject-btn')) {
                const appointmentId = target.closest('button').getAttribute('onclick').match(/'(.*?)'/)[1];
                const action = target.classList.contains('accept-btn') ? 'approve' : 'reject';
                try {
                    const response = await fetch(`/api/teacher/appointments/${appointmentId}/${action}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        showNotification(`Appointment ${action}d successfully!`, 'success');
                        loadAllAppointments(); // Reload appointments
                    } else {
                        const data = await response.json();
                        showNotification(data.message || `Failed to ${action} appointment`, 'error');
                    }
                } catch (error) {
                    console.error(`Error ${action}ing appointment:`, error);
                    showNotification(`An error occurred while ${action}ing the appointment`, 'error');
                }
            }
        });
    }

    // Data Loading Functions
    async function loadAllAppointments() {
        const tbody = document.getElementById('allAppointmentsTable');
        tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
        try {
            const response = await fetch('/api/teacher/appointments/teacher/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to load appointments');
            const appointments = await response.json();
            if (!appointments.length) {
                tbody.innerHTML = '<tr><td colspan="5">No appointments found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            appointments.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
            appointments.forEach(app => {
                if (!app.studentId) return; // Skip slots that are not booked
                let statusClass = '';
                let statusText = app.status || '-';
                if (statusText.toLowerCase() === 'pending') statusClass = 'status-badge status-pending';
                else if (statusText.toLowerCase() === 'accepted' || statusText.toLowerCase() === 'approved') statusClass = 'status-badge status-approved';
                else if (statusText.toLowerCase() === 'rejected') statusClass = 'status-badge status-rejected';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.studentId.fullName || '-'}</td>
                    <td>${new Date(app.date).toLocaleDateString()}</td>
                    <td>${app.time}</td>
                    <td>${app.purpose || '-'}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
        }
    }

    async function loadPendingAppointments() {
        const tbody = document.getElementById('pendingAppointmentsTable');
        tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
        try {
            const response = await fetch('/api/teacher/appointments/teacher/pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to load pending appointments');
            const appointments = await response.json();
            if (!appointments.length) {
                tbody.innerHTML = '<tr><td colspan="6">No pending appointments found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            appointments.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
            appointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.studentId ? (app.studentId.fullName || '-') : '-'}</td>
                    <td>${new Date(app.date).toLocaleDateString()}</td>
                    <td>${app.time}</td>
                    <td>${app.purpose || '-'}</td>
                    <td>${app.studentMessage || '-'}</td>
                    <td>
                        <button class="action-btn accept-btn" onclick="acceptAppointment('${app._id}')"><i class="fas fa-check"></i> Accept</button>
                        <button class="action-btn reject-btn" onclick="rejectAppointment('${app._id}')"><i class="fas fa-times"></i> Reject</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6">${err.message}</td></tr>`;
        }
    }

    // Accept/Reject appointment actions (for inline onclick)
    window.acceptAppointment = async function(id) {
        if (!confirm('Accept this appointment?')) return;
        try {
            const response = await fetch(`/api/teacher/appointments/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to accept appointment');
            alert('Appointment accepted!');
            loadPendingAppointments();
            loadAllAppointments();
        } catch (err) {
            alert(err.message);
        }
    }

    window.rejectAppointment = async function(id) {
        if (!confirm('Reject this appointment?')) return;
        try {
            const response = await fetch(`/api/teacher/appointments/${id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to reject appointment');
            alert('Appointment rejected!');
            loadPendingAppointments();
            loadAllAppointments();
        } catch (err) {
            alert(err.message);
        }
    }

    // Show sections
    function showScheduleSlotSection() {
        document.getElementById('scheduleSlotSection').style.display = 'block';
        document.getElementById('allAppointmentsSection').style.display = 'none';
        document.getElementById('pendingAppointmentsSection').style.display = 'none';
        document.getElementById('viewMessagesSection').style.display = 'none';
    }
    function showAllAppointmentsSection() {
        document.getElementById('scheduleSlotSection').style.display = 'none';
        document.getElementById('allAppointmentsSection').style.display = 'block';
        document.getElementById('pendingAppointmentsSection').style.display = 'none';
        document.getElementById('viewMessagesSection').style.display = 'none';
        loadAllAppointments();
    }
    function showPendingAppointmentsSection() {
        document.getElementById('scheduleSlotSection').style.display = 'none';
        document.getElementById('allAppointmentsSection').style.display = 'none';
        document.getElementById('pendingAppointmentsSection').style.display = 'block';
        document.getElementById('viewMessagesSection').style.display = 'none';
        loadPendingAppointments();
    }
    function showMessagesSection() {
        document.getElementById('scheduleSlotSection').style.display = 'none';
        document.getElementById('allAppointmentsSection').style.display = 'none';
        document.getElementById('pendingAppointmentsSection').style.display = 'none';
        document.getElementById('viewMessagesSection').style.display = 'block';
        loadMessages();
    }
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('teacherData');
        window.location.href = '/teacher-login';
    }
});

// Load teacher data
async function loadTeacherData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teacher/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const teacherData = await response.json();
            document.getElementById('modalTeacherName').textContent = teacherData.fullName;
            document.getElementById('modalTeacherDepartment').textContent = teacherData.department;
            document.getElementById('modalTeacherEmail').textContent = teacherData.email;
        } else {
            console.error('Failed to load teacher data:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading teacher data:', error);
    }
}

// Load messages
async function loadMessages() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const tbody = document.getElementById('messagesTable');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    try {
        const response = await fetch('/api/teacher/messages/teacher', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to load messages');
        const messages = await response.json();
        if (!messages.length) {
            tbody.innerHTML = '<tr><td colspan="5">No messages found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        messages.forEach(msg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${msg.from ? msg.from.fullName : '-'}</td>
                <td>${msg.from ? msg.from.enrollmentNumber : '-'}</td>
                <td>${msg.from ? msg.from.email : '-'}</td>
                <td>${msg.message}</td>
                <td>${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
    }
}

// Display messages in list
function displayMessages(messages) {
    const ul = document.getElementById('messagesList');
    ul.innerHTML = ''; // Clear existing messages

    if (messages.length === 0) {
        ul.innerHTML = '<li>No messages.</li>';
        return;
    }

    messages.forEach(message => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${message.senderName || 'Unknown'}:</strong> ${message.content}`;
        ul.appendChild(li);
    });
}

// Utility functions (keeping them)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 