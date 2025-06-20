document.addEventListener('DOMContentLoaded', () => {
  // Clear any stored tokens
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Animate login cards with stagger effect
  gsap.from('.login-card', {
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.5
  });

  // Add hover animations for login cards
  const loginCards = document.querySelectorAll('.login-card');
  loginCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1.05,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
    });
  });

  // Add hover animations for login buttons
  const loginButtons = document.querySelectorAll('.login-btn');
  loginButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1.05,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
    });
  });
}); 