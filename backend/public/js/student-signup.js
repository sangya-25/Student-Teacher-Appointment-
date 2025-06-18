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
  const studentSignupForm = document.getElementById('studentSignupForm');
  studentSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const enrollmentNumber = document.getElementById('enrollmentNumber').value;
    const courseProgram = document.getElementById('courseProgram').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Student Signup Attempt:', { fullName, email, password, enrollmentNumber, courseProgram });
    alert('Student Signup functionality is not yet implemented. Check console for data.');
    // In a real application, you would send this to your backend.
    // Example: 
    // try {
    //   const response = await fetch('/api/student/signup', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ fullName, email, password, enrollmentNumber, courseProgram }),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     alert('Signup successful! Please login.');
    //     window.location.href = '/student-login'; // Redirect to login
    //   } else {
    //     alert(data.message || 'Signup failed');
    //   }
    // } catch (error) {
    //   console.error('Signup error:', error);
    //   alert('An error occurred during signup');
    // }
  });
}); 