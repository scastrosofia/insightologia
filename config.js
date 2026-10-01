// config.js - Insightología Configuration
const CONFIG = {
  // Google Sheet publicado como CSV
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/1iXTCqt8MevnbPK0Ng-BaV4rh1ci1rZNEV0UQoeJAiGY/export?format=csv',

  // Endpoint del backend serverless en Vercel o local
  API_ORACLE_URL: '/api/oracle',

  // Timeout para respuesta de API (ms)
  TIMEOUT_MS: 5000,

  // Tiempo de visualización automática antes de ZOOM OUT (ms)
  AUTO_RESET_MS: 20000,

  // Catálogo completo de los 30 años de El Ojo de Iberoamérica (49 frases)
  // Disponible instantáneamente en 0ms tanto en local como en GitHub Pages
  CATALOG_PHRASES: [
  {
    "id": "1",
    "frase": "Para qué mentir, si podés teletransportarte",
    "marca": "Cerveza Andes",
    "agencia": "Del Campo Nazca Saatchi & Saatchi",
    "pais": "Argentina",
    "ano": "2010",
    "tema": "Publicidad"
  },
  {
    "id": "2",
    "frase": "Einstein estaba equivocado.",
    "marca": "Cerveza Andes",
    "agencia": "Del Campo Nazca Saatchi & Saatchi",
    "pais": "Argentina",
    "ano": "2010",
    "tema": "Publicidad"
  },
  {
    "id": "3",
    "frase": "Es como somos",
    "marca": "Cerveza Andes",
    "agencia": "Del Campo Nazca Saatchi & Saatchi",
    "pais": "Argentina",
    "ano": "s/d",
    "tema": "Publicidad"
  },
  {
    "id": "4",
    "frase": "Cuando los hombres y las mujeres se encuentran, nace el igualismo",
    "marca": "Quilmes",
    "agencia": "Young & Rubicam",
    "pais": "Argentina",
    "ano": "2012",
    "tema": "Publicidad"
  },
  {
    "id": "5",
    "frase": "Tu cuerpo pide pasta",
    "marca": "Lucchetti",
    "agencia": "Madre",
    "pais": "Argentina",
    "ano": "2014 (?)",
    "tema": "Publicidad"
  },
  {
    "id": "6",
    "frase": "Dejá que la vida te despeine",
    "marca": "Sedal",
    "agencia": "JWT Argentina / El Hotel",
    "pais": "Argentina",
    "ano": "2005",
    "tema": "Publicidad"
  },
  {
    "id": "7",
    "frase": "Amo a Laura",
    "marca": "MTV España",
    "agencia": "Tiempo BBDO",
    "pais": "España",
    "ano": "2006",
    "tema": "Publicidad"
  },
  {
    "id": "8",
    "frase": "Bienvenido a la república independiente de tu casa",
    "marca": "IKEA",
    "agencia": "*S,C,P,F...",
    "pais": "España",
    "ano": "2006",
    "tema": "Publicidad"
  },
  {
    "id": "9",
    "frase": "¿Te gusta conducir?",
    "marca": "BMW",
    "agencia": "*S,C,P,F...",
    "pais": "España",
    "ano": "1999",
    "tema": "Publicidad"
  },
  {
    "id": "10",
    "frase": "Be water, my friend",
    "marca": "BMW",
    "agencia": "SCPF",
    "pais": "España",
    "ano": "2006",
    "tema": "Publicidad"
  },
  {
    "id": "11",
    "frase": "Lo que visto nunca queda en visto",
    "marca": "El Palacio de Hierro",
    "agencia": "Terán\\TBWA",
    "pais": "México",
    "ano": "2025",
    "tema": "Publicidad"
  },
  {
    "id": "12",
    "frase": "A mí siempre me queda el saco",
    "marca": "El Palacio de Hierro",
    "agencia": "Terán\\TBWA",
    "pais": "México",
    "ano": "2025",
    "tema": "Publicidad"
  },
  {
    "id": "13",
    "frase": "Mi estilo se escribe con Z",
    "marca": "El Palacio de Hierro",
    "agencia": "Terán\\TBWA",
    "pais": "México",
    "ano": "2025",
    "tema": "Publicidad"
  },
  {
    "id": "14",
    "frase": "Ser grande no es cuestión de edad",
    "marca": "El Palacio de Hierro",
    "agencia": "Terán\\TBWA",
    "pais": "México",
    "ano": "2025",
    "tema": "Publicidad"
  },
  {
    "id": "15",
    "frase": "Soy totalmente Palacio",
    "marca": "El Palacio de Hierro",
    "agencia": "Terán\\TBWA (Ana María Olabuenaga)",
    "pais": "México",
    "ano": "1997 (?)",
    "tema": "Publicidad"
  },
  {
    "id": "16",
    "frase": "A cerveja que desce redondo [La cerveza que baja redondo]",
    "marca": "Skol",
    "agencia": "F/Nazca",
    "pais": "Brasil",
    "ano": "1997",
    "tema": "Publicidad"
  },
  {
    "id": "17",
    "frase": "Tem coisas que só a Philco faz pra você [Hay cosas que solo Philco hace por vos]",
    "marca": "Philco",
    "agencia": "F/Nazca",
    "pais": "Brasil",
    "ano": "s/d",
    "tema": "Publicidad"
  },
  {
    "id": "18",
    "frase": "A diferença é que o Estadão funciona [La diferencia es que el Estadão funciona]",
    "marca": "O Estado de S. Paulo",
    "agencia": "Talent",
    "pais": "Brasil",
    "ano": "s/d",
    "tema": "Publicidad"
  },
  {
    "id": "19",
    "frase": "Não tem comparação [No tiene comparación]",
    "marca": "Brastemp",
    "agencia": "Talent",
    "pais": "Brasil",
    "ano": "s/d",
    "tema": "Publicidad"
  },
  {
    "id": "20",
    "frase": "752 é da Vulcabrás [752 es de Vulcabrás]",
    "marca": "Vulcabrás",
    "agencia": "W/Brasil",
    "pais": "Brasil",
    "ano": "s/d",
    "tema": "Publicidad"
  },
  {
    "id": "21",
    "frase": "no creérsela, no ser hijo de puta, escuchar a los demás",
    "marca": "El Ojo – Charla",
    "agencia": "Equipo Wieden+Kennedy Latam",
    "pais": "Regional",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "22",
    "frase": "…me gustaría ver más anuncios de cerveza, de bancos, de salchichas, porque ese es nuestro trabajo real",
    "marca": "El Ojo – Charla",
    "agencia": "Toni Segarra, Alegre Roca",
    "pais": "España",
    "ano": "2023",
    "tema": "El Ojo"
  },
  {
    "id": "23",
    "frase": "La publicidad no ha cambiado sino envejecido, hagámosla nuevamente sexy",
    "marca": "El Ojo – Charla",
    "agencia": "Per Pedersen, Global Creative Chairman de Grey",
    "pais": "Global",
    "ano": "2017",
    "tema": "El Ojo"
  },
  {
    "id": "24",
    "frase": "…caemos en la rutina y, más de una vez, pensamos en divorciarnos",
    "marca": "El Ojo – Charla",
    "agencia": "Marina Stern, Mercado McCann",
    "pais": "Argentina",
    "ano": "2021",
    "tema": "El Ojo"
  },
  {
    "id": "25",
    "frase": "La cultura debe basarse en valores… y no simplemente algo cosmético como poner un futbolín o dar snacks",
    "marca": "El Ojo – Charla",
    "agencia": "Àlvar Suñol, Alma",
    "pais": "EE.UU.",
    "ano": "2021",
    "tema": "El Ojo"
  },
  {
    "id": "26",
    "frase": "la empatía es el mejor GPS",
    "marca": "El Ojo – Entrevista",
    "agencia": "Omar Carrión, Kellanova Latin America",
    "pais": "s/d",
    "ano": "2025 (?)",
    "tema": "El Ojo"
  },
  {
    "id": "27",
    "frase": "Yo creo que sacamos petróleo debajo de una piedra.",
    "marca": "El Ojo – Entrevista",
    "agencia": "Antonio Montero López, Contrapunto",
    "pais": "España",
    "ano": "2004",
    "tema": "El Ojo"
  },
  {
    "id": "28",
    "frase": "Las personas son más inteligentes de lo que las marcas piensan",
    "marca": "El Ojo – Charla",
    "agencia": "Lucía \"Pistola\" Mendoza, Twitter México & Latam",
    "pais": "México",
    "ano": "2021",
    "tema": "El Ojo"
  },
  {
    "id": "29",
    "frase": "Original es una trampa. Lo fresco es libertad",
    "marca": "El Ojo – Charla",
    "agencia": "Sergio Gordilho, Africa Creative",
    "pais": "Brasil",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "30",
    "frase": "El AI concluye. La creatividad humana desordena, se curiosa, explora.",
    "marca": "El Ojo – Charla",
    "agencia": "Damasia Merbilháa, TBWA\\Worldwide",
    "pais": "Argentina",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "31",
    "frase": "La única forma de innovar, es no pretenderlo.",
    "marca": "El Ojo – Charla",
    "agencia": "Álex de la Iglesia, director y guionista",
    "pais": "España",
    "ano": "2018",
    "tema": "El Ojo"
  },
  {
    "id": "32",
    "frase": "la valentía es contagiosa",
    "marca": "El Ojo – Charla",
    "agencia": "Equipo LePub Mexico City + Tecate",
    "pais": "México",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "33",
    "frase": "caring es la mejor habilidad",
    "marca": "El Ojo – Charla",
    "agencia": "Marco Venturelli, Leo y Publicis Groupe France",
    "pais": "Francia",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "34",
    "frase": "el algoritmo es nuestro caballo de Troya para hacer una revolución",
    "marca": "El Ojo – Charla",
    "agencia": "Alejandro Di Trolio, Cheil Worldwide",
    "pais": "España (?)",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "35",
    "frase": "la idea siempre está primero",
    "marca": "El Ojo – Charla",
    "agencia": "Rafa Quijano y Daro González, VML Argentina",
    "pais": "Argentina",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "36",
    "frase": "En Wieden no hay proceso, hay filosofía",
    "marca": "El Ojo – Charla",
    "agencia": "Rodrigo Jatene, Wieden+Kennedy Latam",
    "pais": "Brasil (?)",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "37",
    "frase": "ser creativo hoy no es solo hacer cosas lindas, es tomar posición",
    "marca": "El Ojo – Charla",
    "agencia": "Kike Renta, DDB Latina Puerto Rico",
    "pais": "Puerto Rico",
    "ano": "2025",
    "tema": "El Ojo"
  },
  {
    "id": "38",
    "frase": "la creatividad no es un lujo, es una ventaja competitiva",
    "marca": "El Ojo – Entrevista",
    "agencia": "Omar Carrión, Kellanova Latin America",
    "pais": "s/d",
    "ano": "2025 (?)",
    "tema": "El Ojo"
  },
  {
    "id": "39",
    "frase": "La creatividad es el antídoto",
    "marca": "El Ojo – Entrevista",
    "agencia": "Tomás Ostiglia, LOLA MullenLowe",
    "pais": "España",
    "ano": "2025 (?)",
    "tema": "El Ojo"
  },
  {
    "id": "40",
    "frase": "Lo más importante de las ideas es hacerlas",
    "marca": "El Ojo – Entrevista",
    "agencia": "Tomás Ostiglia, LOLA MullenLowe",
    "pais": "España",
    "ano": "2018",
    "tema": "El Ojo"
  },
  {
    "id": "41",
    "frase": "Cuando tienes data, puedes vender creatividad más arriesgada con menos riesgo",
    "marca": "El Ojo – Charla",
    "agencia": "Ciro Sarmiento, Dieste",
    "pais": "EE.UU.",
    "ano": "2017",
    "tema": "El Ojo"
  },
  {
    "id": "42",
    "frase": "La publicidad tiene que ser simple e imprevisible",
    "marca": "El Ojo – Entrevista",
    "agencia": "Marcello Serpa, Almap BBDO",
    "pais": "Brasil",
    "ano": "2022 (?)",
    "tema": "El Ojo"
  },
  {
    "id": "43",
    "frase": "podés ser un peor ellos o un mejor tú",
    "marca": "El Ojo – Charla",
    "agencia": "Fernando Machado, Burger King",
    "pais": "Brasil",
    "ano": "2018",
    "tema": "El Ojo"
  },
  {
    "id": "44",
    "frase": "el talento camina en todas direcciones",
    "marca": "El Ojo – Entrevista",
    "agencia": "Antonio Montero López, Contrapunto",
    "pais": "España",
    "ano": "2004",
    "tema": "El Ojo"
  },
  {
    "id": "45",
    "frase": "las ideas deben ser más grandes que avisos",
    "marca": "El Ojo – Entrevista",
    "agencia": "Pablo del Campo",
    "pais": "Argentina",
    "ano": "2024 (?)",
    "tema": "El Ojo"
  },
  {
    "id": "46",
    "frase": "Para crear algo que tenga éxito es fundamental sorprender, pero también es fundamental ser familiar.",
    "marca": "El Ojo – Charla",
    "agencia": "Rafael Pitanguy, VMLY&R Brasil",
    "pais": "Brasil",
    "ano": "2021",
    "tema": "El Ojo"
  },
  {
    "id": "47",
    "frase": "…la publicidad está un paso por detrás. Se mueve más lenta que la sociedad.",
    "marca": "El Ojo – Charla",
    "agencia": "Laura Visco, 72andSunny Amsterdam",
    "pais": "Países Bajos",
    "ano": "2018",
    "tema": "El Ojo"
  },
  {
    "id": "48",
    "frase": "Es la primera idea con la que realmente sentimos que había peligro a la hora de hacerla…",
    "marca": "El Ojo – Entrevista",
    "agencia": "Pancho Cassis, LOLA MullenLowe",
    "pais": "España",
    "ano": "2018",
    "tema": "El Ojo"
  },
  {
    "id": "49",
    "frase": "La IA acelera procesos, pero la magia humana conecta",
    "marca": "El Ojo – Entrevista",
    "agencia": "Omar Carrión, Kellanova Latin America",
    "pais": "s/d",
    "ano": "2025 (?)",
    "tema": "El Ojo"
  }
]
};

// Alias de compatibilidad
CONFIG.TEST_PHRASES = CONFIG.CATALOG_PHRASES;

// Compatible con Node / ES Modules / Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
