document.addEventListener('DOMContentLoaded', () => {
  // Animación de entrada (por si este script se usa en otra página)
  const page = document.querySelector('.page');
  if (page) {
    page.classList.add('show');
  }

  const scrollContainer = document.querySelector('.scroll-container');

  // --- OVERLAY DE PROYECTOS ACTIVADO POR "HOT ZONE" DERECHA (5s) ---
  const projectsOverlay = document.getElementById('projects-overlay');
  const closeOverlayBtn = document.querySelector('.projects-overlay-close');

  if (scrollContainer && projectsOverlay) {
    let overlayVisible = false;

    const edgePx = 16; // zona activa: últimos 16px a la derecha
    const holdMs = 5000; // sostener 5 segundos para abrir
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

    // Solo activar el overlay cuando ya estamos en el panel de ABOUT (final del scroll)
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

  // --- CARRUSEL EN ONDA (overlay proyectos) ---
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
