      const topHeader    = document.getElementById('top-header');
      const burgerBtn    = document.getElementById('burgerBtn');
      const sideMenu     = document.getElementById('sideMenu');
      const navOverlay   = document.getElementById('navOverlay');
      const closeMenuBtn = document.getElementById('closeMenuBtn');
      const burgerIcon   = document.getElementById('burgerIcon');

      window.addEventListener('scroll', () => {
        topHeader.classList.toggle('is-scrolled', window.scrollY > 20);
      });

      function openMenu() {
        sideMenu.classList.add('is-open');
        navOverlay.classList.add('is-open');
        burgerIcon.className = 'ri-close-line';
        document.body.style.overflow = 'hidden';
      }
      function closeMenu() {
        sideMenu.classList.remove('is-open');
        navOverlay.classList.remove('is-open');
        burgerIcon.className = 'ri-menu-3-line';
        document.body.style.overflow = '';
      }

      burgerBtn.addEventListener('click', () =>
        sideMenu.classList.contains('is-open') ? closeMenu() : openMenu()
      );
      closeMenuBtn.addEventListener('click', closeMenu);
      navOverlay.addEventListener('click', closeMenu);

      const featureCards = document.querySelectorAll('.feature-card');
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), i * 100);
          }
        });
      }, { threshold: 0.1 });
      featureCards.forEach(card => cardObserver.observe(card));