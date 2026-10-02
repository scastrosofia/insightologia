// ========================================================
// Insightología - Oráculo por los 30 años de El Ojo de Iberoamérica
// /api/oracle.js - Vercel Serverless Function
// ========================================================

const CONFIG = require('../config.js');

// Cargar variables de entorno desde .env local si existe (sin dependencias externas)
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(l => {
      const match = l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    });
  }
} catch (e) {}

// Caché en memoria pre-sembrada con el catálogo para respuesta en 0ms
let cachedPhrases = (CONFIG && CONFIG.CATALOG_PHRASES) ? CONFIG.CATALOG_PHRASES : null;
let lastCacheTime = Date.now();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Parser de CSV robusto para Google Sheets (soporta comillas, saltos y comas internas)
 */
function parseCSV(text) {
  const lines = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Saltar comilla escapada
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    lines.push(currentRow);
  }

  if (lines.length < 2) return [];

  // Parsear encabezados
  const headers = lines[0].map(h => h.trim().toLowerCase());
  
  // Buscar índices de columnas dinámicamente
  const idIdx = headers.findIndex(h => h === '#' || h === 'id');
  const fraseIdx = headers.findIndex(h => h === 'frase');
  const marcaIdx = headers.findIndex(h => h === 'marca');
  const agenciaIdx = headers.findIndex(h => h === 'agencia');
  const paisIdx = headers.findIndex(h => h === 'país' || h === 'pais');
  const anoIdx = headers.findIndex(h => h === 'año' || h === 'ano');
  const temaIdx = headers.findIndex(h => h === 'tema' || h === 'tipo');
  const activaIdx = headers.findIndex(h => h === 'activa');

  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    if (!row || row.length < 2) continue;

    const frase = (row[fraseIdx >= 0 ? fraseIdx : 1] || '').trim();
    if (!frase) continue;

    // Verificar columna Activa si existe
    if (activaIdx >= 0) {
      const activaVal = (row[activaIdx] || '').trim().toUpperCase();
      if (activaVal !== 'SI') continue;
    }

    const id = String(row[idIdx >= 0 ? idIdx : 0] || r).trim();
    const marca = (row[marcaIdx >= 0 ? marcaIdx : 2] || '').trim();
    const agencia = (row[agenciaIdx >= 0 ? agenciaIdx : 3] || '').trim();
    const pais = (row[paisIdx >= 0 ? paisIdx : 4] || '').trim();
    const ano = (row[anoIdx >= 0 ? anoIdx : 5] || '').trim();
    const tema = (row[temaIdx >= 0 ? temaIdx : 6] || '').trim();

    const catalogMatch = (CONFIG.CATALOG_PHRASES || []).find(p => String(p.id) === String(id));
    const mergedRow = Object.assign({}, catalogMatch || {}, { id, frase, marca, agencia, pais, ano, tema });
    if (catalogMatch) {
      if (catalogMatch.frase_pt) mergedRow.frase_pt = catalogMatch.frase_pt;
      if (catalogMatch.frase_es) mergedRow.frase_es = catalogMatch.frase_es;
      if (catalogMatch.pais_pt) mergedRow.pais_pt = catalogMatch.pais_pt;
      if (catalogMatch.link) mergedRow.link = catalogMatch.link;
    }

    rows.push(mergedRow);
  }

  return rows;
}

/**
 * Obtener frases activas desde Google Sheets (con timeout de 2.5s y fallback instantáneo al catálogo)
 */
async function getSheetPhrases() {
  const now = Date.now();
  if (cachedPhrases && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedPhrases;
  }

  const csvUrl = process.env.SHEET_CSV_URL || CONFIG.SHEET_CSV_URL;
  if (csvUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(csvUrl, { 
        headers: { 'Accept': 'text/csv' },
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const csvText = await res.text();
        const parsed = parseCSV(csvText);
        if (parsed.length > 0) {
          cachedPhrases = parsed;
          lastCacheTime = now;
          return cachedPhrases;
        }
      }
    } catch (err) {
      // Si superó timeout o no hay red, usar inmediatamente el catálogo precargado
    }
  }

  // Si falló el sheet y había caché previa, usarla
  if (cachedPhrases && cachedPhrases.length > 0) {
    return cachedPhrases;
  }

  // Devolver el catálogo completo precargado de 49 frases en 0ms
  return CONFIG.CATALOG_PHRASES || CONFIG.TEST_PHRASES;
}

// Diccionario semántico por Tags para fallback del backend
const BACKEND_THEMES = {
  'Amor y vínculos': ['amor', 'pareja', 'novio', 'novia', 'casar', 'casarme', 'separacion', 'divorcio', 'relacion', 'corazon', 'enamorar', 'querer', 'gustar', 'empatia', 'amigo', 'amigos', 'amistad', 'sentimiento', 'hombre', 'mujer', 'namorado', 'namorada', 'casamento', 'relacionamento', 'amizade', 'homem', 'mulher'],
  'Trabajo y creatividad': ['trabajo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 'empresa', 'marca', 'negocio', 'exito', 'ascenso', 'cliente', 'jefe', 'agencia', 'idea', 'ideas', 'crear', 'creativo', 'creatividad', 'campana', 'publicidad', 'aviso', 'oficio', 'trabalho', 'carreira', 'dinheiro', 'grana', 'salario', 'sucesso', 'ideia', 'ideias', 'criatividade', 'anuncio'],
  'Futuro y tecnología': ['ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'futuro', 'computadora', 'chatgpt', 'digital', 'automatizar', 'innovar', 'manana', 'destino', 'chip', 'data', 'inteligencia', 'artificial', 'computador', 'inovacao', 'dados'],
  'Riesgo y valentía': ['miedo', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 'atreverse', 'cambiar', 'cambio', 'decision', 'saltar', 'coraje', 'avanzar', 'tirarme', 'coragem', 'arriscar', 'medo', 'perigo', 'decisao'],
  'Identidad': ['quien soy', 'estilo', 'edad', 'grande', 'viejo', 'ser yo', 'autoestima', 'identidad', 'dudas', 'autentico', 'comparar', 'sentido', 'propio', 'quem sou', 'idade', 'identidade'],
  'Placer y vida cotidiana': ['comer', 'pasta', 'hambre', 'sed', 'cerveza', 'birra', 'comida', 'cuerpo', 'casa', 'disfrutar', 'cotidiano', 'dormir', 'desayuno', 'massa', 'fome', 'sede', 'corpo', 'beber'],
  'Tiempo y país': ['tiempo', 'nostalgia', 'anos', 'pais', 'argentina', 'epoca', 'antes', 'pasado', 'recuerdo', 'tempo', 'lembranca']
};

const BACKEND_FUNCTIONS = {
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

/**
 * Fallback inteligente: selección semántica con rotación variada sobre las 50 frases
 */
function pickFallbackPhrase(phrases, question, recentIds = []) {
  const safeRecent = recentIds.map(String);
  let candidates = phrases.filter(p => !safeRecent.includes(String(p.id)));
  if (candidates.length === 0) candidates = phrases;

  const qLower = (question || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const words = qLower
    .split(/[\s,?.!¡¿;:\-_]+/)
    .filter(w => w.length > 2 && !['que', 'como', 'para', 'este', 'esta', 'los', 'las', 'del', 'por', 'con', 'sin', 'sobre', 'voy', 'va', 'sera', 'hacer'].includes(w));
  const wordsSet = new Set(words);

  const matchedThemes = new Set();
  Object.entries(BACKEND_THEMES).forEach(([themeName, triggers]) => {
    if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
      matchedThemes.add(themeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    }
  });

  const matchedFunctions = new Set();
  Object.entries(BACKEND_FUNCTIONS).forEach(([funcName, triggers]) => {
    if (triggers.some(tr => matchesTrigger(qLower, wordsSet, tr))) {
      matchedFunctions.add(funcName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    }
  });

  const scored = candidates.map(item => {
    let score = 0;
    const fNorm = (item.frase || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const fPtNorm = (item.frase_pt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const tNorm = (item.tema || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const funcNorm = (item.funcion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const mNorm = (item.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Coincidencia por Tema
    let hasThemeMatch = false;
    for (const t of matchedThemes) {
      if (tNorm.includes(t)) {
        score += 6;
        hasThemeMatch = true;
        break;
      }
    }

    // Coincidencia por Función
    for (const fn of matchedFunctions) {
      if (funcNorm.includes(fn)) {
        score += 5;
        break;
      }
    }

    // Coincidencias léxicas
    words.forEach(w => {
      if (fNorm.includes(w) || fPtNorm.includes(w)) score += 3;
      if (tNorm.includes(w)) score += 2;
      if (mNorm.includes(w)) score += 1;
    });

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

  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0]?.score || 0;

  if (topScore > 3) {
    const topTier = scored.filter(s => s.score >= Math.max(3, topScore * 0.75)).map(s => s.item);
    return topTier[Math.floor(Math.random() * topTier.length)];
  }

  const comodines = candidates.filter(p => p.comodin && p.flag !== 'Revisar');
  const fallbackList = (comodines.length > 0) ? comodines : candidates;
  return fallbackList[Math.floor(Math.random() * fallbackList.length)];
}

/**
 * Consulta a Google Gemini con timeout estricto de 6 segundos
 */
async function queryGeminiOracle(phrases, question, recentIds = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY no configurada. Activando fallback local.');
    return null;
  }

  // Filtrar frases recientes para que Gemini no las elija
  const safeRecent = recentIds.map(String);
  let candidates = phrases.filter(p => !safeRecent.includes(String(p.id)));
  if (candidates.length < 3) candidates = phrases;

  // Lista compacta con Tags completos
  const compactList = candidates.map(p => {
    let line = `ID:${p.id} | Frase:"${p.frase}"`;
    if (p.tema) line += ` | Tema:${p.tema}`;
    if (p.funcion) line += ` | Función:${p.funcion}`;
    if (p.tono) line += ` | Tono:${p.tono}`;
    return line;
  }).join('\n');

  const systemPrompt = `Sos el Oráculo de la Insightología (30 años de El Ojo de Iberoamérica).
El consultante te hará una pregunta sobre su vida, amor, trabajo, futuro o dilemas personales.
Tenés un catálogo de frases memorables de la creatividad iberoamericana clasificadas por TEMA, FUNCIÓN y TONO.

CRITERIO DE ELECCIÓN:
1. Detectá qué necesita el consultante:
   - Si duda sobre si animarse o dar el paso → Elegí una frase con función "Empuja a actuar".
   - Si expresa miedo, cansancio o angustia → Elegí una frase con función "Tranquiliza o relativiza".
   - Si pregunta si algo sucederá o es binaria ("¿sí o no?") → Priorizá "Sí o no rotundo" o "Sentencia de oráculo".
   - Si pregunta "¿qué va a pasar?" o sobre el sentido de las cosas → Elegí "Sentencia de oráculo" o tono "Profético".
   - Si toca temas de amor, trabajo, riesgo o tecnología → Conectá con el TEMA correspondiente.
2. La respuesta debe tener chispa oracular poética, reveladora o irónica.
3. Respondé ÚNICAMENTE con un JSON con el ID elegido: {"id": "..."}`;

  const userContent = `PREGUNTA DEL CONSULTANTE: "${question}"\n\nLISTA DE FRASES DISPONIBLES:\n${compactList}`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userContent }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Error en Gemini API (${response.status}):`, errText);
      return null;
    }

    const resJson = await response.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    // Parsear respuesta JSON { "id": "..." }
    const parsed = JSON.parse(candidateText.trim());
    if (parsed && parsed.id) {
      const chosen = phrases.find(p => String(p.id) === String(parsed.id));
      return chosen || null;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Llamada a Gemini abortada o con error:', err.message);
  }

  return null;
}

/**
 * Handler principal compatible con Vercel Serverless Function
 */
module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
    return;
  }

  try {
    const body = req.body || {};
    const pregunta = (body.pregunta || '').trim();
    const recentIds = Array.isArray(body.recentIds) ? body.recentIds : [];

    // Moderación: Pregunta vacía o menor a 3 caracteres
    if (pregunta.length < 3) {
      return res.status(200).json({
        id: "gen-0",
        frase: "Quien no formula su pregunta, ya conoce el silencio del porvenir.",
        marca: "Insightología",
        agencia: "El Ojo de Iberoamérica",
        pais: "Iberoamérica",
        ano: "1994-2024",
        tema: "Sabiduría"
      });
    }

    // 1. Obtener frases desde el Google Sheet (o caché)
    const phrases = await getSheetPhrases();

    // 2. Intentar llamar a Gemini con timeout de 6s
    let chosenPhrase = await queryGeminiOracle(phrases, pregunta, recentIds);

    // 3. Fallback en caso de timeout, error o respuesta nula
    if (!chosenPhrase) {
      chosenPhrase = pickFallbackPhrase(phrases, pregunta, recentIds);
    }

    if (chosenPhrase && chosenPhrase.id && CONFIG.CATALOG_PHRASES) {
      const catalogMatch = CONFIG.CATALOG_PHRASES.find(p => String(p.id) === String(chosenPhrase.id));
      if (catalogMatch) {
        chosenPhrase = Object.assign({}, catalogMatch, chosenPhrase);
        if (!chosenPhrase.frase_pt && catalogMatch.frase_pt) chosenPhrase.frase_pt = catalogMatch.frase_pt;
        if (!chosenPhrase.pais_pt && catalogMatch.pais_pt) chosenPhrase.pais_pt = catalogMatch.pais_pt;
        if (!chosenPhrase.link && catalogMatch.link) chosenPhrase.link = catalogMatch.link;
      }
    }

    return res.status(200).json({
      id: chosenPhrase.id,
      frase: chosenPhrase.frase,
      frase_es: chosenPhrase.frase_es || chosenPhrase.frase,
      frase_pt: chosenPhrase.frase_pt || '',
      marca: chosenPhrase.marca,
      agencia: chosenPhrase.agencia,
      pais: chosenPhrase.pais,
      pais_pt: chosenPhrase.pais_pt || chosenPhrase.pais || '',
      ano: chosenPhrase.ano,
      tema: chosenPhrase.tema,
      link: chosenPhrase.link || ''
    });

  } catch (err) {
    console.error('Error interno en /api/oracle:', err);
    // Contingencia final absoluta: nunca fallar
    const fallback = pickFallbackPhrase(CONFIG.TEST_PHRASES, req.body?.pregunta || '', req.body?.recentIds || []);
    return res.status(200).json(fallback);
  }
};
