document.addEventListener('DOMContentLoaded', () => {
    // Student Login Form
    const studentLoginForm = document.getElementById('studentLoginForm');
    const studentEmailInput = document.getElementById('studentEmail');
    const studentPasswordInput = document.getElementById('studentPassword');

    // Student Signup Form
    const studentSignupForm = document.getElementById('studentSignupForm');
    const studentFullNameInput = document.getElementById('studentFullName');
    const studentSignupEmailInput = document.getElementById('studentSignupEmail');
    const studentSignupPasswordInput = document.getElementById('studentSignupPassword');
    const studentEnrollmentNumberInput = document.getElementById('studentEnrollmentNumber');
    const studentCourseInput = document.getElementById('studentCourse');

    // Message elements
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const passwordInput = button.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/student-dashboard';
        return;
    }

    // Show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            if (successMessage) successMessage.style.display = 'none';
        }
    }

    // Show success message
    function showSuccess(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            if (errorMessage) errorMessage.style.display = 'none';
        }
    }

    // Handle Student Login
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = studentEmailInput.value;
            const password = studentPasswordInput.value;

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
                    showSuccess('Login successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        window.location.href = `/student-dashboard?token=${data.token}`;
                    }, 2000);
                } else {
                    showError(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('An error occurred. Please try again.');
            }
        });
    }

    // Handle Student Signup
    if (studentSignupForm) {
        studentSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = studentFullNameInput.value;
            const email = studentSignupEmailInput.value;
            const password = studentSignupPasswordInput.value;
            const enrollmentNumber = studentEnrollmentNumberInput.value;
            const courseProgram = studentCourseInput.value;

            try {
                const response = await fetch('/api/auth/student/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        fullName, 
                        email, 
                        password, 
                        enrollmentNumber, 
                        courseProgram
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess('Signup successful! Your registration is pending admin approval. You will be able to log in once approved.');
                    setTimeout(() => {
                        window.location.href = '/student-login';
                    }, 3000);
                } else {
                    showError(data.message || 'Signup failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showError('An error occurred. Please try again.');
            }
        });
    }

    // Basic authentication check on page load (for login/signup pages)
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (token && (window.location.pathname === '/student-login' || window.location.pathname === '/student-signup')) {
            // Optionally verify token with backend for more robust check
            window.location.href = '/student-dashboard'; // Redirect if already logged in
        }
    };
    checkAuth();
}); 