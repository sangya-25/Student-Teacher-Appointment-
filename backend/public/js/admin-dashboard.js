document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  const token = localStorage.getItem('adminToken');
  if (!token) {
    // Redirect to login if no token found
    window.location.href = '/admin-login';
    return;
  }

  // Initialize GSAP animations
  initializeAnimations();

  // Navigation handling
  const navLinks = document.querySelectorAll('.nav-links li');
  const sections = document.querySelectorAll('.dashboard-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute('data-section');
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      sections.forEach(section => {
        if (section.id === targetSection) {
          section.style.display = '';
          gsap.from(section, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out'
          });
          if (section.id === 'all-students') fetchApprovedStudents();
        } else {
          section.style.display = 'none';
        }
      });
    });
  });

  sections.forEach(section => {
    if (section.id === 'teachers') {
      section.style.display = '';
    } else {
      section.style.display = 'none';
    }
  });

  // Teacher management
  const teacherModal = document.getElementById('teacherModal');
  const addTeacherBtn = document.getElementById('addTeacherBtn');
  const closeModal = document.getElementById('closeModal');
  const cancelAdd = document.getElementById('cancelAdd');
  const teacherForm = document.getElementById('teacherForm');
  const teacherList = document.getElementById('teacherList');

  // Edit Teacher Modal
  const editTeacherModal = document.getElementById('editTeacherModal');
  const closeEditModal = document.getElementById('closeEditModal');
  const cancelEdit = document.getElementById('cancelEdit');
  const editTeacherForm = document.getElementById('editTeacherForm');
  let editingTeacherId = null;

  let teachers = [];
  let students = [];

  async function fetchTeachers() {
    try {
      const response = await fetch('/api/admin/teachers', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      teachers = await response.json();
      renderTeachers();
    } catch (err) {
      showNotification('Failed to fetch teachers');
    }
  }

  function renderTeachers() {
    teacherList.innerHTML = '';
    teachers.forEach((teacher) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${teacher.fullName}</td>
        <td>${teacher.subjectExpertise}</td>
        <td>${teacher.department}</td>
        <td>${teacher.email}</td>
        <td><span class="status-badge active">Active</span></td>
        <td>
          <button class="action-btn edit" data-id="${teacher._id}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" data-id="${teacher._id}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      teacherList.appendChild(row);
    });
    teacherList.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const teacher = teachers.find(t => t._id === id);
      if (teacher) showEditModal(teacher);
    }));
    teacherList.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', handleDeleteTeacher));
  }

  function showEditModal(teacher) {
    editingTeacherId = teacher._id;
    document.getElementById('editTeacherName').value = teacher.fullName;
    document.getElementById('editTeacherSubject').value = teacher.subjectExpertise;
    document.getElementById('editTeacherDepartment').value = teacher.department;
    editTeacherModal.classList.add('active');
    gsap.from(editTeacherModal.querySelector('.modal-content'), {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });
  }

  function hideEditModal() {
    gsap.to(editTeacherModal.querySelector('.modal-content'), {
      scale: 0.8,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        editTeacherModal.classList.remove('active');
        editTeacherForm.reset();
      }
    });
  }

  closeEditModal.addEventListener('click', hideEditModal);
  cancelEdit.addEventListener('click', hideEditModal);

  editTeacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('editTeacherName').value;
    const subjectExpertise = document.getElementById('editTeacherSubject').value;
    const department = document.getElementById('editTeacherDepartment').value;
    if (editingTeacherId) {
      try {
        const response = await fetch(`/api/admin/teachers/${editingTeacherId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ fullName, subjectExpertise, department })
        });
        if (response.ok) {
          showNotification('Teacher updated');
          fetchTeachers();
          hideEditModal();
        } else {
          showNotification('Failed to update teacher');
        }
      } catch {
        showNotification('Server error');
      }
    }
  });

  async function handleDeleteTeacher(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await fetch(`/api/admin/teachers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
          showNotification('Teacher deleted');
          fetchTeachers();
        } else {
          showNotification('Failed to delete teacher');
        }
      } catch {
        showNotification('Server error');
      }
    }
  }

  // Fetch and render all students (pending approval)
  async function fetchStudents() {
    try {
      const response = await fetch('/api/admin/students', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      students = await response.json();
      renderStudents();
    } catch (err) {
      showNotification('Failed to fetch students');
    }
  }

  function renderStudents() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';
    students.filter(s => !s.approved).forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.fullName}</td>
        <td>${student.email}</td>
        <td>${student.enrollmentNumber}</td>
        <td>${student.courseProgram}</td>
        <td>${new Date(student.createdAt).toLocaleString()}</td>
        <td>
          <button class="approve-btn" data-id="${student._id}"><i class="fas fa-check"></i> Approve</button>
          <button class="reject-btn" data-id="${student._id}"><i class="fas fa-times"></i> Reject</button>
        </td>
      `;
      studentList.appendChild(row);
    });
    studentList.querySelectorAll('.approve-btn').forEach(btn => btn.addEventListener('click', handleApproveStudent));
    studentList.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', handleRejectStudent));
  }

  async function handleApproveStudent(e) {
    const id = e.currentTarget.getAttribute('data-id');
    try {
      const response = await fetch(`/api/admin/students/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (response.ok) {
        showNotification('Student approved');
        fetchStudents();
      } else {
        showNotification('Failed to approve student');
      }
    } catch {
      showNotification('Server error');
    }
  }

  async function handleRejectStudent(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (confirm('Are you sure you want to reject this student?')) {
      try {
        const response = await fetch(`/api/admin/students/${id}/reject`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
          showNotification('Student rejected');
          fetchStudents();
        } else {
          showNotification('Failed to reject student');
        }
      } catch {
        showNotification('Server error');
      }
    }
  }

  // Modal handling for Add Teacher
  function showModal() {
    teacherModal.classList.add('active');
    gsap.from('.modal-content', {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });
  }

  function hideModal() {
    gsap.to('.modal-content', {
      scale: 0.8,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        teacherModal.classList.remove('active');
        teacherForm.reset();
      }
    });
  }

  addTeacherBtn.addEventListener('click', showModal);
  closeModal.addEventListener('click', hideModal);
  cancelAdd.addEventListener('click', hideModal);

  teacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTeacher = {
      fullName: document.getElementById('teacherName').value,
      subjectExpertise: document.getElementById('teacherSubject').value,
      department: document.getElementById('teacherDepartment').value,
      email: document.getElementById('teacherEmail').value,
      password: document.getElementById('teacherPassword').value
    };
    try {
      const response = await fetch('/api/auth/teacher/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      });
      const data = await response.json();
      if (response.ok) {
        fetchTeachers();
        hideModal();
        showNotification('Teacher added successfully!');
      } else {
        showNotification(data.message || 'Failed to add teacher.');
      }
    } catch (err) {
      showNotification('Server error. Could not add teacher.');
    }
  });

  // Logout handling
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin-login';
  });

  // Initial data fetch
  fetchTeachers();
  fetchStudents();

  const allStudentList = document.getElementById('allStudentList');

  async function fetchApprovedStudents() {
    try {
      const response = await fetch('/api/admin/students/approved', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const approvedStudents = await response.json();
      renderApprovedStudents(approvedStudents);
    } catch (err) {
      showNotification('Failed to fetch approved students');
    }
  }

  function renderApprovedStudents(students) {
    allStudentList.innerHTML = '';
    students.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.fullName}</td>
        <td>${student.email}</td>
        <td>${student.enrollmentNumber}</td>
        <td>${student.courseProgram}</td>
        <td>${new Date(student.createdAt).toLocaleString()}</td>
      `;
      allStudentList.appendChild(row);
    });
  }
});

// Helper functions
function initializeAnimations() {
  // Initial load animations
  gsap.from('.sidebar', {
    x: -100,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });

  gsap.from('.header-content', {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });

  gsap.from('.stat-card', {
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  });

  gsap.from('.activity-item', {
    x: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  gsap.from(notification, {
    y: 50,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out'
  });

  setTimeout(() => {
    gsap.to(notification, {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => notification.remove()
    });
  }, 3000);
}

function editTeacher(index) {
  // TODO: Implement edit functionality
  showNotification('Edit functionality coming soon!');
}

function deleteTeacher(index) {
  if (confirm('Are you sure you want to delete this teacher?')) {
    teachers.splice(index, 1);
    renderTeachers();
    showNotification('Teacher deleted successfully!');
  }
}
  