# Carta Privada con Acceso Controlado

Aplicación web minimalista construida con **Next.js (App Router)**, **React**, **TypeScript** y **Tailwind CSS v4**. Muestra una pantalla de acceso donde la persona escribe su nombre o apodo; si coincide con la lista configurada en el servidor, se desbloquea una carta personal acompañada de un fondo animado de brasas y música ambiental continua en bucle.

Diseñada con enfoque en privacidad: ni la lista de nombres válidos ni el contenido de la carta se envían al navegador antes de superar la validación en el servidor.

---

## Características principales

- **Validación estricta en el servidor (`Server Actions`):** la verificación ocurre íntegramente en `src/app/actions/unlock.ts`. Ningún nombre autorizado ni fragmento de la carta forma parte del bundle del cliente.
- **Normalización tolerante de entrada:** ignora mayúsculas, minúsculas, tildes/diacríticos y espacios repetidos (`src/lib/normalize.ts`), además de soportar múltiples alias por persona separados por comas o saltos de línea.
- **Segunda hoja exclusiva (opcional):** permite definir alias especiales (`SPECIAL_NAMES`) que desbloquean una segunda página privada (`SPECIAL_LETTER_CONTENT`) con navegación (*Siguiente hoja* / *Hoja anterior*) y transición animada. Para el resto de los destinatarios, esta segunda hoja no existe ni se transmite.
- **Sesión persistente sin configuración extra:** guarda una cookie `httpOnly` (`letter_session`) firmada con HMAC-SHA256 hasta que se cierre el navegador, derivando la clave de firma en el servidor a partir de las propias variables privadas.
- **Audio de fondo continuo:** reproduce en bucle un archivo local (`/audio/background.mp3`) al desbloquear la carta, sin controles visibles, con reanudación automática ante pausas externas y una pantalla de toque (*“Toca para continuar”*) cuando el navegador bloquea la reproducción automática (por ejemplo, al recargar con la sesión iniciada).
- **Atmósfera visual:** paleta oscura con acentos cian y ámbar/carmesí, tipografía `Space Grotesk` y campo de brasas flotantes deterministas (`EmberField`) que respeta `prefers-reduced-motion`.

---

## Stack tecnológico

- **Framework:** Next.js 16 (App Router + Server Actions)
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Tipografía:** `Space Grotesk` mediante `next/font/google`

---

## Requisitos previos

- **Node.js** 20 o superior
- **npm** (incluido con Node.js)

---

## Instalación y uso local

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <url-de-tu-repositorio>
cd letter
npm install
```

### 2. Configurar las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto.

> **Importante:** no uses el prefijo `NEXT_PUBLIC_` en ninguna de estas variables; todas deben permanecer exclusivamente en el servidor.

```env
# Lista de nombres o apodos válidos, separados por comas o saltos de línea.
# Se ignoran mayúsculas, acentos y espacios extra.
ALLOWED_NAMES="
nombre1, apodo1,
nombre2, apodo2
"

# Contenido de la carta principal (para todas las personas autorizadas).
# Separa párrafos con una línea en blanco (o usa "\n\n").
# Los bloques que inicien con "> " se muestran como cita destacada.
LETTER_CONTENT="Primer párrafo de ejemplo.

> Una frase destacada en formato de cita.

Segundo párrafo de ejemplo."

# (Opcional) Alias exclusivos de la persona que tendrá acceso a una segunda hoja.
# No es necesario repetirlos en ALLOWED_NAMES.
SPECIAL_NAMES="apodo_especial1, apodo_especial2"

# (Opcional) Contenido privado de la segunda hoja (solo se envía a SPECIAL_NAMES).
SPECIAL_LETTER_CONTENT="Primer párrafo de la segunda hoja.

Segundo párrafo de la segunda hoja."
```

#### Notas sobre el formato del contenido

- **Párrafos:** sepáralos con una línea en blanco dentro de comillas dobles, o usando `\n\n` en una sola línea (útil en paneles de hosting que no aceptan valores multilínea).
- **Citas destacadas:** cualquier párrafo que comience con `> ` se renderiza con estilo de cita (*Registro de resonancia*).
- **Fecha de la cabecera:** puedes personalizar la constante `LETTER_DATE` en `src/components/LetterView.tsx`.

### 3. Agregar la música de fondo (opcional)

Coloca tu pista de audio en:

```text
public/audio/background.mp3
```

- Se recomienda un fragmento de 2 a 5 minutos que haga buen bucle en formato MP3 (128–160 kbps).
- Si deseas cambiar la ruta o el volumen (por defecto `0.4`, es decir, 40 %), edita `src/lib/audio.ts`.
- Si no hay archivo de audio, la aplicación funciona con normalidad y simplemente no reproduce sonido.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la compilación optimizada de producción |
| `npm run start` | Inicia la aplicación ya compilada |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

---

## Estructura del proyecto

```text
├── public/
│   └── audio/
│       └── README.md               # Instrucciones para el archivo background.mp3
└── src/
    ├── app/
    │   ├── actions/
    │   │   └── unlock.ts           # Validación en servidor y cookie de sesión
    │   ├── globals.css             # Tokens de tema Tailwind v4 y animaciones
    │   ├── layout.tsx              # Fuente Space Grotesk y layout raíz
    │   └── page.tsx                # Coordinador de vistas y <audio> persistente
    ├── components/
    │   ├── AccessForm.tsx          # Pantalla de identificación
    │   ├── AudioGate.tsx           # Capa "Toca para continuar" ante bloqueo de autoplay
    │   ├── EmberField.tsx          # Partículas ambientales deterministas tipo fogata
    │   ├── LetterView.tsx          # Vista de la carta y paginación exclusiva
    │   └── icons.tsx               # Iconos SVG en línea
    ├── hooks/
    │   └── useBackgroundAudio.ts   # Control de reproducción, bucle y reanudación
    └── lib/
        ├── audio.ts                # Ruta y volumen del audio de fondo
        └── normalize.ts            # Limpieza de texto para comparar nombres
```

---

## Despliegue (por ejemplo, en Vercel)

1. Sube el repositorio a GitHub (`.env.local` está ignorado en `.gitignore`, por lo que tus datos privados no se publicarán).
2. Importa el proyecto en tu plataforma de hosting (como Vercel).
3. Configura en el panel de variables de entorno del proveedor las mismas variables (`ALLOWED_NAMES`, `LETTER_CONTENT` y, si las usas, `SPECIAL_NAMES` y `SPECIAL_LETTER_CONTENT`).
4. Despliega la aplicación.

> **Nota sobre audio en navegadores móviles:** en dispositivos iOS, el volumen del `<audio>` lo controla el usuario desde los botones físicos del dispositivo, y el navegador siempre requerirá un toque inicial tras recargar una sesión guardada.
