    document.addEventListener('DOMContentLoaded', () => {
      const scrollContainer = document.getElementById('scrollContainer');
      const scrollContent = document.getElementById('scrollContent');
      const backToTopButton = document.getElementById('backToTop');

      let currentScroll = 0;
      let targetScroll = 0;
      let isScrolling = false;
      let animationId = null;
      let lastWheelTime = 0;
      let wheelVelocity = 0;


      const updateScroll = () => {

        const maxScroll = scrollContent.offsetHeight - scrollContainer.offsetHeight;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

 
        const diff = targetScroll - currentScroll;
        
        if (Math.abs(diff) < 0.5) {
          currentScroll = targetScroll;
        } else {

          currentScroll += diff * 0.1;
        }

        scrollContent.style.transform = `translate3d(0, -${currentScroll}px, 0)`;


        if (Math.abs(diff) > 0.5 || isScrolling) {
          animationId = requestAnimationFrame(updateScroll);
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
          isScrolling = false;
        }

        toggleBackToTop();
      };


      const handleWheel = (e) => {
        e.preventDefault();
        
        const now = Date.now();
        const timeDiff = now - lastWheelTime;
        lastWheelTime = now;


        const delta = e.deltaY;
        if (timeDiff < 100) {
          wheelVelocity = delta * 1.5; 
        } else {
          wheelVelocity = delta;
        }


        targetScroll += wheelVelocity;
        

        if (!animationId) {
          isScrolling = true;
          animationId = requestAnimationFrame(updateScroll);
        }
      };


      let touchStartY = 0;
      let isTouching = false;

      const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
        isTouching = true;

        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      };

      const handleTouchMove = (e) => {
        if (!isTouching) return;
        e.preventDefault();
        
        const touchY = e.touches[0].clientY;
        const delta = touchStartY - touchY;
        
        targetScroll += delta * 2; 
        currentScroll = targetScroll; 
        scrollContent.style.transform = `translate3d(0, -${currentScroll}px, 0)`;
        
        touchStartY = touchY;
        
        toggleBackToTop();
      };

      const handleTouchEnd = (e) => {
        if (!isTouching) return;
        isTouching = false;
        
        // инерция
        const touchY = e.changedTouches[0].clientY;
        const delta = touchStartY - touchY;
        wheelVelocity = delta * 0.5;
        
        if (Math.abs(wheelVelocity) > 1) {
          targetScroll += wheelVelocity * 10;
          isScrolling = true;
          animationId = requestAnimationFrame(updateScroll);
        }
      };

      backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        
        const startTime = performance.now();
        const startPosition = currentScroll;
        const distance = -startPosition; 
        const duration = 800;

        const animateToTop = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
          const easedProgress = easeOutCubic(progress);
          
          targetScroll = startPosition + distance * easedProgress;
          currentScroll = targetScroll;
          
          scrollContent.style.transform = `translate3d(0, -${currentScroll}px, 0)`;
          
          if (progress < 1) {
            requestAnimationFrame(animateToTop);
          } else {

            targetScroll = 0;
            currentScroll = 0;
            scrollContent.style.transform = `translate3d(0, 0, 0)`;
            toggleBackToTop();
          }
        };

        requestAnimationFrame(animateToTop);
      });

      // плавный якорь
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor !== backToTopButton) {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            // цель
            const elementRect = targetElement.getBoundingClientRect();
            const contentRect = scrollContent.getBoundingClientRect();
            
            const offset = 80;
            const targetPosition = elementRect.top - contentRect.top + currentScroll - offset;

            // плавный скролл
            const startTime = performance.now();
            const startPosition = targetScroll;
            const distance = targetPosition - startPosition;
            const duration = 800;

            const animateScroll = (currentTime) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // easing функция
              const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
              const easedProgress = easeOutCubic(progress);
              
              targetScroll = startPosition + distance * easedProgress;
              
              if (progress < 1) {
                requestAnimationFrame(animateScroll);
              }
            };

            requestAnimationFrame(animateScroll);
          });
        }
      });

      // наверх
      const toggleBackToTop = () => {
        if (currentScroll > 600) {
          backToTopButton.classList.add('show');
        } else {
          backToTopButton.classList.remove('show');
        }
      };

      //Анимкака скролла
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      }, { 
        threshold: 0.1,
        root: scrollContainer
      });

      document.querySelectorAll('.plate-card, .step, .constructor-preview').forEach(el => {
        observer.observe(el);
      });

      //едитор номера
      const prefix = document.getElementById('prefix');
      const number = document.getElementById('number');
      const suffix = document.getElementById('suffix');
      const preview = document.getElementById('previewText');

      const updatePreview = () => {
        preview.textContent = `${prefix.value} ${number.value} ${suffix.value}`;
      };

      [prefix, number, suffix].forEach(select => {
        select.addEventListener('change', updatePreview);
      });

      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
      scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
      scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
      scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

      updateScroll();
    });