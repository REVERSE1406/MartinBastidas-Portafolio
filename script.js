document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('.page');
  if (page) {
    page.classList.add('show');
  }

  const scrollContainer = document.querySelector('.scroll-container');

  const projectsOverlay = document.getElementById('projects-overlay');
  const closeOverlayBtn = document.querySelector('.projects-overlay-close');

  if (scrollContainer && projectsOverlay) {
    let overlayVisible = false;

    const edgePx = 16;
    const holdMs = 5000;
    let holdTimer = null;

    const openOverlay = () => {
      if (overlayVisible) return;
      overlayVisible = true;
      projectsOverlay.classList.add('projects-overlay--visible');
      document.body.classList.add('overlay-open');
    };

    const cancelHold = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    const isOnAboutPanel = () => {
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const current = scrollContainer.scrollLeft;
      return maxScroll > 0 && current >= maxScroll - 10;
    };

    window.addEventListener('mousemove', (e) => {
      if (overlayVisible) return;
      if (!isOnAboutPanel()) {
        cancelHold();
        return;
      }

      const inRightEdge = e.clientX >= window.innerWidth - edgePx;

      if (!inRightEdge) {
        cancelHold();
        return;
      }

      if (!holdTimer) {
        holdTimer = setTimeout(() => {
          holdTimer = null;
          openOverlay();
        }, holdMs);
      }
    });

    window.addEventListener('mouseout', () => cancelHold());

    if (closeOverlayBtn) {
      closeOverlayBtn.addEventListener('click', () => {
        cancelHold();
        projectsOverlay.classList.remove('projects-overlay--visible');
        document.body.classList.remove('overlay-open');
        overlayVisible = false;
      });
    }
  }

  // --- CARRUSEL EN ONDA ---
  const waveTrack = document.querySelector('.wave-track');
  const waveCards = document.querySelectorAll('.wave-card');

  if (waveTrack && waveCards.length) {
    waveCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        waveTrack.style.animationPlayState = 'paused';
      });

      card.addEventListener('mouseleave', () => {
        waveTrack.style.animationPlayState = 'running';
      });
    });
  }
});
