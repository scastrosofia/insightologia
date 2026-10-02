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
  const ballContent = document.getElementById('ball-content');
  const ballPlasma = document.getElementById('ball-plasma');
  const ballPlasmaCore = document.getElementById('ball-plasma-core');
  const floatingQuestion = document.getElementById('floating-question');
  const phraseContainer = document.getElementById('phrase-container');
  const phraseText = document.getElementById('phrase-text');
  const phraseCredit = document.getElementById('phrase-credit');
  const revealControls = document.getElementById('reveal-controls');
  const btnReset = document.getElementById('btn-reset');
  const particlesCanvas = document.getElementById('particles-canvas');
  const feTurbulence = document.getElementById('feTurbulence');
  const btnSound = document.getElementById('btn-sound');
  const iconSoundOn = btnSound ? btnSound.querySelector('.icon-sound-on') : null;
  const iconSoundOff = btnSound ? btnSound.querySelector('.icon-sound-off') : null;
  const audioWind = document.getElementById('audio-wind');
  const audioOffice = document.getElementById('audio-office');

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
    { type: 'image', src: 'assets/escena.webp' },
    { type: 'image', src: 'assets/manos.png' },
    { type: 'image', src: 'assets/fondo-aterciopelado.jpeg' },
    { type: 'image', src: 'assets/gato.webp' },
    { type: 'image', src: 'assets/escena-mobile.webp' },
    { type: 'image', src: 'assets/manos-mobile.png' }
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
      recognition.lang = 'es-AR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecording = true;
        btnMic.classList.add('recording');
        if (micStatus) {
          micStatus.textContent = 'Escuchando tu pregunta...';
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

    // Preparar el texto y el crédito
    renderPhraseText(data.frase);
    phraseCredit.textContent = `${data.marca || ''} · ${data.agencia || ''} · ${data.pais || ''} · ${data.ano || ''}`
      .replace(/^[\s·]+|[\s·]+$/g, '');

    // Calcular tamaño adaptable de fuente según longitud de la frase
    adjustAdaptiveFontSize(data.frase);

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
    }, '-=0.2')
    .call(() => {
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
        userInput.value = '';
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

  function renderPhraseText(frase) {
    phraseText.innerHTML = '';
    const cleanFrase = (frase || '').trim();
    const words = cleanFrase.split(/\s+/);

    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'phrase-word';
      span.textContent = word + ' ';
      phraseText.appendChild(span);
    });
  }

  function adjustAdaptiveFontSize(frase) {
    const len = (frase || '').length;
    const isMob = isMobilePortrait();

    // Dimensionamiento proporcional adaptativo
    // En mobile se reduce ~25% para no ser tapado por los dedos y calzar en el centro de la bola
    let fontSize = isMob ? 7.2 : 10;

    if (len < 25) {
      fontSize = isMob ? 8.6 : 13;
    } else if (len < 45) {
      fontSize = isMob ? 7.6 : 11;
    } else if (len < 75) {
      fontSize = isMob ? 6.6 : 9.2;
    } else if (len < 110) {
      fontSize = isMob ? 5.8 : 8.2;
    } else {
      fontSize = isMob ? 5.0 : 7.4;
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
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      'hombre', 'mujer', 'chico', 'chica', 'volver', 'ex', 'cita', 'conocer'
    ],
    'Trabajo y creatividad': [
      'trabajo', 'laburo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 
      'sueldos', 'empresa', 'marca', 'negocio', 'negocios', 'exito', 'ascenso', 'ascender', 
      'renunciar', 'emprender', 'emprendimiento', 'cliente', 'jefe', 'jefa', 'agencia', 
      'idea', 'ideas', 'crear', 'creativo', 'creatividad', 'campana', 'publicidad', 
      'aviso', 'oficio', 'estudiar', 'estudio', 'profesion', 'proyecto'
    ],
    'Futuro y tecnología': [
      'ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'robots', 'futuro', 'computadora', 
      'chatgpt', 'digital', 'automatizar', 'innovar', 'manana', 'destino', 'chip', 
      'data', 'inteligencia', 'artificial', 'reemplazar', 'progreso', 'ciencia'
    ],
    'Riesgo y valentía': [
      'miedo', 'miedos', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 
      'arriesgo', 'atreverse', 'atrevo', 'animo', 'animarme', 'cambiar', 'cambio', 
      'decision', 'saltar', 'coraje', 'avanzar', 'tirarme', 'jugarmela', 'jugarme', 'pileta'
    ],
    'Identidad': [
      'quien soy', 'como soy', 'estilo', 'edad', 'grande', 'viejo', 'ser yo', 
      'autoestima', 'identidad', 'dudas', 'autentico', 'comparar', 'sentido', 
      'propio', 'proposito', 'vida', 'existencia', 'personalidad'
    ],
    'Placer y vida cotidiana': [
      'comer', 'pasta', 'hambre', 'sed', 'cerveza', 'birra', 'vino', 'comida', 
      'cuerpo', 'casa', 'disfrutar', 'cotidiano', 'dormir', 'desayuno', 'fiesta', 
      'salida', 'descansar', 'vacaciones', 'placer', 'vivir'
    ],
    'Tiempo y país': [
      'tiempo', 'nostalgia', 'anos', 'pais', 'argentina', 'epoca', 'antes', 
      'pasado', 'recuerdo', 'historia', 'recuerdos'
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
        if (fNorm.includes(w)) score += 4;
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
    if (isMuted) {
      btnSound.classList.add('muted');
      btnSound.setAttribute('title', 'Activar sonido');
      btnSound.setAttribute('aria-label', 'Activar sonido');
      if (iconSoundOn) iconSoundOn.style.display = 'none';
      if (iconSoundOff) iconSoundOff.style.display = 'block';
    } else {
      btnSound.classList.remove('muted');
      btnSound.setAttribute('title', 'Silenciar sonido');
      btnSound.setAttribute('aria-label', 'Silenciar sonido');
      if (iconSoundOn) iconSoundOn.style.display = 'block';
      if (iconSoundOff) iconSoundOff.style.display = 'none';
    }
  }
});
