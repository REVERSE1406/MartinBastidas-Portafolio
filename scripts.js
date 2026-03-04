document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('.page');
  if (page) page.classList.add('show');

  const scrollContainer = document.querySelector('.scroll-container');

  // --- 1. CURSOR PERSONALIZADO (OPTIMIZADO) ---
  const cursor = document.querySelector('.cursor-circle');
  const interactiveElements = document.querySelectorAll(
    'a, button, .portfolio-item, .soft-icon, .neon-card, .project-tile, .about-stack-card'
  );

  if (cursor) {
    let cursorX = 0;
    let cursorY = 0;
    let cursorNeedsUpdate = false;

    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorNeedsUpdate = true;
    });

    function updateCursor() {
      if (cursorNeedsUpdate) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursorNeedsUpdate = false;
      }
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }

  // --- 2. SCROLL HORIZONTAL: DRAG + RUEDA (SUAVE) ---
  if (scrollContainer) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Drag horizontal con click
    scrollContainer.addEventListener('mousedown', (e) => {
      // si se hizo clic dentro de un project-tile, no iniciar drag (para abrir el modal)
      if (e.target.closest('.project-tile')) return;

      isDown = true;
      document.body.classList.add('dragging');
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', () => {
      isDown = false;
      document.body.classList.remove('dragging');
    });

    scrollContainer.addEventListener('mouseup', () => {
      isDown = false;
      document.body.classList.remove('dragging');
    });

    scrollContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 1.2; // factor suave
      scrollContainer.scrollLeft = scrollLeft - walk;
    });

    // Rueda del mouse → scroll horizontal (usa deltaY directamente); en About usamos scroll vertical nativo
    window.addEventListener(
      'wheel',
      (e) => {
        if (document.body.classList.contains('about-page')) return;

        if (document.body.classList.contains('overlay-open')) return;

        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (maxScroll <= 0) return;

        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      },
      { passive: false }
    );
  }

  // --- 3. REVELACIÓN EN CASCADA + DETECCIÓN DEL PANEL DE INICIO + TYPING EN PROYECTOS ---
  let constellationActive = true;

  // variables para el typing en la sección de proyectos
  let projectsTypingStarted = false;
  const typingContainer = document.getElementById('projects-typing');
  const typingSpan = typingContainer ? typingContainer.querySelector('.projects-typing-text') : null;
  const typingCursor = typingContainer ? typingContainer.querySelector('.projects-typing-cursor') : null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        // nodos genéricos ocultos que se revelan (si los usas)
        if (el.classList.contains('hidden-node') && entry.isIntersecting) {
          el.classList.add('visible-node');
        }

        // activar/desactivar constelación según el panel de inicio
        if (el.id === 'home-panel') {
          constellationActive = entry.isIntersecting;
        }

        // cuando el panel de proyectos entra en vista, arrancamos el typing una sola vez
        if (el.id === 'projects-panel' && entry.isIntersecting) {
          if (!projectsTypingStarted && typingContainer && typingSpan) {
            projectsTypingStarted = true;
            typingContainer.classList.add('projects-typing--visible');
            startProjectsTyping();
          }
        }

        // cuando el panel about/stack entra en vista, animar las tarjetas de software
        if (el.id === 'about-panel' && entry.isIntersecting) {
          const wrap = document.getElementById('about-stack-wrap');
          if (wrap && !wrap.classList.contains('about-stack--visible')) {
            wrap.classList.add('about-stack--visible');
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.hidden-node').forEach((node) => observer.observe(node));
  const homePanel = document.getElementById('home-panel');
  if (homePanel) observer.observe(homePanel);

  const projectsPanel = document.getElementById('projects-panel');
  if (projectsPanel) observer.observe(projectsPanel);

  const aboutPanel = document.getElementById('about-panel');
  if (aboutPanel) observer.observe(aboutPanel);

  function startProjectsTyping() {
    if (!typingContainer || !typingSpan) return;

    const fullText = typingContainer.getAttribute('data-text') || '';
    let index = 0;
    const speed = 22; // ms por carácter

    function type() {
      if (!typingSpan) return;

      if (index <= fullText.length) {
        typingSpan.textContent = fullText.slice(0, index);
        index++;
        setTimeout(type, speed);
      } else {
        // cuando termina, dejamos el cursor parpadeando
        if (typingCursor) typingCursor.classList.add('projects-typing-cursor--done');
      }
    }

    type();
  }

  // --- 4. LA RED GALÁCTICA (Canvas Fijo con Atracción Magnética, OPTIMIZADA) ---
  const canvas = document.getElementById('constellation-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    // Rastreador del nodo activo para el efecto magnético
    let activeCard = null;

    // Actualizar mouse
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Detectar hover en los proyectos para activar la "gravedad" del nodo
    document.querySelectorAll('.neon-card').forEach((card) => {
      card.addEventListener('mouseenter', () => (activeCard = card));
      card.addEventListener('mouseleave', () => {
        if (activeCard === card) activeCard = null;
      });
    });

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    }
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
      }

      update(attractorX, attractorY, isStrongPull) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (attractorX !== null && attractorY !== null) {
          let dx = attractorX - this.x;
          let dy = attractorY - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          let pullRadius = isStrongPull ? 320 : 130;
          let pullStrength = isStrongPull ? 0.035 : 0.01;

          if (distance < pullRadius) {
            this.x += dx * pullStrength;
            this.y += dy * pullStrength;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0077ff';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const nodeCount = width < 768 ? 25 : 45;
      for (let i = 0; i < nodeCount; i++) particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      if (!constellationActive) {
        requestAnimationFrame(animate);
        return;
      }

      let attractorX = mouse.x;
      let attractorY = mouse.y;
      let isStrongPull = false;

      if (activeCard) {
        const rect = activeCard.getBoundingClientRect();
        attractorX = rect.left + rect.width / 2;
        attractorY = rect.top + rect.height / 2;
        isStrongPull = true;
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(attractorX, attractorY, isStrongPull);

        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 119, 255, ${1 - distance / 90})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        particles[i].draw();
      }

      if (attractorX !== null && attractorY !== null) {
        let maxLines = isStrongPull ? 12 : 4;
        let connections = 0;

        for (let i = 0; i < particles.length; i++) {
          if (connections >= maxLines) break;

          let dx = attractorX - particles[i].x;
          let dy = attractorY - particles[i].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let connectionRadius = isStrongPull ? 300 : 120;

          if (distance < connectionRadius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 200, 255, ${(1 - distance / connectionRadius) * 0.8})`;
            ctx.lineWidth = isStrongPull ? 1.4 : 1;
            ctx.moveTo(attractorX, attractorY);
            ctx.lineTo(particles[i].x, particles[i].y);
            ctx.stroke();
            connections++;
          }
        }
      }
      requestAnimationFrame(animate);
    }
    resizeCanvas();
    animate();
  }

  // --- 5. MODAL DE PROYECTOS (mini ventana flotante) ---
  const projectModal = document.getElementById('project-modal');
  const projectModalImage = document.getElementById('project-modal-image');
  const projectModalTitle = document.getElementById('project-modal-title');
  const projectModalDescription = document.getElementById('project-modal-description');
  const projectModalProcess = document.getElementById('project-modal-process');
  const projectModalProcessWrap = document.getElementById('project-modal-process-wrap');
  const projectModalToolsList = document.getElementById('project-modal-tools-list');
  const projectModalImageWrapper = document.querySelector('.project-modal-image-wrapper');
  const projectImageFull = document.getElementById('project-image-full');
  const projectImageFullImg = document.getElementById('project-image-full-img');
  const projectImageFullClose = document.getElementById('project-image-full-close');
  const projectModalClose = document.querySelector('.project-modal-close');
  const projectModalExit = document.querySelector('.project-modal-exit');
  const projectModalNext = document.querySelector('.project-modal-next');

  if (projectModal && projectModalImage && projectModalTitle && projectModalDescription) {
    const PROJECT_IDS = [
      'mano-negra',
      'mar-y-vivo',
      'retrato-digital',
      'proyecto-ilustrado',
      'diseno-editorial',
      'poster-digital',
    ];

    const APP_LOGOS = {
      'after-effects': { name: 'After Effects', img: '_imagenes/aftereffects.jpg' },
      illustrator: { name: 'Illustrator', img: '_imagenes/illustratorlogo.jpg' },
      photoshop: { name: 'Photoshop', img: '_imagenes/photoshoplogo.jpg' },
      unity: { name: 'Unity', img: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Unity_Technologies_logo.svg' },
    };

    const PROJECT_DETAILS = {
      'mano-negra': {
        title: 'La Mano Negra',
        img: '_imagenes/manonegra.jpg',
        description:
          'Proyecto experimental centrado en composición, iluminación dramática y narrativa visual alrededor del personaje de la “Mano Negra”.',
        process:
          'Partí de una fotografía de arquitectura en tonos sepia. Añadí la mano en negro con máscaras y ajustes de capas, integré las aves y la atmósfera con pinceles de textura y corrección de color para unificar el clima visual.',
        apps: ['photoshop', 'illustrator'],
      },
      'mar-y-vivo': {
        title: 'Im a Rocket',
        img: '_imagenes/rocket.jpg',
        description:
          'Exploración de color y movimiento inspirada en el espacio. Trabajo de capas, efectos de agua y tipografía integrada a la imagen.',
        process:
          'Composición en capas: fondo espacial con partículas y nebulosas, figura del astronauta y tipografía "ROCKET" integrada. Uso de ajustes de color, máscaras y efectos de luz para dar profundidad y sensación de movimiento.',
        apps: ['photoshop', 'after-effects'],
      },
      'retrato-digital': {
        title: 'Retrato Digital',
        img: '_imagenes/zombie.jpg',
        description:
          'Retrato ilustrado en digital combinando texturas fotográficas y pinceles personalizados para resaltar volumen y expresión.',
        process:
          'Retrato fotográfico base retocado y pintado sobre con pinceles de textura y sangre. Escena de cementerio con calabazas y velas añadidas por capas. Iluminación y sombras pintadas a mano para un resultado tipo poster de terror.',
        apps: ['photoshop', 'illustrator'],
      },
      'proyecto-ilustrado': {
        title: 'The Devil Face',
        img: '_imagenes/diablo.jpg',
        description:
          'Serie de ilustraciones narrativas donde se exploran personajes y escenarios con énfasis en color y silueta.',
        process:
          'Fotografía de retrato con filtro/makeup de diablo. Postproducción para reforzar cuernos, ojos y ambiente. Ajustes de color y contraste para un look impactante y coherente con la narrativa visual.',
        apps: ['photoshop'],
      },
      'diseno-editorial': {
        title: 'M & M',
        img: '_imagenes/MYM.jpg',
        description:
          'Maquetación y diseño de piezas editoriales impresas y digitales, buscando ritmo visual y lectura cómoda.',
        process:
          'Composición de producto (M&M y copa) sobre fondo neutro. Iluminación y sombras pintadas, corrección de color y retoque para publicidad o packaging. Enfoque en claridad del producto y equilibrio visual.',
        apps: ['photoshop', 'illustrator'],
      },
      'poster-digital': {
        title: 'Tide & Trace',
        img: '_imagenes/martinarena.jpg',
        description: 'Póster digital con foco en composición central, tipografía fuerte y uso de luces de neón.',
        process:
          'Ilustración de personaje en contexto playa/deportivo. Composición con castillo de arena y tipografía integrada. Color y atmósfera trabajados para un resultado fresco y narrativo, apto para cartel o portada.',
        apps: ['illustrator', 'photoshop'],
      },
    };

    let currentProjectId = null;

    const openProjectModal = (projectId) => {
      const data = PROJECT_DETAILS[projectId];
      if (!data) return;

      currentProjectId = projectId;
      projectModalImage.src = data.img;
      projectModalImage.alt = data.title;
      projectModalTitle.textContent = data.title;
      projectModalDescription.textContent = data.description;

      if (projectModalProcess && projectModalProcessWrap) {
        if (data.process) {
          projectModalProcess.textContent = data.process;
          projectModalProcessWrap.style.display = '';
        } else {
          projectModalProcessWrap.style.display = 'none';
        }
      }

      if (projectModalToolsList && data.apps && data.apps.length) {
        projectModalToolsList.innerHTML = '';
        data.apps.forEach((appKey) => {
          const app = APP_LOGOS[appKey];
          if (!app) return;
          const item = document.createElement('div');
          item.className = 'project-modal-tool-item';
          item.innerHTML = `<img src="${app.img}" alt="${app.name}" /><span>${app.name}</span>`;
          projectModalToolsList.appendChild(item);
        });
      }

      projectModal.classList.add('project-modal--visible');
      document.body.classList.add('overlay-open');
    };

    // Imagen a tamaño completo dentro del modal
    if (projectModalImageWrapper && projectImageFull && projectImageFullImg) {
      projectModalImageWrapper.addEventListener('click', () => {
        if (!projectModalImage || !projectModalImage.src) return;
        projectImageFullImg.src = projectModalImage.src;
        projectImageFullImg.alt = projectModalImage.alt || '';
        projectImageFull.classList.add('project-image-full--visible');
      });

      const closeFullImage = () => {
        projectImageFull.classList.remove('project-image-full--visible');
      };

      if (projectImageFullClose) {
        projectImageFullClose.addEventListener('click', (e) => {
          e.stopPropagation();
          closeFullImage();
        });
      }

      projectImageFull.addEventListener('click', (e) => {
        if (e.target === projectImageFull) {
          closeFullImage();
        }
      });
    }

    const closeProjectModal = () => {
      projectModal.classList.remove('project-modal--visible');
      document.body.classList.remove('overlay-open');
    };

    const goToNextProject = () => {
      if (!currentProjectId) return;
      const idx = PROJECT_IDS.indexOf(currentProjectId);
      const nextIdx = (idx + 1) % PROJECT_IDS.length;
      openProjectModal(PROJECT_IDS[nextIdx]);
    };

    document.querySelectorAll('.project-tile').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = tile.dataset.projectId;
        openProjectModal(id);
      });
    });

    document.querySelectorAll('.wave-card[data-project-id]').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.projectId;
        openProjectModal(id);
      });
    });

    if (projectModalClose) {
      projectModalClose.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeProjectModal();
      });
    }

    if (projectModalExit) {
      projectModalExit.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeProjectModal();
      });
    }

    if (projectModalNext) {
      projectModalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        goToNextProject();
      });
    }

    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProjectModal();
    });
  }
});

// --- 6. REPRODUCTOR PERSONALIZADO EN ABOUT (MÚSICA) ---
const musicPlayers = document.querySelectorAll('.music-player');
const allAudios = [];
let currentMusicAudio = null;
const floatingBadge = document.getElementById('floating-music-badge');
const floatingBadgeTitle = document.getElementById('floating-music-title');
const floatingBadgeToggle = floatingBadge ? floatingBadge.querySelector('.floating-music-toggle') : null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

musicPlayers.forEach((player) => {
  const src = player.getAttribute('data-audio-src');
  if (!src) return;

  const audio = new Audio(src);
  audio.preload = 'metadata';
  allAudios.push(audio);

  const playBtn = player.querySelector('.music-play-toggle');
  const progress = player.querySelector('.music-progress');
  const bar = player.querySelector('.music-progress-bar');
  const currentTimeEl = player.querySelector('.music-time-current');
  const totalTimeEl = player.querySelector('.music-time-total');
  const trackTitle = player.getAttribute('data-track-title') || 'Reproduciendo';

  // Cargar duración
  audio.addEventListener('loadedmetadata', () => {
    if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
  });

  // Actualizar barra y tiempo actual
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const ratio = audio.currentTime / audio.duration;
    if (bar) bar.style.width = `${ratio * 100}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // Cambiar icono al pausar/terminar
  audio.addEventListener('pause', () => {
    if (playBtn) playBtn.textContent = '▶';
    player.classList.remove('music-playing');
    if (floatingBadge && currentMusicAudio === audio && audio.paused) {
      floatingBadgeToggle && (floatingBadgeToggle.textContent = '▶');
    }
  });

  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    if (bar) bar.style.width = '0%';
    if (playBtn) playBtn.textContent = '▶';
    player.classList.remove('music-playing');
    if (floatingBadge && currentMusicAudio === audio) {
      floatingBadge.classList.remove('floating-music-badge--visible');
    }
  });

  // Botón play/pause
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        // pausar cualquier otro audio que esté sonando
        allAudios.forEach((other) => {
          if (other !== audio) other.pause();
        });
        audio.play();
        playBtn.textContent = '⏸';
        player.classList.add('music-playing');
        currentMusicAudio = audio;
        if (floatingBadge && floatingBadgeTitle && floatingBadgeToggle) {
          floatingBadgeTitle.textContent = trackTitle;
          floatingBadgeToggle.textContent = '⏸';
          floatingBadge.classList.add('floating-music-badge--visible');
        }
      } else {
        audio.pause();
      }
    });
  }

  // Click en la barra para saltar
  if (progress) {
    progress.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = progress.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(audio.duration * ratio, audio.duration));
    });
  }
});

// Control desde la mini tarjeta flotante
if (floatingBadge && floatingBadgeToggle) {
  floatingBadgeToggle.addEventListener('click', () => {
    if (!currentMusicAudio) return;
    if (currentMusicAudio.paused) {
      // pausar cualquier otro audio
      allAudios.forEach((other) => {
        if (other !== currentMusicAudio) other.pause();
      });
      currentMusicAudio.play();
      floatingBadgeToggle.textContent = '⏸';
    } else {
      currentMusicAudio.pause();
      floatingBadgeToggle.textContent = '▶';
    }
  });
}
// --- Efecto de escritura en About (texto que se va escribiendo) ---
(function aboutTyping() {
  const container = document.getElementById('about-hero-text');
  const output = document.getElementById('about-typing-output');
  if (!container || !output) return;

  const text = container.getAttribute('data-typing-text') || '';
  if (!text) return;

  let started = false;
  let index = 0;
  const speed = 28;

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting || started) return;
      started = true;
      function type() {
        if (index <= text.length) {
          output.textContent = text.slice(0, index);
          index++;
          setTimeout(type, speed);
        } else {
          container.classList.add('about-typing-done');
        }
      }
      type();
    },
    { threshold: 0.3, rootMargin: '0px' }
  );
  observer.observe(container);
})();
