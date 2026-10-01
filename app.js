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
    { type: 'image', src: 'assets/logo.webp' },
    { type: 'image', src: 'assets/fondo-aterciopelado.jpeg' },
    { type: 'video', src: 'assets/gato.webm' }
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
      
      const tlFly = gsap.timeline();
      tlFly.fromTo(floatingQuestion, 
        { opacity: 0, scale: 0.8, x: '25%', y: '50%' },
        { opacity: 1, scale: 1, x: '25%', y: '50%', duration: 0.4, ease: 'back.out(1.5)' }
      )
      .to(floatingQuestion, {
        opacity: 0,
        scale: 0.3,
        x: '44.8%',
        y: '74.5%',
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
      // Escalar el stage (4.4x) y centrar la bola en X=50% e Y=48%
      gsap.to(stage, {
        scale: 4.4,
        xPercent: 5.2,
        yPercent: -26.5,
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
    // Dimensionamiento proporcional al círculo de 11.8%
    // Al escalarse por 4.6x durante ZOOM IN, 10px equivale a ~46px visuales en pantalla
    let fontSize = 10;

    if (len < 25) {
      fontSize = 13;
    } else if (len < 45) {
      fontSize = 11;
    } else if (len < 75) {
      fontSize = 9.2;
    } else if (len < 110) {
      fontSize = 8.2;
    } else {
      fontSize = 7.4;
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

  // Inicializar de inmediato con el catálogo completo de 49 frases de El Ojo
  let clientCachedSheet = (typeof CONFIG !== 'undefined' && (CONFIG.CATALOG_PHRASES || CONFIG.TEST_PHRASES)) 
    ? (CONFIG.CATALOG_PHRASES || CONFIG.TEST_PHRASES) 
    : [];

  // Intento no bloqueante de sincronizar en segundo plano con Google Sheets si hay conexión
  if (typeof CONFIG !== 'undefined' && CONFIG.SHEET_CSV_URL) {
    fetch(CONFIG.SHEET_CSV_URL)
      .then(res => res.ok ? res.text() : '')
      .then(text => {
        if (!text) return;
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2 && cols[1]) {
            parsed.push({
              id: cols[0] || String(i),
              frase: cols[1],
              marca: cols[2] || '',
              agencia: cols[3] || '',
              pais: cols[4] || '',
              ano: cols[5] || '',
              tema: cols[6] || 'Creatividad'
            });
          }
        }
        if (parsed.length > 0) clientCachedSheet = parsed;
      })
      .catch(() => {});
  }

  // Diccionario semántico para enriquecer coincidencias conceptuales
  const SEMANTIC_THEMES = {
    amor: {
      triggers: ['amor', 'pareja', 'novio', 'novia', 'casar', 'casarme', 'relacion', 'corazon', 'sentimiento', 'hombre', 'mujer', 'hombres', 'mujeres', 'divorcio', 'empatia', 'caring', 'enamorar', 'querer', 'gustar'],
      phraseIds: ['4', '7', '24', '26', '33'] // igualismo, amo a laura, divorciarnos, empatía, caring
    },
    trabajo: {
      triggers: ['trabajo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 'empresa', 'marca', 'negocio', 'exito', 'ascenso', 'cliente', 'jefe', 'agencia', 'banco', 'salchicha'],
      phraseIds: ['15', '18', '21', '22', '25', '27', '38', '40', '41'] // trabajo real, palacio, sacamos petróleo, etc.
    },
    tecnologia: {
      triggers: ['ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'futuro', 'computadora', 'chatgpt', 'digital', 'automatizar', 'innovar', 'mañana'],
      phraseIds: ['30', '34', '49', '31'] // el AI concluye, caballo de troya, la IA acelera, innovar
    },
    creatividad: {
      triggers: ['idea', 'ideas', 'crear', 'creativo', 'creatividad', 'inventar', 'campaña', 'publicidad', 'antidoto', 'desordenar', 'filosofia', 'fresco', 'original'],
      phraseIds: ['23', '29', '35', '36', '37', '39', '42', '45', '46'] // la creatividad es el antídoto, la idea primero, etc.
    },
    riesgo: {
      triggers: ['miedo', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 'atreverse', 'cambiar', 'cambio', 'decision', 'seguro'],
      phraseIds: ['32', '41', '43', '48'] // valentía es contagiosa, había peligro, peor ellos o mejor tú
    },
    existencial: {
      triggers: ['verdad', 'mentir', 'mentira', 'vida', 'destino', 'sentido', 'porvenir', 'tiempo', 'conducir', 'agua', 'despeinar', 'casa', 'libertad'],
      phraseIds: ['1', '2', '6', '8', '9', '10', '14', '44', '47'] // teletransportarte, einstein, be water, despeine, etc.
    }
  };

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
        ano: "2010",
        tema: "Publicidad"
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
      .split(/[\s,?.!¡¿;:]+/)
      .filter(w => w.length > 2 && !['que', 'como', 'para', 'este', 'esta', 'estos', 'estas', 'los', 'las', 'del', 'por', 'con', 'sin', 'sobre', 'voy', 'va', 'sera', 'hacer'].includes(w));

    // Evaluar afinidad temática conceptual
    const matchedCategoryPhraseIds = new Set();
    Object.values(SEMANTIC_THEMES).forEach(theme => {
      const hasTrigger = theme.triggers.some(tr => qLower.includes(tr));
      if (hasTrigger) {
        theme.phraseIds.forEach(id => matchedCategoryPhraseIds.add(id));
      }
    });

    // Puntuar cada frase del pool
    const scored = pool.map(item => {
      let score = 0;
      const fNorm = (item.frase || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const tNorm = (item.tema || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mNorm = (item.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Si coincide con categoría temática conceptual (+5 pts)
      if (matchedCategoryPhraseIds.has(String(item.id))) {
        score += 5;
      }

      // Si contiene palabras clave de la pregunta
      words.forEach(w => {
        if (fNorm.includes(w)) score += 3;
        if (tNorm.includes(w)) score += 2;
        if (mNorm.includes(w)) score += 1;
      });

      return { item, score };
    });

    // Ordenar por afinidad
    scored.sort((a, b) => b.score - a.score);

    let selected;
    const topScore = scored[0]?.score || 0;

    if (topScore > 0) {
      // Tomar las frases con mayor afinidad y seleccionar una al azar entre las mejores
      const bestCandidates = scored.filter(s => s.score >= Math.max(2, topScore * 0.7)).map(s => s.item);
      selected = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    } else {
      // Si la pregunta es abierta o abstracta, seleccionar una al azar de todo el catálogo (sin repetir las últimas 5)
      selected = pool[Math.floor(Math.random() * pool.length)];
    }

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
