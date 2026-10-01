// config.js - Insightología Configuration
const CONFIG = {
  // Google Sheet publicado como CSV
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/1iXTCqt8MevnbPK0Ng-BaV4rh1ci1rZNEV0UQoeJAiGY/export?format=csv',

  // Endpoint del backend serverless en Vercel
  API_ORACLE_URL: '/api/oracle',

  // Timeout para fallback de respuesta (ms)
  TIMEOUT_MS: 6000,

  // Tiempo de visualización automática antes de ZOOM OUT (ms)
  AUTO_RESET_MS: 20000,

  // Frases de prueba para desarrollo inicial (Fase 2)
  TEST_PHRASES: [
    {
      id: "1",
      frase: "Para qué mentir, si podés teletransportarte",
      marca: "Cerveza Andes",
      agencia: "Del Campo Nazca Saatchi & Saatchi",
      pais: "Argentina",
      ano: "2010",
      tema: "Teletransportación / Verdad"
    },
    {
      id: "2",
      frase: "Einstein estaba equivocado.",
      marca: "Cerveza Andes",
      agencia: "Del Campo Nazca Saatchi & Saatchi",
      pais: "Argentina",
      ano: "2010",
      tema: "Física / Amistad"
    },
    {
      id: "4",
      frase: "Cuando los hombres y las mujeres se encuentran, nace el igualismo",
      marca: "Quilmes",
      agencia: "Young & Rubicam",
      pais: "Argentina",
      ano: "2012",
      tema: "Relaciones / Igualdad"
    },
    {
      id: "5",
      frase: "Tu cuerpo pide pasta",
      marca: "Lucchetti",
      agencia: "Madre",
      pais: "Argentina",
      ano: "2014",
      tema: "Deseo / Humor"
    },
    {
      id: "9",
      frase: "¿Te gusta conducir?",
      marca: "BMW",
      agencia: "*S,C,P,F...",
      pais: "España",
      ano: "1999",
      tema: "Pasión / Libertad"
    }
  ]
};

// Compatible con Node / ES Modules / Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
