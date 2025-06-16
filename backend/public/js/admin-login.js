// Initialize GSAP animations when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('adminToken');
  if (token) {
    window.location.href = '/admin-dashboard';
    return;
  }

  // Initial animation for the login card
  gsap.from('.login-card', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  });

  // Floating animation
  gsap.to('.login-card', {
    duration: 2,
    y: '10px',
    rotationY: 5,
    ease: 'power1.inOut',
    repeat: -1,
    yoyo: true
  });

  // Add hover effect for the login button
  const loginBtn = document.querySelector('.login-btn');
  loginBtn.addEventListener('mouseenter', () => {
    gsap.to(loginBtn, {
      duration: 0.3,
      scale: 1.05,
      ease: 'power2.out'
    });
  });

  loginBtn.addEventListener('mouseleave', () => {
    gsap.to(loginBtn, {
      duration: 0.3,
      scale: 1,
      ease: 'power2.out'
    });
  });

  // Add subtle animation to input fields on focus
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, {
        duration: 0.3,
        scale: 1.02,
        ease: 'power2.out'
      });
    });

    input.addEventListener('blur', () => {
      gsap.to(input, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
    });
  });

  // Password visibility toggle functionality
  const passwordInput = document.getElementById('password');
  const togglePassword = document.querySelector('.toggle-password');
  const eyeIcon = togglePassword.querySelector('i');

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

  // Handle form submission
  const adminLoginForm = document.getElementById('adminLoginForm');
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // Show success message
        alert('Login successful! Redirecting to dashboard...');

        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard';
      } else {
        // Login failed
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  });
});
  