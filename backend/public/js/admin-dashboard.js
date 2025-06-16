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
      
      // Update active states
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show target section with animation
      sections.forEach(section => {
        if (section.id === targetSection) {
          section.classList.add('active');
          gsap.from(section, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out'
          });
        } else {
          section.classList.remove('active');
        }
      });
    });
  });

  // Teacher management
  const teacherModal = document.getElementById('teacherModal');
  const addTeacherBtn = document.getElementById('addTeacherBtn');
  const closeModal = document.getElementById('closeModal');
  const cancelAdd = document.getElementById('cancelAdd');
  const teacherForm = document.getElementById('teacherForm');
  const teacherList = document.getElementById('teacherList');

  // Sample teacher data
  let teachers = [
    { name: "Dr. Sharma", subject: "Physics", dept: "Science", email: "sharma@uni.com", status: "Active" },
    { name: "Prof. Mehta", subject: "Math", dept: "Engineering", email: "mehta@uni.com", status: "Active" }
  ];

  // Render teachers table
  function renderTeachers() {
    teacherList.innerHTML = '';
    teachers.forEach((teacher, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${teacher.name}</td>
        <td>${teacher.subject}</td>
        <td>${teacher.dept}</td>
        <td>${teacher.email}</td>
        <td><span class="status-badge ${teacher.status.toLowerCase()}">${teacher.status}</span></td>
        <td>
          <button class="action-btn edit" onclick="editTeacher(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete" onclick="deleteTeacher(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      teacherList.appendChild(row);
    });
  }

  // Modal handling
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

  // Event listeners for modal
  addTeacherBtn.addEventListener('click', showModal);
  closeModal.addEventListener('click', hideModal);
  cancelAdd.addEventListener('click', hideModal);

  // Form submission
  teacherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTeacher = {
      name: document.getElementById('teacherName').value,
      subject: document.getElementById('teacherSubject').value,
      dept: document.getElementById('teacherDepartment').value,
      email: document.getElementById('teacherEmail').value,
      status: "Active"
    };
    
    teachers.push(newTeacher);
    renderTeachers();
    hideModal();
    
    // Show success message
    showNotification('Teacher added successfully!');
  });

  // Student approval handling
  const approveButtons = document.querySelectorAll('.approve-btn');
  const rejectButtons = document.querySelectorAll('.reject-btn');

  approveButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.approval-card');
      gsap.to(card, {
        x: 100,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => card.remove()
      });
      showNotification('Student approved successfully!');
    });
  });

  rejectButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.approval-card');
      gsap.to(card, {
        x: -100,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => card.remove()
      });
      showNotification('Student rejected');
    });
  });

  // Logout handling
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin-login';
  });

  // Initialize the dashboard
  renderTeachers();
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
  