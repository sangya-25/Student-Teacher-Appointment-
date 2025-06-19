document.addEventListener('DOMContentLoaded', () => {
    // Teacher Login Form
    const teacherLoginForm = document.getElementById('teacherLoginForm');
    const teacherEmailInput = document.getElementById('teacherEmail');
    const teacherPasswordInput = document.getElementById('teacherPassword');

    // Teacher Signup Form
    const teacherSignupForm = document.getElementById('teacherSignupForm');
    const teacherFullNameInput = document.getElementById('teacherFullName');
    const teacherSignupEmailInput = document.getElementById('teacherSignupEmail');
    const teacherSignupPasswordInput = document.getElementById('teacherSignupPassword');
    const teacherDepartmentInput = document.getElementById('teacherDepartment');
    const teacherSubjectExpertiseInput = document.getElementById('teacherSubjectExpertise');

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
        window.location.href = '/teacher-dashboard';
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

    // Handle Teacher Login
    if (teacherLoginForm) {
        teacherLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = teacherEmailInput.value;
            const password = teacherPasswordInput.value;

            try {
                const response = await fetch('/api/auth/teacher/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('teacherData', JSON.stringify(data.teacher));
                    showSuccess('Login successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        window.location.href = `/teacher-dashboard?token=${data.token}`;
                    }, 2000);
                } else {
                    showError(data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('An error occurred during login. Please try again.');
            }
        });
    }

    // Handle Teacher Signup
    if (teacherSignupForm) {
        teacherSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = teacherFullNameInput.value;
            const email = teacherSignupEmailInput.value;
            const password = teacherSignupPasswordInput.value;
            const department = teacherDepartmentInput.value;
            const subjectExpertise = teacherSubjectExpertiseInput.value;

            try {
                const response = await fetch('/api/auth/teacher/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fullName, email, password, department, subjectExpertise }),
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess('Signup successful! Redirecting to dashboard...');
                    setTimeout(() => {
                        window.location.href = `/teacher-dashboard?token=${data.token}`;
                    }, 2000);
                } else {
                    showError(data.message || 'Signup failed. Please try again.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showError('An error occurred during signup. Please try again.');
            }
        });
    }

    // Basic authentication check on page load (for login/signup pages)
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (token && (window.location.pathname === '/teacher-login' || window.location.pathname === '/teacher-signup')) {
            // Optionally verify token with backend for more robust check
            window.location.href = '/teacher-dashboard'; // Redirect if already logged in
        }
    };
    checkAuth();
}); 