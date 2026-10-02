// ========================================================
// Insightología - Oráculo por los 30 años de El Ojo de Iberoamérica
// app.js - Máquina de estados, animaciones GSAP y lógica interactiva
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const stage = document.getElementById('stage');
  const inputPanel = document.getElementById('input-panel');
  const userInput = document.getElementById('user-input');
  const oracleForm = document.getElementById('oracle-form');
  const btnSend = document.getElementById('btn-send');
  const btnMic = document.getElementById('btn-mic');
  const micStatus = document.getElementById('mic-status');
  const thirdEyeGlow = document.getElementById('third-eye-glow');
  const thirdEyeInteractive = document.getElementById('third-eye-interactive');
  const thirdEyePupil = document.getElementById('third-eye-pupil');
  const ballContent = document.getElementById('ball-content');
  const ballPlasma = document.getElementById('ball-plasma');
  const ballPlasmaCore = document.getElementById('ball-plasma-core');
  const floatingQuestion = document.getElementById('floating-question');
  const phraseContainer = document.getElementById('phrase-container');
  const phraseText = document.getElementById('phrase-text');
  const phraseCredit = document.getElementById('phrase-credit');
  const phraseLinkWrapper = document.getElementById('phrase-link-wrapper');
  const phraseLink = document.getElementById('phrase-link');
  const revealControls = document.getElementById('reveal-controls');
  const btnReset = document.getElementById('btn-reset');
  const particlesCanvas = document.getElementById('particles-canvas');
  const feTurbulence = document.getElementById('feTurbulence');
  const btnSound = document.getElementById('btn-sound');
  const iconSoundOn = btnSound ? btnSound.querySelector('.icon-sound-on') : null;
  const iconSoundOff = btnSound ? btnSound.querySelector('.icon-sound-off') : null;
  const audioWind = document.getElementById('audio-wind');
  const audioOffice = document.getElementById('audio-office');

  // Menú Hamburguesa y Modal "¿Qué estoy viendo?"
  const btnMenu = document.getElementById('btn-menu');
  const menuDropdown = document.getElementById('menu-dropdown');
  const menuBtnAbout = document.getElementById('menu-btn-about');
  const modalAbout = document.getElementById('modal-about');
  const modalAboutStage = document.getElementById('modal-about-stage');
  const modalAboutClose = document.getElementById('modal-about-close');
  const langBtnEs = document.getElementById('lang-btn-es');
  const langBtnPt = document.getElementById('lang-btn-pt');
  const langLabelText = document.getElementById('lang-label-text');

  // Idioma activo y textos localizados (ES / PT)
  let currentLang = 'es';
  try {
    currentLang = localStorage.getItem('insightologia_lang') || 'es';
  } catch (e) {
    currentLang = 'es';
  }
  let currentRevealedData = null;

  const I18N = {
    es: {
      langLabel: 'Idioma',
      aboutMenu: '¿Qué estoy viendo?',
      inputPlaceholder: '¿Qué querés saber del futuro?',
      btnMicTitle: 'Dictar pregunta (Voz)',
      btnMicAria: 'Dictar por voz',
      btnSendTitle: 'Consultar al oráculo',
      btnSendAria: 'Consultar al oráculo',
      btnReset: 'Hacer otra pregunta',
      phraseLink: 'VER MÁS ALLÁ',
      gyroPermission: 'Permitir experiencia inmersiva',
      listening: 'Escuchando tu pregunta...',
      aboutTitle: '¿QUÉ ESTOY VIENDO?',
      aboutP1: 'Hace 30 años, El Ojo reúne las ideas que abrieron la mirada de Iberoamérica. Hoy, imaginar los próximos 30 parece casi imposible: el futuro de la creatividad cambia tan rápido que hasta los que más saben a veces también lo describen como un horóscopo.',
      aboutP2: 'Este es el primer oráculo de la creatividad iberoamericana, hecho con 30 años del archivo de El Ojo. Si el futuro todavía no está escrito, ¿Por qué no usar todo lo que ya hicimos para tener una pista de cómo empezar a imaginarlo?',
      aboutP3: 'Llegaste a una web accesible desde cualquier parte del mundo, alimentada con 30 años de frases, jingles, titulares y piezas de la publicidad iberoamericana. Hacés una pregunta sobre el futuro y el insightólogo de turno (te puede tocar Pérez, Papón, Mercado, Vega Olmos, Del Campo y muchos más) te responde con una frase del pasado para pensar lo que viene. Además, podés sugerir nuevas frases, para seguir construyendo entre todos el gran acervo de sabiduría creativa insightológica.',
      soundMute: 'Silenciar sonido',
      soundUnmute: 'Activar sonido',
      menuTitle: 'Menú',
      modalCloseTitle: 'Cerrar'
    },
    pt: {
      langLabel: 'Idioma',
      aboutMenu: 'O que estou vendo?',
      inputPlaceholder: 'O que você quer saber do futuro?',
      btnMicTitle: 'Ditar pergunta (Voz)',
      btnMicAria: 'Ditar por voz',
      btnSendTitle: 'Consultar o oráculo',
      btnSendAria: 'Consultar o oráculo',
      btnReset: 'Fazer outra pergunta',
      phraseLink: 'VER MAIS ALÉM',
      gyroPermission: 'Permitir experiência imersiva',
      listening: 'Ouvindo sua pergunta...',
      aboutTitle: 'O QUE ESTOU VENDO?',
      aboutP1: 'Há 30 anos, El Ojo reúne as ideias que abriram o olhar da Ibero-América. Hoje, imaginar os próximos 30 parece quase impossível: o futuro da criatividade muda tão rápido que até quem mais entende às vezes também o descreve como um horóscopo.',
      aboutP2: 'Este é o primeiro oráculo da criatividade ibero-americana, feito com 30 anos do acervo de El Ojo. Se o futuro ainda não foi escrito, por que não usar tudo o que já fizemos para ter uma pista de como começar a imaginá-lo?',
      aboutP3: 'Você chegou a um site acessível de cualquier lugar do mundo, alimentado com 30 anos de frases, jingles, títulos e peças da publicidade ibero-americana. Você faz uma pergunta sobre o futuro e o insightólogo da vez (pode sair Pérez, Papón, Mercado, Vega Olmos, Del Campo e muitos outros) responde com uma frase do passado para pensar no que está por vir. Além disso, você pode sugerir novas frases, para continuarmos construindo juntos o grande acervo de sabedoria criativa insightológica.',
      soundMute: 'Silenciar som',
      soundUnmute: 'Ativar som',
      menuTitle: 'Menu',
      modalCloseTitle: 'Fechar'
    }
  };

  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'pt') lang = 'es';
    currentLang = lang;
    try {
      localStorage.setItem('insightologia_lang', lang);
    } catch (e) {}

    // Botones del toggle
    if (langBtnEs) {
      langBtnEs.classList.toggle('is-active', lang === 'es');
      langBtnEs.setAttribute('aria-pressed', lang === 'es' ? 'true' : 'false');
    }
    if (langBtnPt) {
      langBtnPt.classList.toggle('is-active', lang === 'pt');
      langBtnPt.setAttribute('aria-pressed', lang === 'pt' ? 'true' : 'false');
    }
    if (langLabelText) {
      langLabelText.textContent = I18N[lang].langLabel;
    }

    const t = I18N[lang];

    if (menuBtnAbout) menuBtnAbout.textContent = t.aboutMenu;
    if (userInput) userInput.placeholder = t.inputPlaceholder;

    if (btnMic) {
      btnMic.title = t.btnMicTitle;
      btnMic.setAttribute('aria-label', t.btnMicAria);
    }
    if (btnSend) {
      btnSend.title = t.btnSendTitle;
      btnSend.setAttribute('aria-label', t.btnSendAria);
    }
    if (btnReset) btnReset.textContent = t.btnReset;
    if (phraseLink) phraseLink.textContent = t.phraseLink;

    const gyroSpan = document.querySelector('#btn-gyro-permission span');
    if (gyroSpan) gyroSpan.textContent = t.gyroPermission;

    const modalTitleEl = document.querySelector('.modal-about-title');
    if (modalTitleEl) modalTitleEl.textContent = t.aboutTitle;

    const modalBodyEl = document.querySelector('.modal-about-body');
    if (modalBodyEl) {
      modalBodyEl.innerHTML = `
        <p>${t.aboutP1}</p>
        <p>${t.aboutP2}</p>
        <p>${t.aboutP3}</p>
      `;
    }

    if (btnSound) {
      const soundLabel = isMuted ? t.soundUnmute : t.soundMute;
      btnSound.setAttribute('title', soundLabel);
      btnSound.setAttribute('aria-label', soundLabel);
    }
    if (btnMenu) {
      btnMenu.setAttribute('title', t.menuTitle);
    }
    if (modalAboutClose) {
      modalAboutClose.setAttribute('title', t.modalCloseTitle);
      modalAboutClose.setAttribute('aria-label', t.modalCloseTitle);
    }
    if (modalAbout) {
      modalAbout.setAttribute('aria-label', t.aboutTitle);
    }

    if (recognition) {
      try {
        recognition.lang = lang === 'pt' ? 'pt-BR' : 'es-AR';
      } catch (e) {}
    }

    // Si hay una frase revelada en este momento, actualizar su texto y crédito de inmediato
    if (state === 'REVEAL' && currentRevealedData) {
      if (currentRevealedData.id && typeof CONFIG !== 'undefined' && CONFIG.CATALOG_PHRASES) {
        const catalogMatch = CONFIG.CATALOG_PHRASES.find(item => String(item.id) === String(currentRevealedData.id));
        if (catalogMatch) {
          if (!currentRevealedData.frase_pt && catalogMatch.frase_pt) currentRevealedData.frase_pt = catalogMatch.frase_pt;
          if (!currentRevealedData.pais_pt && catalogMatch.pais_pt) currentRevealedData.pais_pt = catalogMatch.pais_pt;
          if (!currentRevealedData.link && catalogMatch.link) currentRevealedData.link = catalogMatch.link;
        }
      }

      const phraseContent = (lang === 'pt' && currentRevealedData.frase_pt) ? currentRevealedData.frase_pt : (currentRevealedData.frase_es || currentRevealedData.frase);
      
      // Renderizar con palabras visibles inmediatamente
      renderPhraseText(phraseContent, true);
      phraseCredit.textContent = formatPhraseCredit(currentRevealedData, lang);
      adjustAdaptiveFontSize(phraseContent);

      // Animación suave de transición en vivo (crossfade de las palabras)
      const words = phraseText.querySelectorAll('.phrase-word');
      if (typeof gsap !== 'undefined' && words.length > 0 && !prefersReducedMotion) {
        gsap.killTweensOf(words);
        gsap.fromTo(words, 
          { opacity: 0.2, filter: 'blur(5px)', y: 3 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.35, stagger: 0.02, ease: 'power2.out' }
        );
      }
    }
  }

  // Estado del sistema
  let state = 'IDLE'; // IDLE | THINKING | REVEAL | ZOOM_OUT
  let autoResetTimer = null;
  let recognition = null;
  let isRecording = false;
  let particlesAnimId = null;
  let turbulenceAnimId = null;
  let floatTween = null;
  let thinkingPulseTimeline = null;
  let isMuted = false;
  let audioStarted = false;

  // Detección de preferencias del usuario
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isKiosk = new URLSearchParams(window.location.search).get('kiosk') === '1';

  function isMobilePortrait() {
    return window.innerWidth <= 768 || window.matchMedia('(orientation: portrait)').matches;
  }

  // Historial de IDs recientes en la sesión (para no repetir las últimas 5)
  let recentIds = [];
  try {
    recentIds = JSON.parse(sessionStorage.getItem('insightologia_recent_ids') || '[]');
  } catch (e) {
    recentIds = [];
  }

  function saveRecentId(id) {
    if (!id) return;
    recentIds.push(String(id));
    if (recentIds.length > 5) recentIds.shift();
    try {
      sessionStorage.setItem('insightologia_recent_ids', JSON.stringify(recentIds));
    } catch (e) {}
  }

  // ========================================================
  // 0. PRELOADER MÍSTICO ("Abriendo la mirada...")
  // ========================================================
  const preloader = document.getElementById('preloader');
  const preloaderBarFill = document.getElementById('preloader-bar-fill');
  const preloaderPercent = document.getElementById('preloader-percent');
  const viewportWrapper = document.getElementById('viewport-wrapper');

  const assetsToPreload = [
    { type: 'image', src: 'assets/escena-sin-pupila.webp' },
    { type: 'image', src: 'assets/escena-mobile-sin-pupila.webp' },
    { type: 'image', src: 'assets/pupila.png' },
    { type: 'image', src: 'assets/abriendo.webp' },
    { type: 'image', src: 'assets/abriendo-mobile.webp' },
    { type: 'image', src: 'assets/manos.png' },
    { type: 'image', src: 'assets/fondo-aterciopelado.jpeg' },
    { type: 'image', src: 'assets/gato.webp' },
    { type: 'image', src: 'assets/manos-mobile.png' },
    { type: 'image', src: 'assets/cursor.png' }
  ];

  let loadedAssets = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let progressRaf = null;

  function updateProgressBar() {
    currentProgress += (targetProgress - currentProgress) * 0.18;
    const rounded = Math.round(currentProgress);
    if (preloaderBarFill) preloaderBarFill.style.width = `${rounded}%`;
    if (preloaderPercent) preloaderPercent.textContent = `${rounded}%`;

    if (Math.abs(currentProgress - targetProgress) > 0.5 || currentProgress < 100) {
      progressRaf = requestAnimationFrame(updateProgressBar);
    } else {
      currentProgress = 100;
      if (preloaderBarFill) preloaderBarFill.style.width = '100%';
      if (preloaderPercent) preloaderPercent.textContent = '100%';
    }
  }

  function finishPreloader() {
    targetProgress = 100;
    setTimeout(() => {
      if (progressRaf) cancelAnimationFrame(progressRaf);
      if (preloaderBarFill) preloaderBarFill.style.width = '100%';
      if (preloaderPercent) preloaderPercent.textContent = '100%';

      if (viewportWrapper) viewportWrapper.classList.add('is-ready');

      if (preloader) {
        if (typeof gsap !== 'undefined') {
          gsap.to(preloader, {
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
            onComplete: () => {
              preloader.classList.add('fade-out');
              preloader.style.display = 'none';
            }
          });
        } else {
          preloader.classList.add('fade-out');
          setTimeout(() => { preloader.style.display = 'none'; }, 600);
        }
      }
    }, 380);
  }

  function onAssetDone() {
    loadedAssets++;
    targetProgress = Math.min(100, Math.round((loadedAssets / assetsToPreload.length) * 100));
    if (!progressRaf) progressRaf = requestAnimationFrame(updateProgressBar);

    if (loadedAssets >= assetsToPreload.length) {
      finishPreloader();
    }
  }

  // Iniciar descarga y rastreo de cada asset visual crítico
  assetsToPreload.forEach(asset => {
    if (asset.type === 'video') {
      const vid = document.createElement('video');
      vid.onloadeddata = onAssetDone;
      vid.onerror = onAssetDone;
      vid.src = asset.src;
      if (vid.readyState >= 2) onAssetDone();
    } else {
      const img = new Image();
      img.onload = onAssetDone;
      img.onerror = onAssetDone;
      img.src = asset.src;
      if (img.complete) onAssetDone();
    }
  });

  // Salvaguarda máxima de 5 segundos para dispositivos con conexiones lentas
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      finishPreloader();
    }
  }, 5000);

  // ========================================================
  // 1. INICIALIZACIÓN Y MODO KIOSCO
  // ========================================================
  if (isKiosk) {
    document.body.classList.add('kiosk-mode');
    document.addEventListener('click', () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }, { once: true });
  }

  // Inicializar Canvas de partículas místicas
  initParticles();

  // Inicializar onda de turbulencia SVG (humo/vidrio)
  if (!prefersReducedMotion && feTurbulence) {
    initTurbulenceAnimation();
  }

  // Inicializar ambiente sonoro combinado (Viento místico + Oficina en loop)
  initAmbienceAudio();

  // ========================================================
  // 2. WEB SPEECH API (Reconocimiento de voz es-AR)
  // ========================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition && btnMic) {
    try {
      recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'pt' ? 'pt-BR' : 'es-AR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecording = true;
        btnMic.classList.add('recording');
        if (micStatus) {
          micStatus.textContent = I18N[currentLang]?.listening || 'Escuchando tu pregunta...';
          micStatus.classList.add('active');
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (userInput) userInput.value = transcript;
        if (micStatus) micStatus.textContent = `"${transcript}"`;
        setTimeout(() => {
          if (micStatus) micStatus.classList.remove('active');
          if (state === 'IDLE' && transcript.trim().length > 0) {
            handleConsultation(transcript);
          }
        }, 500);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (micStatus) {
          micStatus.textContent = 'No pudimos escuchar. Escribí tu pregunta.';
          setTimeout(() => micStatus.classList.remove('active'), 2500);
        }
        btnMic.classList.remove('recording');
        isRecording = false;
      };

      recognition.onend = () => {
        isRecording = false;
        btnMic.classList.remove('recording');
      };

      btnMic.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state !== 'IDLE') return;
        if (isRecording) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Error starting recognition:', err);
          }
        }
      });
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      btnMic.classList.add('hidden-unsupported');
    }
  } else if (btnMic) {
    // Si el navegador no lo soporta, ocultar el botón
    btnMic.classList.add('hidden-unsupported');
  }

  // ========================================================
  // 3. EVENTOS DE ENVÍO Y ENTRADA
  // ========================================================
  function submitQuestion() {
    if (state !== 'IDLE') return;
    const question = userInput ? userInput.value.trim() : '';
    if (!question) {
      if (userInput) userInput.focus();
      return;
    }
    handleConsultation(question);
  }

  if (oracleForm) {
    oracleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitQuestion();
    });
  }

  if (btnSend) {
    btnSend.addEventListener('click', (e) => {
      e.preventDefault();
      submitQuestion();
    });
  }

  if (userInput) {
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitQuestion();
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      if (state === 'REVEAL') {
        transitionZoomOut();
      }
    });
  }

  // ========================================================
  // 4. MÁQUINA DE ESTADOS: TRANSICIONES
  // ========================================================

  async function handleConsultation(rawQuestion) {
    if (state !== 'IDLE') return;
    state = 'THINKING';

    if (recognition && isRecording) {
      try { recognition.stop(); } catch (e) {}
    }

    const question = (rawQuestion || '').trim();

    // 1. Iniciar animación de transición THINKING
    startThinkingAnimation(question);

    // 2. Obtener la respuesta del Oráculo (Fase 2: Mock inteligente / API)
    const oracleResponsePromise = fetchOracleAnswer(question);

    // 3. Zoom In sincronizado (~1.8s)
    const zoomPromise = runZoomInAnimation();

    // Esperar tanto la respuesta como la animación del Zoom In
    const [oracleData] = await Promise.all([
      oracleResponsePromise,
      zoomPromise
    ]);

    // 4. Transicionar a REVEAL
    transitionReveal(oracleData);

    // 5. Registro automático en Google Sheets (si está configurado el webhook)
    sendQuestionToGoogleDrive(question, oracleData);
  }

  function sendQuestionToGoogleDrive(pregunta, respuesta) {
    if (!pregunta || pregunta.trim().length === 0) return;
    const webhookUrl = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEETS_WEBHOOK_URL) 
      ? CONFIG.GOOGLE_SHEETS_WEBHOOK_URL.trim() 
      : '';
    if (!webhookUrl) return;

    try {
      const payload = {
        pregunta: pregunta,
        respuesta: (respuesta && respuesta.frase) 
          ? `[ID ${respuesta.id || ''}] "${respuesta.frase}" (${respuesta.marca || ''} - ${respuesta.ano || ''})` 
          : String(respuesta || ''),
        dispositivo: isMobilePortrait() ? 'Mobile' : 'Desktop'
      };

      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  // --- Fase THINKING: Pulso y vuelo de la pregunta ---
  function startThinkingAnimation(question) {
    // A. Desaparece el panel de input con fade
    gsap.to(inputPanel, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: 'power2.inOut',
      pointerEvents: 'none'
    });

    // B. La pregunta vuela y se disuelve hacia el centro de la bola
    if (question.length > 0) {
      floatingQuestion.textContent = `"${question}"`;
      
      const isMob = isMobilePortrait();
      const startX = isMob ? '50%' : '20%';
      const startY = isMob ? '31.7%' : '57%';
      const endX = isMob ? '40.28%' : '44.8%';
      const endY = isMob ? '82.81%' : '74.5%';

      const tlFly = gsap.timeline();
      tlFly.fromTo(floatingQuestion, 
        { opacity: 0, scale: 0.8, x: startX, y: startY },
        { opacity: 1, scale: 1, x: startX, y: startY, duration: 0.4, ease: 'back.out(1.5)' }
      )
      .to(floatingQuestion, {
        opacity: 0,
        scale: 0.3,
        x: endX,
        y: endY,
        filter: 'blur(8px)',
        duration: 0.9,
        ease: 'power2.in'
      });
    }

    // C. El plasma de la bola pulsa y el tercer ojo emite un destello suave
    thinkingPulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Destello del tercer ojo
    gsap.to(thirdEyeGlow, {
      opacity: 0.9,
      scale: 1.25,
      filter: 'blur(3px)',
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Pulso del plasma en la bola (hace visible el plasma gradualmente)
    gsap.to(ballPlasma, { opacity: 0.8, duration: 0.6 });
    gsap.to(ballPlasmaCore, { opacity: 0.75, duration: 0.6 });

    thinkingPulseTimeline.to(ballPlasma, {
      opacity: 0.95,
      scale: 1.05,
      duration: 0.9,
      ease: 'sine.inOut'
    }).to(ballPlasmaCore, {
      opacity: 0.9,
      scale: 1.18,
      duration: 0.9,
      ease: 'sine.inOut'
    }, 0);
  }

  // --- Fase ZOOM IN (GSAP) ---
  function runZoomInAnimation() {
    return new Promise((resolve) => {
      const zoomDuration = prefersReducedMotion ? 0.6 : 1.8;
      const isMob = isMobilePortrait();

      // En mobile portrait la bola mide 27.31% y su centro exacto es (40.28%, 82.81%)
      // Escala 3.0x con compensación para centrado armónico
      const targetScale = isMob ? 3.0 : 4.4;
      const targetX = isMob ? 9.72 : 5.2;
      const targetY = isMob ? -33.8 : -26.5;

      gsap.to(stage, {
        scale: targetScale,
        xPercent: targetX,
        yPercent: targetY,
        duration: zoomDuration,
        ease: 'power3.inOut',
        onComplete: resolve
      });
    });
  }

  // --- Fase REVEAL: Despliegue de la respuesta en la bola ---
  function transitionReveal(data) {
    state = 'REVEAL';

    // Detener la pulsación acelerada de THINKING
    if (thinkingPulseTimeline) {
      thinkingPulseTimeline.kill();
    }
    gsap.to(thirdEyeGlow, { opacity: 0.2, scale: 1, duration: 0.8 });
    gsap.to(ballPlasma, { opacity: 0.7, scale: 1, duration: 0.8 });
    gsap.to(ballPlasmaCore, { opacity: 0.6, scale: 1, duration: 0.8 });

    // Enriquecer con los datos completos del catálogo local (frase_pt, pais_pt, link) si existen
    if (data && data.id && typeof CONFIG !== 'undefined' && CONFIG.CATALOG_PHRASES) {
      const catalogMatch = CONFIG.CATALOG_PHRASES.find(item => String(item.id) === String(data.id));
      if (catalogMatch) {
        data = Object.assign({}, catalogMatch, data);
        if (!data.frase_pt && catalogMatch.frase_pt) data.frase_pt = catalogMatch.frase_pt;
        if (!data.pais_pt && catalogMatch.pais_pt) data.pais_pt = catalogMatch.pais_pt;
        if (!data.link && catalogMatch.link) data.link = catalogMatch.link;
      }
    }

    // Guardar referencia de la frase actual para cambio dinámico de idioma
    currentRevealedData = data;
    const phraseContent = (currentLang === 'pt' && data.frase_pt) ? data.frase_pt : (data.frase_es || data.frase);
    const countryContent = (currentLang === 'pt' && data.pais_pt) ? data.pais_pt : (data.pais || '');

    // Preparar el texto y el crédito
    renderPhraseText(phraseContent);
    phraseCredit.textContent = formatPhraseCredit(data, currentLang);

    // Calcular tamaño adaptable de fuente según longitud de la frase
    adjustAdaptiveFontSize(phraseContent);

    // Timeline de aparición
    const tlReveal = gsap.timeline();

    // Entrada palabra por palabra con blur y opacidad
    const words = phraseText.querySelectorAll('.phrase-word');
    const wordStagger = prefersReducedMotion ? 0 : 0.05;

    tlReveal.fromTo(words, 
      { opacity: 0, filter: 'blur(12px)', y: 8 },
      { 
        opacity: 1, 
        filter: 'blur(0px)', 
        y: 0, 
        duration: prefersReducedMotion ? 0.3 : 0.7, 
        stagger: wordStagger,
        ease: 'power2.out' 
      }
    )
    .to(phraseCredit, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2');

    // Enlace "Quiero ver más allá" (si la frase tiene link cargado)
    if (phraseLinkWrapper && phraseLink && data.link && data.link.trim().length > 0) {
      phraseLink.href = data.link.trim();
      phraseLinkWrapper.style.display = 'flex';
      tlReveal.to(phraseLinkWrapper, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => {
          phraseLinkWrapper.classList.add('visible');
        }
      }, '-=0.1');
    } else if (phraseLinkWrapper) {
      phraseLinkWrapper.style.display = 'none';
      phraseLinkWrapper.classList.remove('visible');
    }

    tlReveal.call(() => {
      // Iniciar flotación continua suave de la frase
      startFloatingMotion();
      // Mostrar botón "Hacer otra pregunta"
      revealControls.classList.add('visible');
      // Iniciar timer automático de 20s para regresar a IDLE
      startAutoResetTimer();
    });
  }

  // --- Movimiento de flotación lento y continuo ---
  function startFloatingMotion() {
    if (prefersReducedMotion) return;
    if (floatTween) floatTween.kill();

    floatTween = gsap.to(phraseContainer, {
      y: '+=6px',
      x: '+=3px',
      rotation: 0.6,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // --- Fase ZOOM OUT: Retorno a IDLE ---
  function transitionZoomOut() {
    if (state === 'ZOOM_OUT') return;
    state = 'ZOOM_OUT';

    clearTimeout(autoResetTimer);
    revealControls.classList.remove('visible');

    if (floatTween) {
      floatTween.kill();
      floatTween = null;
    }

    const zoomOutDuration = prefersReducedMotion ? 0.5 : 1.6;
    const tlOut = gsap.timeline({
      onComplete: () => {
        // Limpieza y reinicio a IDLE
        phraseText.innerHTML = '';
        phraseCredit.textContent = '';
        if (phraseLinkWrapper) {
          phraseLinkWrapper.classList.remove('visible');
          phraseLinkWrapper.style.opacity = '0';
          phraseLinkWrapper.style.display = 'none';
          if (phraseLink) phraseLink.removeAttribute('href');
        }
        userInput.value = '';
        currentRevealedData = null;
        state = 'IDLE';
        userInput.focus();
      }
    });

    // 1. Desvanecer la frase dentro de la bola
    tlOut.to(phraseContainer, {
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(phraseContainer, { clearProps: 'all' });
      }
    })
    // 2. Retornar el stage a escala 1 y posición original (xPercent: 0, yPercent: 0)
    .to(stage, {
      scale: 1,
      xPercent: 0,
      yPercent: 0,
      duration: zoomOutDuration,
      ease: 'power3.inOut'
    }, 0.2)
    // 3. Apagar destello del ojo y plasma de la bola
    .to(thirdEyeGlow, {
      opacity: 0,
      duration: 0.6
    }, 0.3)
    .to([ballPlasma, ballPlasmaCore], {
      opacity: 0,
      duration: 0.6
    }, 0.3)
    // 4. Reaparecer el input panel
    .to(inputPanel, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      pointerEvents: 'auto'
    }, '-=0.4');
  }

  function startAutoResetTimer() {
    clearTimeout(autoResetTimer);
    const resetMs = (typeof CONFIG !== 'undefined' && CONFIG.AUTO_RESET_MS) ? CONFIG.AUTO_RESET_MS : 20000;
    autoResetTimer = setTimeout(() => {
      if (state === 'REVEAL') {
        transitionZoomOut();
      }
    }, resetMs);
  }

  // ========================================================
  // 5. RENDER Y ADAPTACIÓN TIPOGRÁFICA
  // ========================================================

  function formatPhraseCredit(data, lang) {
    if (!data) return '';
    let brand = (data.marca || '').trim();
    let agency = (data.agencia || '').trim();
    const country = ((lang === 'pt' && data.pais_pt) ? data.pais_pt : (data.pais || '')).trim();
    const year = (data.ano || '').trim();

    // Normalizar guiones en marca y agencia para evitar dobles guiones
    brand = brand.replace(/\s*[-–—]\s*/g, ' - ');
    agency = agency.replace(/\s*[-–—]\s*/g, ' - ');

    const parts = [];
    if (brand) parts.push(brand);
    if (agency) parts.push(agency);
    // Evitar duplicar país si la agencia ya lo incluye al final (ej: "JWT Argentina" + "Argentina")
    if (country && !agency.toLowerCase().endsWith(country.toLowerCase())) {
      parts.push(country);
    }
    if (year) parts.push(year);
    return parts.join(' - ');
  }

  function formatPhraseWithQuotes(frase) {
    if (!frase) return '';
    const trimmed = frase.trim().replace(/^["“'”]+|["“'”]+$/g, '').trim();
    return `“${trimmed}”`;
  }

  function renderPhraseText(frase, isVisible = false) {
    phraseText.innerHTML = '';
    const cleanFrase = formatPhraseWithQuotes(frase);
    const words = cleanFrase.split(/\s+/).filter(w => w.length > 0);

    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'phrase-word';
      if (isVisible) {
        span.style.opacity = '1';
        span.style.filter = 'blur(0px)';
        span.style.transform = 'translateY(0)';
      }
      span.textContent = word + ' ';
      phraseText.appendChild(span);
    });
  }

  function adjustAdaptiveFontSize(frase) {
    const len = (frase || '').length;
    const isMob = isMobilePortrait();

    // Dimensionamiento proporcional calibrado exactamente a la referencia
    // En desktop el stage escala 4.4x; en mobile portrait escala 3.0x
    let fontSize = isMob ? 4.0 : 4.8;

    if (len < 25) {
      fontSize = isMob ? 4.8 : 5.6;
    } else if (len < 45) {
      fontSize = isMob ? 4.0 : 4.8;
    } else if (len < 75) {
      fontSize = isMob ? 3.4 : 4.1;
    } else if (len < 110) {
      fontSize = isMob ? 3.0 : 3.5;
    } else {
      fontSize = isMob ? 2.6 : 3.0;
    }

    phraseText.style.fontSize = `${fontSize}px`;
  }

  // ========================================================
  // 6. OBTENCIÓN DE LA FRASE (API / BACKEND / FALLBACK MOCK)
  // ========================================================

  async function fetchOracleAnswer(question) {
    // Si la pregunta está vacía o es muy corta, moderación / respuesta mística inmediata
    if (!question || question.trim().length < 3) {
      return {
        id: "gen-1",
        frase: "Quien nada pregunta, ya lo sabe todo.",
        marca: "Insightología",
        agencia: "El Ojo de Iberoamérica",
        pais: "Iberoamérica",
        ano: "1994-2024",
        tema: "Sabiduría"
      };
    }

    // Intentar consultar al backend serverless /api/oracle
    const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_ORACLE_URL) ? CONFIG.API_ORACLE_URL : '/api/oracle';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: question,
          recentIds: recentIds
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.frase) {
          saveRecentId(data.id);
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend /api/oracle no disponible o superó timeout. Activando fallback local:', err);
    }

    // FALLBACK LOCAL INTELIGENTE (Para GitHub Pages o contingencia de red)
    return await getLocalFallbackAnswer(question);
  }

  // Catálogo completo de 50 frases enriquecidas con tags de El Ojo de Iberoamérica
  const clientCachedSheet = (typeof CONFIG !== 'undefined' && CONFIG.CATALOG_PHRASES) 
    ? CONFIG.CATALOG_PHRASES 
    : [];

  // ========================================================
  // 6. MOTOR SEMÁNTICO LOCAL INTELIGENTE (Basado en Tags)
  // ========================================================
  const THEME_TRIGGERS = {
    'Amor y vínculos': [
      'amor', 'pareja', 'novio', 'novia', 'casar', 'casarme', 'separacion', 'divorcio', 
      'relacion', 'relaciones', 'corazon', 'enamorar', 'enamorado', 'enamorada', 'querer', 
      'gustar', 'gusto', 'empatia', 'amigo', 'amigos', 'amiga', 'amistad', 'sentimiento', 
      'hombre', 'mujer', 'chico', 'chica', 'volver', 'ex', 'cita', 'conocer',
      'namorado', 'namorada', 'casamento', 'relacionamento', 'amizade', 'homem', 'mulher'
    ],
    'Trabajo y creatividad': [
      'trabajo', 'laburo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 
      'sueldos', 'empresa', 'marca', 'negocio', 'negocios', 'exito', 'ascenso', 'ascender', 
      'renunciar', 'emprender', 'emprendimiento', 'cliente', 'jefe', 'jefa', 'agencia', 
      'idea', 'ideas', 'crear', 'creativo', 'creatividad', 'campana', 'publicidad', 
      'aviso', 'oficio', 'estudiar', 'estudio', 'profesion', 'proyecto',
      'trabalho', 'carreira', 'dinheiro', 'grana', 'salario', 'sucesso', 'ideia', 'ideias', 'criatividade', 'anuncio'
    ],
    'Futuro y tecnología': [
      'ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'robots', 'futuro', 'computadora', 
      'chatgpt', 'digital', 'automatizar', 'innovar', 'manana', 'destino', 'chip', 
      'data', 'inteligencia', 'artificial', 'reemplazar', 'progreso', 'ciencia',
      'computador', 'inovacao', 'dados'
    ],
    'Riesgo y valentía': [
      'miedo', 'miedos', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 
      'arriesgo', 'atreverse', 'atrevo', 'animo', 'animarme', 'cambiar', 'cambio', 
      'decision', 'saltar', 'coraje', 'avanzar', 'tirarme', 'jugarmela', 'jugarme', 'pileta',
      'coragem', 'arriscar', 'medo', 'perigo', 'decisao'
    ],
    'Identidad': [
      'quien soy', 'como soy', 'estilo', 'edad', 'grande', 'viejo', 'ser yo', 
      'autoestima', 'identidad', 'dudas', 'autentico', 'comparar', 'sentido', 
      'propio', 'proposito', 'vida', 'existencia', 'personalidad',
      'quem sou', 'idade', 'identidade'
    ],
    'Placer y vida cotidiana': [
      'comer', 'pasta', 'hambre', 'sed', 'cerveza', 'birra', 'vino', 'comida', 
      'cuerpo', 'casa', 'disfrutar', 'cotidiano', 'dormir', 'desayuno', 'fiesta', 
      'salida', 'descansar', 'vacaciones', 'placer', 'vivir',
      'massa', 'fome', 'sede', 'corpo', 'beber'
    ],
    'Tiempo y país': [
      'tiempo', 'nostalgia', 'anos', 'pais', 'argentina', 'epoca', 'antes', 
      'pasado', 'recuerdo', 'historia', 'recuerdos',
      'tempo', 'lembranca'
    ]
  };

  const FUNCTION_TRIGGERS = {
    'Empuja a actuar': [
      'debo', 'tengo que', 'hago', 'hacerlo', 'me animo', 'avanzo', 'empiezo', 
      'tiro', 'arriesgo', 'comienzo', 'deberia', 'puedo', 'voy a', 'conviene'
    ],
    'Tranquiliza o relativiza': [
      'miedo', 'cansado', 'cansada', 'angustia', 'estres', 'preocupado', 'preocupada', 
      'duda', 'dudas', 'perder', 'sola', 'solo', 'triste', 'pasa nada', 'calma', 'paz'
    ],
    'Sí o no rotundo': [
      'si o no', 'va a pasar', 'sera que', 'es verdad', 'triunfare', 'lo lograre', 
      'va a salir', 'saldra bien', 'va a funcionar', 'si', 'no'
    ],
    'Sentencia de oráculo': [
      'que va a pasar', 'cual es el', 'hacia donde', 'que pasara', 'que significa', 
      'que sentido', 'por que', 'para que', 'cual es'
    ],
    'Desafía o cuestiona': [
      'seguro', 'verdad', 'enserio', 'crees', 'pensas', 'te parece', 'tonto', 'loco'
    ],
    'Humor o absurdo': [
      'jaja', 'chiste', 'mentira', 'locura', 'broma', 'ridiculo'
    ]
  };

  function matchesTrigger(text, wordsSet, trigger) {
    if (trigger.includes(' ')) {
      return text.includes(trigger);
    }
    return wordsSet.has(trigger);
  }

  async function getLocalFallbackAnswer(question) {
    const list = (clientCachedSheet && clientCachedSheet.length > 0) 
      ? clientCachedSheet 
      : ((typeof CONFIG !== 'undefined' && CONFIG.CATALOG_PHRASES) ? CONFIG.CATALOG_PHRASES : []);

    if (!list || list.length === 0) {
      return {
        id: "1",
        frase: "Para qué mentir, si podés teletransportarte",
        marca: "Cerveza Andes",
        agencia: "Del Campo Nazca Saatchi & Saatchi",
        pais: "Argentina",
        ano: "2010"
      };
    }

    // Filtrar candidatos para evitar las últimas 5 frases mostradas en la sesión
    const safeCandidates = list.filter(item => !recentIds.includes(String(item.id)));
    const pool = safeCandidates.length > 0 ? safeCandidates : list;

    // Normalizar texto de la pregunta
    const qLower = (question || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const words = qLower
      .split(/[\s,?.!¡¿;:\-_]+/)
      .filter(w => w.length > 2 && !['que', 'como', 'para', 'este', 'esta', 'estos', 'estas', 'los', 'las', 'del', 'por', 'con', 'sin', 'sobre', 'voy', 'va', 'sera', 'hacer'].includes(w));
    const wordsSet = new Set(words);

    // Detectar temas activos en la pregunta
    const matchedThemes = new Set();
    Object.entries(THEME_TRIGGERS).forEach(([themeName, triggers]) => {
      if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
        matchedThemes.add(themeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    });

    // Detectar funciones activas en la pregunta
    const matchedFunctions = new Set();
    Object.entries(FUNCTION_TRIGGERS).forEach(([funcName, triggers]) => {
      if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
        matchedFunctions.add(funcName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    });

    // Puntuar cada frase del pool con el nuevo sistema de tags
    const scored = pool.map(item => {
      let score = 0;
      const fNorm = (item.frase || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const fPtNorm = (item.frase_pt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const tNorm = (item.tema || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const funcNorm = (item.funcion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mNorm = (item.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 1. Afinidad temática por Tag (+8 pts)
      let hasThemeMatch = false;
      for (const t of matchedThemes) {
        if (tNorm.includes(t)) {
          score += 8;
          hasThemeMatch = true;
          break;
        }
      }

      // 2. Afinidad funcional por Tag (+6 pts)
      for (const fn of matchedFunctions) {
        if (funcNorm.includes(fn)) {
          score += 6;
          break;
        }
      }

      // 3. Coincidencia léxica directa (+4 pts por palabra de la pregunta)
      words.forEach(w => {
        if (fNorm.includes(w) || fPtNorm.includes(w)) score += 4;
        if (tNorm.includes(w)) score += 3;
        if (mNorm.includes(w)) score += 1;
      });

      // 4. Modificadores de Tag: Flag y Comodín
      if (item.flag === 'Depende de contexto' && !hasThemeMatch) {
        score -= 12; // Solo entra si el tema de la pregunta coincide explícitamente
      }
      if (item.flag === 'Revisar') {
        score -= 12; // Evitar frases sensibles salvo match intencional explícito
      }
      if (item.comodin && score <= 3) {
        score += 2; // Si la pregunta es abierta o abstracta, dar prioridad al comodín
      }

      return { item, score };
    });

    // Ordenar por afinidad
    scored.sort((a, b) => b.score - a.score);

    let selected;
    const topScore = scored[0]?.score || 0;

    if (topScore >= 5) {
      // Tomar las frases con mayor afinidad semántica (score máximo o muy cercano)
      const bestCandidates = scored.filter(s => s.score >= Math.max(5, topScore - 3)).map(s => s.item);
      selected = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    } else {
      // Si la pregunta es abierta o abstracta, priorizar frases Comodín
      const comodines = pool.filter(p => p.comodin && p.flag !== 'Revisar');
      const fallbackList = (comodines.length > 0) ? comodines : pool;
      selected = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    console.log('🔮 Oráculo Semántico:', {
      pregunta: question,
      temasDetectados: Array.from(matchedThemes),
      funcionesDetectadas: Array.from(matchedFunctions),
      scoreMaximo: topScore,
      fraseElegida: selected.frase,
      temaFrase: selected.tema,
      funcionFrase: selected.funcion,
      id: selected.id
    });

    saveRecentId(selected.id);
    return selected;
  }

  // ========================================================
  // 7. PARTICULAS MÍSTICAS Y EFECTO DE ONDA SVG
  // ========================================================

  function initParticles() {
    if (!particlesCanvas) return;
    const ctx = particlesCanvas.getContext('2d');
    let width = particlesCanvas.width = 300;
    let height = particlesCanvas.height = 300;

    const particleCount = 28;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        radius: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        colorHue: Math.random() > 0.4 ? 265 : 225 // Tonos violeta y azul
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Rebote o reubicación circular suave
        if (p.x < 10) p.x = width - 10;
        if (p.x > width - 10) p.x = 10;
        if (p.y < 10) p.y = height - 10;
        if (p.y > height - 10) p.y = 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.colorHue}, 85%, 75%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.colorHue}, 90%, 65%, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      particlesAnimId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  function initTurbulenceAnimation() {
    let freq = 0.012;
    let dir = 0.00008;

    function animateTurbulence() {
      freq += dir;
      if (freq > 0.018 || freq < 0.009) {
        dir = -dir;
      }
      feTurbulence.setAttribute('baseFrequency', `${freq.toFixed(5)} ${freq.toFixed(5)}`);
      turbulenceAnimId = requestAnimationFrame(animateTurbulence);
    }

    animateTurbulence();
  }

  // ========================================================
  // 8. AMBIENTE SONORO DUAL EN LOOP (Viento Místico + Oficina)
  // ========================================================
  function initAmbienceAudio() {
    if (!audioWind || !audioOffice) return;

    // Configurar volúmenes para una mezcla armónica (el viento predomina sutilmente)
    audioWind.volume = 0.55;
    audioOffice.volume = 0.35;
    audioWind.loop = true;
    audioOffice.loop = true;

    // Intentar reproducir en autoplay al cargar
    const attemptPlay = () => {
      if (isMuted || audioStarted) return;
      const p1 = audioWind.play();
      const p2 = audioOffice.play();

      Promise.allSettled([p1, p2]).then(results => {
        const anyPlaying = results.some(r => r.status === 'fulfilled');
        if (anyPlaying) {
          audioStarted = true;
        }
      }).catch(() => {});
    };

    attemptPlay();

    // Si el navegador bloqueó el autoplay sin interacción previa,
    // se activan en la primera interacción (clic, toque, teclado)
    const unlockOnInteraction = () => {
      if (!isMuted && (!audioStarted || audioWind.paused || audioOffice.paused)) {
        audioWind.play().catch(() => {});
        audioOffice.play().catch(() => {});
        audioStarted = true;
      }
      window.removeEventListener('pointerdown', unlockOnInteraction);
      window.removeEventListener('keydown', unlockOnInteraction);
    };

    window.addEventListener('pointerdown', unlockOnInteraction, { passive: true });
    window.addEventListener('keydown', unlockOnInteraction, { passive: true });

    // Botón de silenciar / activar
    if (btnSound) {
      btnSound.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAudio();
      });
    }
  }

  function toggleAudio() {
    isMuted = !isMuted;
    if (audioWind) audioWind.muted = isMuted;
    if (audioOffice) audioOffice.muted = isMuted;

    if (!isMuted) {
      if (audioWind && audioWind.paused) audioWind.play().catch(() => {});
      if (audioOffice && audioOffice.paused) audioOffice.play().catch(() => {});
      audioStarted = true;
    }

    updateSoundUI();
  }

  function updateSoundUI() {
    if (!btnSound) return;
    const t = I18N[currentLang] || I18N.es;
    if (isMuted) {
      btnSound.classList.add('muted');
      btnSound.setAttribute('title', t.soundUnmute);
      btnSound.setAttribute('aria-label', t.soundUnmute);
      if (iconSoundOn) iconSoundOn.style.display = 'none';
      if (iconSoundOff) iconSoundOff.style.display = 'block';
    } else {
      btnSound.classList.remove('muted');
      btnSound.setAttribute('title', t.soundMute);
      btnSound.setAttribute('aria-label', t.soundMute);
      if (iconSoundOn) iconSoundOn.style.display = 'block';
      if (iconSoundOff) iconSoundOff.style.display = 'none';
    }
  }

  // ========================================================
  // LÓGICA DE MENÚ HAMBURGUESA Y MODAL "¿QUÉ ESTOY VIENDO?"
  // ========================================================
  function initMenuAndModal() {
    function openModalAbout() {
      if (!modalAbout) return;
      closeMenuDropdown();
      modalAbout.classList.add('is-active');
      modalAbout.setAttribute('aria-hidden', 'false');
      if (btnMenu) {
        btnMenu.style.opacity = '0';
        btnMenu.style.pointerEvents = 'none';
      }
      if (btnSound) {
        btnSound.style.opacity = '0';
        btnSound.style.pointerEvents = 'none';
      }
    }

    function closeModalAbout() {
      if (!modalAbout) return;
      modalAbout.classList.remove('is-active');
      modalAbout.setAttribute('aria-hidden', 'true');
      if (btnMenu) {
        btnMenu.style.opacity = '';
        btnMenu.style.pointerEvents = '';
      }
      if (btnSound) {
        btnSound.style.opacity = '';
        btnSound.style.pointerEvents = '';
      }
    }

    function closeMenuDropdown() {
      if (!menuDropdown) return;
      menuDropdown.classList.remove('is-open');
      if (btnMenu) {
        btnMenu.setAttribute('aria-expanded', 'false');
      }
    }

    if (btnMenu && menuDropdown) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuDropdown.classList.toggle('is-open');
        btnMenu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (menuDropdown.classList.contains('is-open') && !menuDropdown.contains(e.target) && !btnMenu.contains(e.target)) {
          closeMenuDropdown();
        }
      });
    }

    if (langBtnEs) {
      langBtnEs.addEventListener('click', (e) => {
        e.stopPropagation();
        setLanguage('es');
      });
    }

    if (langBtnPt) {
      langBtnPt.addEventListener('click', (e) => {
        e.stopPropagation();
        setLanguage('pt');
      });
    }

    if (menuBtnAbout) {
      menuBtnAbout.addEventListener('click', () => {
        openModalAbout();
      });
    }

    if (modalAboutClose) {
      modalAboutClose.addEventListener('click', () => {
        closeModalAbout();
      });
    }

    if (modalAbout) {
      modalAbout.addEventListener('click', (e) => {
        // Cerrar si se cliquea en el backdrop
        if (e.target === modalAbout || e.target === modalAboutStage) {
          closeModalAbout();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalAbout && modalAbout.classList.contains('is-active')) {
          closeModalAbout();
        } else if (menuDropdown && menuDropdown.classList.contains('is-open')) {
          closeMenuDropdown();
        }
      }
    });
  }

  initMenuAndModal();
  setLanguage(currentLang);

  // ========================================================
  // MOTOR DE SEGUIMIENTO Y TILT 3D DEL TERCER OJO (Desktop y Mobile)
  // ========================================================
  function initEyeTracking() {
    if (!thirdEyeInteractive || !thirdEyePupil) return;

    const gyroPermissionPrompt = document.getElementById('gyro-permission-prompt');
    const btnGyroPermission = document.getElementById('btn-gyro-permission');

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    let targetScaleX = 1;
    let targetScaleY = 1;
    let currentScaleX = 1;
    let currentScaleY = 1;

    let targetZ = 0;
    let currentZ = 0;

    let isTrackingActive = false;
    let isSaccadeActive = false;
    let currentLerp = 0.10;
    let rafId = null;
    let gyroActive = false;
    let baselineBeta = 45; // Ángulo promedio de sostener el celular en la mano

    // Posición base móvil (giroscopio o touch) y offset por sacádicos aleatorios independientes
    let baseGyroTargetX = 0;
    let baseGyroTargetY = 0;
    const saccadeOffset = { x: 0, y: 0 };
    let saccadeTimeoutId = null;
    let saccadeTween = null;

    // Obtener centro y dimensiones actuales del ojo en el viewport
    function getEyeCenter() {
      const rect = thirdEyeInteractive.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height
      };
    }

    function ensureRenderLoop() {
      if (!rafId) {
        rafId = requestAnimationFrame(renderLoop);
      }
    }

    // --- Desktop: Seguimiento con Mouse ---
    function onMouseMove(e) {
      if (isMobilePortrait()) return;

      const eye = getEyeCenter();
      if (!eye.w || !eye.h) return;

      const dx = e.clientX - eye.x;
      const dy = e.clientY - eye.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Límites de recorrido elípticos acotados a la cuenca ocular
      const maxRadiusX = eye.w * 0.40;
      const maxRadiusY = eye.h * 0.26;

      const screenDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
      const strength = Math.min(1, Math.pow(dist / (screenDiagonal * 0.52), 0.75));

      targetX = Math.cos(angle) * maxRadiusX * strength;
      targetY = Math.sin(angle) * maxRadiusY * strength;

      apply3DTransforms(targetX, targetY, maxRadiusX, maxRadiusY);
      isTrackingActive = true;
      ensureRenderLoop();
    }

    function onMouseLeave() {
      if (isMobilePortrait()) return;
      targetX = 0;
      targetY = 0;
      targetRotX = 0;
      targetRotY = 0;
      targetScaleX = 1;
      targetScaleY = 1;
      targetZ = 0;
      isTrackingActive = false;
    }

    // --- Mobile: Fusión de inclinación del móvil + sacádico aleatorio ---
    function updateMobilePupilTarget() {
      if (!isMobilePortrait()) return;
      const eye = getEyeCenter();
      if (!eye.w || !eye.h) return;

      const maxRadiusX = eye.w * 0.38;
      const maxRadiusY = eye.h * 0.25;

      let combinedX = baseGyroTargetX + saccadeOffset.x;
      let combinedY = baseGyroTargetY + saccadeOffset.y;

      // Restricción elíptica para que la pupila nunca escape de la cuenca ocular
      const normX = maxRadiusX > 0 ? combinedX / maxRadiusX : 0;
      const normY = maxRadiusY > 0 ? combinedY / maxRadiusY : 0;
      const dist = Math.hypot(normX, normY);
      if (dist > 1) {
        combinedX = (normX / dist) * maxRadiusX;
        combinedY = (normY / dist) * maxRadiusY;
      }

      targetX = combinedX;
      targetY = combinedY;

      apply3DTransforms(targetX, targetY, maxRadiusX, maxRadiusY);
      isTrackingActive = true;
      ensureRenderLoop();
    }

    // --- Mobile: Movimientos sacádicos aleatorios e independientes ---
    function triggerRandomSaccade() {
      if (!isMobilePortrait()) return;

      const eye = getEyeCenter();
      if (!eye.w || !eye.h) {
        scheduleNextSaccade();
        return;
      }

      const maxRadiusX = eye.w * 0.38;
      const maxRadiusY = eye.h * 0.25;

      // Ángulo aleatorio en 360°
      const angle = Math.random() * Math.PI * 2;
      // Amplitud del golpe de vista (60% a 92% de la cuenca ocular)
      const magnitude = 0.60 + Math.random() * 0.32;
      const destX = Math.cos(angle) * maxRadiusX * magnitude;
      const destY = Math.sin(angle) * maxRadiusY * magnitude;

      // Duración rápida del latigazo visual (movimiento rápido: 130ms a 210ms)
      const dartDuration = 0.13 + Math.random() * 0.08;
      // Tiempo que mantiene la mirada clavada fija (300ms a 600ms)
      const holdDuration = 0.30 + Math.random() * 0.30;
      // Retorno fluido a la posición del teléfono (360ms a 500ms)
      const returnDuration = 0.36 + Math.random() * 0.14;

      if (saccadeTween) saccadeTween.kill();
      isSaccadeActive = true;
      currentLerp = 0.18; // Mayor reactividad para el golpe rápido

      saccadeTween = gsap.timeline({
        onComplete: () => {
          isSaccadeActive = false;
          currentLerp = 0.10;
          scheduleNextSaccade();
        }
      })
      // 1. Latigazo rápido al azar hacia el punto destino
      .to(saccadeOffset, {
        x: destX,
        y: destY,
        duration: dartDuration,
        ease: 'power3.out',
        onUpdate: updateMobilePupilTarget
      })
      // 2. Clava la mirada en ese punto
      .to({}, { duration: holdDuration })
      // 3. Regresa suavemente a alinearse con la inclinación del móvil
      .to(saccadeOffset, {
        x: 0,
        y: 0,
        duration: returnDuration,
        ease: 'power2.inOut',
        onStart: () => {
          currentLerp = 0.12;
        },
        onUpdate: updateMobilePupilTarget
      });
    }

    function scheduleNextSaccade() {
      clearTimeout(saccadeTimeoutId);
      if (!isMobilePortrait()) return;

      // Intervalo aleatorio entre golpes de mirada (3.5 a 7 segundos)
      const nextDelay = 3500 + Math.random() * 3500;
      saccadeTimeoutId = setTimeout(triggerRandomSaccade, nextDelay);
    }

    // --- Mobile: Giroscopio y Acelerómetro (DeviceOrientation) ---
    function onDeviceOrientation(e) {
      if (!isMobilePortrait()) return;
      if (e.gamma === null && e.beta === null) return;

      const eye = getEyeCenter();
      if (!eye.w || !eye.h) return;

      const maxRadiusX = eye.w * 0.38;
      const maxRadiusY = eye.h * 0.25;

      // Inclinación lateral (gamma: -90 a 90) e inclinación frontal (beta: -180 a 180)
      const gamma = e.gamma || 0;
      const beta = e.beta || baselineBeta;

      // Desviación respecto al ángulo natural de reposo de la mano (~45°)
      const deltaGamma = gamma;
      const deltaBeta = beta - baselineBeta;

      // Sensibilidad angular: ±22° de inclinación da el 100% del rango de la pupila
      const maxTilt = 22;
      const normX = Math.max(-1, Math.min(1, deltaGamma / maxTilt));
      const normY = Math.max(-1, Math.min(1, deltaBeta / maxTilt));

      baseGyroTargetX = normX * maxRadiusX;
      baseGyroTargetY = normY * maxRadiusY;

      updateMobilePupilTarget();
    }

    // --- Mobile: Fallback / Toque táctil ---
    function onTouchMove(e) {
      if (!isMobilePortrait()) return;
      const touch = e.touches[0];
      if (!touch) return;

      const eye = getEyeCenter();
      if (!eye.w || !eye.h) return;

      const dx = touch.clientX - eye.x;
      const dy = touch.clientY - eye.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const maxRadiusX = eye.w * 0.38;
      const maxRadiusY = eye.h * 0.25;

      const screenDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
      const strength = Math.min(1, Math.pow(dist / (screenDiagonal * 0.45), 0.75));

      baseGyroTargetX = Math.cos(angle) * maxRadiusX * strength;
      baseGyroTargetY = Math.sin(angle) * maxRadiusY * strength;

      updateMobilePupilTarget();
    }

    // --- Transformaciones esféricas y de perspectiva 3D ---
    function apply3DTransforms(tx, ty, mrx, mry) {
      const normX = mrx > 0 ? tx / mrx : 0;
      const normY = mry > 0 ? ty / mry : 0;

      // 1. Rotación y Tilt 3D esférico
      targetRotY = normX * 24;  // Gira sobre eje Y
      targetRotX = -normY * 18; // Gira sobre eje X

      // 2. Achatamiento por proyección esférica
      targetScaleX = 1 - Math.abs(normX) * 0.14;
      targetScaleY = 1 - Math.abs(normY) * 0.08;

      // 3. Hundimiento corneal en Z
      targetZ = -Math.hypot(normX, normY) * 3.2;
    }

    function renderLoop() {
      // Física de inercia y suavizado orgánico
      currentX += (targetX - currentX) * currentLerp;
      currentY += (targetY - currentY) * currentLerp;
      currentRotX += (targetRotX - currentRotX) * currentLerp;
      currentRotY += (targetRotY - currentRotY) * currentLerp;
      currentScaleX += (targetScaleX - currentScaleX) * currentLerp;
      currentScaleY += (targetScaleY - currentScaleY) * currentLerp;
      currentZ += (targetZ - currentZ) * currentLerp;

      // Aplicar transformación 3D combinada a la pupila
      thirdEyePupil.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, ${currentZ.toFixed(2)}px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(${currentScaleX.toFixed(3)}, ${currentScaleY.toFixed(3)})`;

      // Micro-parallax dinámico en el destello corneal si está encendido
      if (thirdEyeGlow && thirdEyeGlow.style.opacity > 0) {
        thirdEyeGlow.style.transform = `translate(-50%, -50%) translate3d(${(currentX * 0.25).toFixed(2)}px, ${(currentY * 0.25).toFixed(2)}px, 0)`;
      }

      const delta = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) + Math.abs(targetRotX - currentRotX);
      if (delta > 0.02 || isTrackingActive || isSaccadeActive) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        rafId = null;
      }
    }

    // --- Inicialización y Permisos de Giroscopio ---
    function activateGyroTracking() {
      if (gyroActive) return;
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
      gyroActive = true;
      if (gyroPermissionPrompt) {
        gyroPermissionPrompt.classList.remove('is-visible');
      }
    }

    function checkMobileGyroSupport() {
      if (!isMobilePortrait()) {
        if (gyroPermissionPrompt) {
          gyroPermissionPrompt.classList.remove('is-visible');
        }
        return;
      }

      // Caso iOS 13+: Requiere permiso explícito mediante toque de usuario
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        if (sessionStorage.getItem('gyro_permission_granted') === 'true') {
          activateGyroTracking();
        } else if (gyroPermissionPrompt) {
          gyroPermissionPrompt.classList.add('is-visible');
        }
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        // Caso Android y navegadores estándar: Activar directamente
        activateGyroTracking();
      }
    }

    function handlePlatformChange() {
      if (isMobilePortrait()) {
        checkMobileGyroSupport();
        scheduleNextSaccade();
      } else {
        clearTimeout(saccadeTimeoutId);
        if (saccadeTween) saccadeTween.kill();
        saccadeOffset.x = 0;
        saccadeOffset.y = 0;
        isSaccadeActive = false;
        currentLerp = 0.10;
        if (gyroPermissionPrompt) {
          gyroPermissionPrompt.classList.remove('is-visible');
        }
      }
    }

    if (btnGyroPermission) {
      btnGyroPermission.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(perm => {
              if (perm === 'granted') {
                sessionStorage.setItem('gyro_permission_granted', 'true');
                activateGyroTracking();
              } else {
                if (gyroPermissionPrompt) gyroPermissionPrompt.classList.remove('is-visible');
              }
            })
            .catch(() => {
              if (gyroPermissionPrompt) gyroPermissionPrompt.classList.remove('is-visible');
            });
        } else {
          activateGyroTracking();
        }
      });
    }

    // Escuchar eventos según la plataforma
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize', handlePlatformChange);

    handlePlatformChange();
  }

  initEyeTracking();
});
