document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const togglePassword = document.querySelector('.toggle-password');
  const eyeIcon = togglePassword.querySelector('i');

  // Toggle password visibility for password field
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

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
  }

  // Handle form submission (placeholder)
  const teacherSignupForm = document.getElementById('teacherSignupForm');
  teacherSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const department = document.getElementById('department').value;
    const subjectExpertise = document.getElementById('subjectExpertise').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Teacher Signup Attempt:', { fullName, email, password, department, subjectExpertise });
    alert('Teacher Signup functionality is not yet implemented. Check console for data.');
    // In a real application, you would send this to your backend.
    // Example: 
    // try {
    //   const response = await fetch('/api/teacher/signup', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ fullName, email, password, department, subjectExpertise }),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     alert('Signup successful! Please login.');
    //     window.location.href = '/teacher-login'; // Redirect to login
    //   } else {
    //     alert(data.message || 'Signup failed');
    //   }
    // } catch (error) {
    //   console.error('Signup error:', error);
    //   alert('An error occurred during signup');
    // }
  });
}); 