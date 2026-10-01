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

// Caché en memoria para la instancia serverless (5 minutos)
let cachedPhrases = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

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

    rows.push({ id, frase, marca, agencia, pais, ano, tema });
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

// Diccionario de temas para enriquecer afinidades semánticas en fallback
const BACKEND_THEMES = {
  amor: {
    triggers: ['amor', 'pareja', 'novio', 'novia', 'casar', 'casarme', 'relacion', 'corazon', 'hombre', 'mujer', 'hombres', 'mujeres', 'divorcio', 'empatia', 'caring', 'enamorar', 'querer'],
    phraseIds: ['4', '7', '24', '26', '33']
  },
  trabajo: {
    triggers: ['trabajo', 'empleo', 'carrera', 'plata', 'dinero', 'guita', 'sueldo', 'empresa', 'marca', 'negocio', 'exito', 'ascenso', 'cliente', 'jefe', 'banco', 'salchicha'],
    phraseIds: ['15', '18', '21', '22', '25', '27', '38', '40', '41']
  },
  tecnologia: {
    triggers: ['ia', 'ai', 'tecnologia', 'algoritmo', 'robot', 'futuro', 'computadora', 'chatgpt', 'digital', 'automatizar', 'innovar', 'mañana'],
    phraseIds: ['30', '34', '49', '31']
  },
  creatividad: {
    triggers: ['idea', 'ideas', 'crear', 'creativo', 'creatividad', 'inventar', 'campaña', 'publicidad', 'antidoto', 'desordenar', 'filosofia', 'fresco', 'original'],
    phraseIds: ['23', '29', '35', '36', '37', '39', '42', '45', '46']
  },
  riesgo: {
    triggers: ['miedo', 'riesgo', 'peligro', 'valiente', 'valentia', 'arriesgar', 'atreverse', 'cambiar', 'cambio', 'decision'],
    phraseIds: ['32', '41', '43', '48']
  },
  existencial: {
    triggers: ['verdad', 'mentir', 'mentira', 'vida', 'destino', 'sentido', 'porvenir', 'tiempo', 'conducir', 'agua', 'despeinar', 'casa', 'libertad'],
    phraseIds: ['1', '2', '6', '8', '9', '10', '14', '44', '47']
  }
};

/**
 * Fallback inteligente: selección semántica con rotación variada sobre las 49 frases
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
    .split(/[\s,?.!¡¿;:]+/)
    .filter(w => w.length > 2 && !['que', 'como', 'para', 'este', 'esta', 'los', 'las', 'del', 'por', 'con', 'sin', 'sobre', 'voy', 'va', 'sera', 'hacer'].includes(w));

  const matchedIds = new Set();
  Object.values(BACKEND_THEMES).forEach(theme => {
    if (theme.triggers.some(tr => qLower.includes(tr))) {
      theme.phraseIds.forEach(id => matchedIds.add(id));
    }
  });

  const scored = candidates.map(item => {
    let score = 0;
    const fNorm = (item.frase || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const tNorm = (item.tema || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const mNorm = (item.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (matchedIds.has(String(item.id))) score += 5;

    words.forEach(w => {
      if (fNorm.includes(w)) score += 3;
      if (tNorm.includes(w)) score += 2;
      if (mNorm.includes(w)) score += 1;
    });

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topScore = scored[0]?.score || 0;

  if (topScore > 0) {
    const topTier = scored.filter(s => s.score >= Math.max(2, topScore * 0.7)).map(s => s.item);
    return topTier[Math.floor(Math.random() * topTier.length)];
  }

  // Selección aleatoria entre los 49 ítems si la pregunta es abierta
  return candidates[Math.floor(Math.random() * candidates.length)];
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

  // Lista compacta: ID + Frase + Tema
  const compactList = candidates.map(p => `ID:${p.id} | Frase:"${p.frase}" | Tema:${p.tema || 'Publicidad'}`).join('\n');

  const systemPrompt = `Sos un oráculo de la creatividad iberoamericana. Te van a hacer una pregunta sobre el futuro. Elegí de la lista la frase que mejor funcione como respuesta poética, sorprendente o con humor, aunque la conexión sea lateral. Respondé SOLO con un JSON: {"id": "..."}`;
  
  const userContent = `PREGUNTA DEL CONSULTANTE: "${question}"\n\nLISTA DE FRASES DISPONIBLES:\n${compactList}`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

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
          responseMimeType: 'application/json'
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

    return res.status(200).json({
      id: chosenPhrase.id,
      frase: chosenPhrase.frase,
      marca: chosenPhrase.marca,
      agencia: chosenPhrase.agencia,
      pais: chosenPhrase.pais,
      ano: chosenPhrase.ano,
      tema: chosenPhrase.tema
    });

  } catch (err) {
    console.error('Error interno en /api/oracle:', err);
    // Contingencia final absoluta: nunca fallar
    const fallback = pickFallbackPhrase(CONFIG.TEST_PHRASES, req.body?.pregunta || '', req.body?.recentIds || []);
    return res.status(200).json(fallback);
  }
};
