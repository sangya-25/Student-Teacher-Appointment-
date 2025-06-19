document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Add logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to welcome page
          window.location.href = '/';
        } else {
          console.error('Logout failed');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    });
  }

  // Verify token validity
  const verifyToken = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const endpoint = user.role === 'teacher' ? '/api/teacher/dashboard-data' : '/api/student/dashboard-data';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // If token is invalid, clear storage and redirect to welcome page
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // On error, redirect to welcome page
      window.location.href = '/';
    }
  };

  // Verify token on page load
  verifyToken();
}); 