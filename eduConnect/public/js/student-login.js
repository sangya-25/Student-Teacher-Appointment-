document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const togglePassword = document.querySelector('.toggle-password');
  const eyeIcon = togglePassword.querySelector('i');

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle eye icon with animation
    gsap.to(eyeIcon, {
      duration: 0.3,
      scale: 0,
      opacity: 0,
      ease: 'power2.in',
      onComplete: () => {
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
        gsap.to(eyeIcon, {
          duration: 0.3,
          scale: 1,
          opacity: 1,
          ease: 'power2.out'
        });
      }
    });
  });

  // Handle form submission (placeholder)
  const studentLoginForm = document.getElementById('studentLoginForm');
  studentLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('studentData', JSON.stringify(data.student));
        window.location.href = '/pages/student-dashboard.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });
}); 