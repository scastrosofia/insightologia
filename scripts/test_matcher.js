const config = require('../config.js');

const questions = [
  '¿Debería cambiar de trabajo y animarme a emprender?',
  '¿Me voy a casar o voy a encontrar el amor?',
  '¿Qué va a pasar con la inteligencia artificial?',
  'Tengo mucho miedo y estrés',
  '¿Va a funcionar mi proyecto, sí o no?',
  'Tengo un hambre voraz, ¿qué como?',
  '¿Por qué me cuesta tanto ser yo mismo?',
  '¿Qué hago con mi vida?'
];

const THEME_TRIGGERS = {
  'Amor y vínculos': ['amor', 'pareja', 'novio', 'novia', 'casar', 'casarme', 'separacion', 'divorcio', 'relacion', 'corazon', 'enamorar', 'querer', 'gustar', 'empatia', 'amigo', 'amigos', 'amistad', 'sentimiento', 'hombre', 'mujer'],
  'Trabajo y creatividad': ['trabajo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 'empresa', 'marca', 'negocio', 'exito', 'ascenso', 'cliente', 'jefe', 'agencia', 'idea', 'ideas', 'crear', 'creativo', 'creatividad', 'campana', 'publicidad', 'aviso', 'oficio'],
  'Futuro y tecnología': ['ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'futuro', 'computadora', 'chatgpt', 'digital', 'automatizar', 'innovar', 'manana', 'destino', 'chip', 'data'],
  'Riesgo y valentía': ['miedo', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 'atreverse', 'cambiar', 'cambio', 'decision', 'saltar', 'coraje', 'avanzar', 'tirarme'],
  'Identidad': ['quien soy', 'estilo', 'edad', 'grande', 'viejo', 'ser yo', 'autoestima', 'identidad', 'dudas', 'autentico', 'comparar', 'sentido', 'propio'],
  'Placer y vida cotidiana': ['comer', 'pasta', 'hambre', 'sed', 'cerveza', 'birra', 'comida', 'cuerpo', 'casa', 'disfrutar', 'cotidiano', 'dormir', 'desayuno'],
  'Tiempo y país': ['tiempo', 'nostalgia', 'anos', 'pais', 'argentina', 'epoca', 'antes', 'pasado', 'recuerdo']
};

const FUNCTION_TRIGGERS = {
  'Empuja a actuar': ['debo', 'tengo que', 'hago', 'hacerlo', 'me animo', 'avanzo', 'empiezo', 'tiro', 'arriesgo', 'comienzo', 'deberia', 'puedo', 'voy a'],
  'Tranquiliza o relativiza': ['miedo', 'cansado', 'cansada', 'angustia', 'estres', 'preocupado', 'preocupada', 'duda', 'dudas', 'perder', 'sola', 'solo', 'triste', 'pasa nada'],
  'Sí o no rotundo': ['si o no', 'va a pasar', 'sera que', 'es verdad', 'triunfare', 'lo lograre', 'va a salir', 'saldra bien', 'va a funcionar'],
  'Sentencia de oráculo': ['que va a pasar', 'cual es el', 'hacia donde', 'que pasara', 'que significa', 'que sentido', 'por que', 'para que'],
  'Desafía o cuestiona': ['seguro', 'verdad', 'enserio', 'crees', 'pensas', 'te parece', 'tonto', 'loco'],
  'Humor o absurdo': ['jaja', 'chiste', 'mentira', 'locura', 'broma', 'ridiculo']
};

function matchesTrigger(text, wordsSet, trigger) {
  if (trigger.includes(' ')) {
    return text.includes(trigger);
  }
  return wordsSet.has(trigger);
}

questions.forEach(q => {
  const qLower = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const wordsSet = new Set(qLower.split(/[\s,?.!¡¿;:\-_]+/));

  const matchedThemes = new Set();
  Object.entries(THEME_TRIGGERS).forEach(([t, triggers]) => {
    if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
      matchedThemes.add(t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }
  });

  const matchedFunctions = new Set();
  Object.entries(FUNCTION_TRIGGERS).forEach(([fn, triggers]) => {
    if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
      matchedFunctions.add(fn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }
  });

  const scored = config.CATALOG_PHRASES.map(item => {
    let score = 0;
    const tNorm = (item.tema || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const funcNorm = (item.funcion || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let hasThemeMatch = false;
    for (const t of matchedThemes) {
      if (tNorm.includes(t)) { score += 6; hasThemeMatch = true; break; }
    }
    for (const fn of matchedFunctions) {
      if (funcNorm.includes(fn)) { score += 5; break; }
    }
    if (item.flag === 'Depende de contexto' && !hasThemeMatch) {
      score -= 10;
    }
    if (item.flag === 'Revisar') {
      score -= 10;
    }
    if (item.comodin && score <= 3) {
      score += 2;
    }
    return { item, score };
  });

  scored.sort((a,b) => b.score - a.score);
  console.log(`\nPREGUNTA: "${q}"`);
  console.log(` -> ELEGIDA: "${scored[0].item.frase}" (Score: ${scored[0].score})`);
  console.log(`    Marca: ${scored[0].item.marca} | Tema: ${scored[0].item.tema} | Función: ${scored[0].item.funcion} | Tono: ${scored[0].item.tono}`);
});
