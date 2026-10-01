# 🔮 Insightología — El Ojo de Iberoamérica (30 Años)

**Insightología** es un oráculo web interactivo conmemorativo por los 30 años de *El Ojo de Iberoamérica*. El consultante hace una pregunta sobre el futuro y el oráculo (un sabio con su tercer ojo y bola de cristal) le responde con una cita histórica real del archivo de la creatividad y la publicidad iberoamericana de las últimas tres décadas.

---

## 🚀 Arquitectura y Tecnologías

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (sin frameworks pesados).
- **Animaciones**: [GSAP 3.x](https://greensock.com/gsap/) para transiciones de estado, zoom focal en la bola de cristal y flotación.
- **Efectos Místicos**:
  - Filtro SVG de refracción líquida/humo (`feTurbulence` + `feDisplacementMap` animado).
  - Canvas de partículas estelares violetas y azules.
  - Plasma radial pulsante y destello sutil en el tercer ojo.
- **Reconocimiento de Voz**: Web Speech API (`es-AR`) para dictar preguntas.
- **Backend**: Vercel Serverless Function (`/api/oracle.js`) con caché en memoria (5 min).
- **Inteligencia Artificial**: Google Gemini API con prompt poético y lateral.
- **Sistema de Contingencia**: Fallback de 6 segundos por coincidencia temática o frase aleatoria (el oráculo nunca deja de responder).
- **Base de Datos**: Google Sheet publicado como CSV.

---

## 📁 Estructura del Proyecto

```text
insightologia/
├── assets/
│   ├── escena.png          # Imagen 4K de fondo (oráculo, mesa, base)
│   └── manos.png           # PNG transparente 4K con las manos
├── api/
│   └── oracle.js           # Función serverless de Vercel
├── index.html              # Estructura del escenario 16:9 y UI
├── style.css               # Variables CSS de calibración y responsive
├── app.js                  # Máquina de estados, GSAP y Web Speech API
├── config.js               # Parámetros globales y Sheet URL
├── dev-server.js           # Servidor local sin dependencias (Zero-Config)
├── package.json            # Scripts de ejecución
└── README.md               # Esta documentación
```

---

## 🛠️ Ejecución Local

1. Asegurate de tener [Node.js](https://nodejs.org/) instalado (v18 o superior).
2. Abrí una terminal en esta carpeta y ejecutá:
   ```bash
   npm start
   ```
   *(O de forma equivalente: `node dev-server.js`)*
3. Abrí tu navegador en:
   ```text
   http://localhost:3000
   ```

---

## ⚙️ Configuración

### 1. Cambiar la URL del Google Sheet

Podés cambiar la URL del Google Sheet de dos maneras:

- **En desarrollo local o frontend directo**: Abrí [`config.js`](file:///C:/Users/scast/.gemini/antigravity/scratch/insightologia/config.js) y modificá:
  ```javascript
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/TU_ID_DE_SHEET/export?format=csv'
  ```
- **En Vercel (Producción)**: Agregá una variable de entorno en el panel de Vercel llamada `SHEET_CSV_URL`. El backend la priorizará automáticamente sin necesidad de redeployar código.

> **¿Cómo publicar un Google Sheet como CSV?**
> 1. En Google Sheets, andá a **Archivo** > **Compartir** > **Publicar en la web**.
> 2. Elegí la hoja que querés publicar y seleccioná formato **Valores separados por comas (.csv)**.
> 3. Hacé clic en **Publicar** y copiá el enlace generado.
> 4. Asegurate de que el documento tenga las columnas esperadas: `ID` (o `#`), `Frase`, `Marca`, `Agencia`, `País`, `Año`, `Tema` (o `Tipo`) y opcionalmente `Activa` (marcada como "SI").

---

### 2. Configurar la API Key de Gemini en Vercel

1. Creá tu API key gratuita en [Google AI Studio](https://aistudio.google.com/).
2. En tu proyecto de **Vercel**:
   - Andá a **Project Settings** > **Environment Variables**.
   - Agregá:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: `AIzaSy...` (tu API key)
   - *(Opcional)* Podés definir `GEMINI_MODEL` con valor `gemini-2.0-flash` o `gemini-1.5-flash`.
3. Guardá los cambios y hacé un nuevo deploy.

> **Nota sobre seguridad**: La clave de Gemini se utiliza **exclusivamente** en el backend serverless (`/api/oracle.js`) y nunca se expone en el código del frontend. Si la clave no está configurada o la llamada tarda más de 6 segundos, el oráculo conmuta automáticamente al motor de fallback local con búsqueda temática.

---

### 3. Calibrar la Posición de la Bola de Cristal y el Tercer Ojo

Las capas visuales están calibradas matemáticamente mediante variables CSS relativas al contenedor `#stage` (16:9). Si en el futuro cambiás las imágenes o querés ajustar la alineación:

1. Abrí [`style.css`](file:///C:/Users/scast/.gemini/antigravity/scratch/insightologia/style.css) en la sección `:root`:
   ```css
   :root {
     /* Coordenadas del centro de la bola */
     --ball-x: 45.6%;
     --ball-y: 73.0%;
     --ball-size: 22.8%;

     /* Coordenadas del destello del tercer ojo */
     --eye-x: 48.9%;
     --eye-y: 20.8%;
     --eye-size: 8%;
   }
   ```
2. **Cómo calibrarlo visualmente en tiempo real**:
   - Abrí el sitio en Google Chrome o Edge y presioná `F12` (Herramientas de Desarrollador).
   - En la pestaña **Elements**, seleccioná `:root` o `html`.
   - Modificá `--ball-x`, `--ball-y` o `--ball-size` con las flechas del teclado hasta que el círculo de plasma coincida a la perfección con la bola de cristal.
   - Copiá los valores obtenidos a `style.css`.

---

## 🎪 Modo Kiosco (Para eventos o tótems físicos)

Para exhibir Insightología en un stand, pantalla táctil o tótem en vivo en *El Ojo de Iberoamérica*:

Agregá el parámetro `?kiosk=1` a la URL:
```text
http://localhost:3000/?kiosk=1
```
o en producción:
```text
https://tu-oraculo.vercel.app/?kiosk=1
```

**Comportamiento del Modo Kiosco**:
- Oculta el cursor del mouse (`cursor: none`).
- Deshabilita la selección de texto.
- Al primer toque o clic entra automáticamente en pantalla completa (`fullscreen`).
- Retorna automáticamente al estado `IDLE` luego de 20 segundos de mostrar la revelación.

---

## 🚢 Despliegue en Vercel

Insightología está listo para Vercel:

1. Instalá Vercel CLI (`npm i -g vercel`) o vinculá tu repositorio de GitHub desde [vercel.com](https://vercel.com).
2. Si usás el CLI, simplemente ejecutá:
   ```bash
   vercel
   ```
3. Configurá las variables de entorno (`GEMINI_API_KEY`) y ¡listo! El backend serverless `/api/oracle.js` y el frontend se levantarán sin necesidad de configuraciones extra.
