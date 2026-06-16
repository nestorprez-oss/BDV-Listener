# BDV Monitor

Sistema completo para capturar notificaciones de pago del Banco de Venezuela (BDVdigital) y validarlas desde una interfaz web.

## Arquitectura

```
Android (BDV Listener) ──POST /api/webhook──> Backend Node.js ──> PostgreSQL
                                                    ↑
React Frontend ──GET /api/search?monto=X&ref=Y────────┘
```

## Estructura

```
bdv-monitor/
├── backend/          # Node.js + Express API
│   ├── server.js     # Entry point
│   ├── db.js         # PostgreSQL connection pool
│   ├── routes/
│   │   ├── webhook.js    # POST /api/webhook (recibe Android)
│   │   └── search.js     # GET /api/search (consulta React)
│   ├── schema.sql    # SQL para crear la tabla
│   ├── .env          # Variables de entorno
│   └── package.json
│
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx       # Login + Búsqueda + Resultados
│   │   ├── api.js        # Cliente HTTP
│   │   └── App.css       # Estilos (dark theme)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Deploy — Backend en cPanel

### 1. Base de datos PostgreSQL

En cPanel → **PostgreSQL Databases**:
- Crear base de datos `bdv_db`
- Crear usuario y password
- Asignar usuario a la base de datos

Luego en cPanel → **phpPgAdmin** (o similar), ejecutar `backend/schema.sql`.

### 2. Node.js App

En cPanel → **Setup Node.js App**:
- **Application mode:** Production
- **Application root:** `backend`
- **Application URL:** `bdv` (subdominio `bdv.vzla.studio`)
- **Application startup file:** `server.js`
- **Node.js version:** 20.x o superior

Subir los archivos de `backend/` al servidor vía FTP o File Manager, luego instalar dependencias:

```bash
cd backend
npm install
```

### 3. Configurar .env

Editar `.env` en el servidor:

```
DB_HOST=localhost
DB_NAME=vzlasrzt_bdv
DB_PASSWORD=...
DB_PORT=5432
DB_USER=vzlasrzt_bdvuser
PORT=3000
API_TOKEN=tu-token-secreto-compartido-con-la-app-android
NODE_ENV=production
```

> NOTA: Los nombres de BD y usuario en cPanel llevan prefijo automático. En cPanel → PostgreSQL Databases copia los nombres exactos que muestra.

### 4. Reiniciar la app desde cPanel

---

## Deploy — Frontend en cPanel

### 1. Build local

```bash
cd frontend
npm install
npm run build
```

Esto genera la carpeta `dist/`.

### 2. Configurar proxy para producción

Antes de hacer build, editar `vite.config.js` y quitar el proxy de desarrollo. En producción, el frontend llama al backend en `https://bdv.vzla.studio/api/...`. Crear archivo `.env.production`:

```
VITE_API_URL=https://bdv.vzla.studio
```

Y actualizar `api.js` para usar `VITE_API_URL`.

### 3. Subir archivos

Subir el contenido de `dist/` a `public_html/` del dominio principal vía FTP o File Manager.

---

## Configurar App Android

En la app Android (BDV Listener):
- **URL del backend:** `https://bdv.vzla.studio/api/webhook`
- **Token:** El mismo `API_TOKEN` configurado en el `.env` del backend
- **Package:** `com.bancodevenezuela.bdvdigital`

---

## Endpoints

### POST /api/webhook (Android → Backend)

Header: `Authorization: Bearer <API_TOKEN>`

```json
{
  "monto": "1.025,00",
  "referencia": "312438232670",
  "timestamp": 1718152800000,
  "package_name": "com.bancodevenezuela.bdvdigital",
  "raw_text": "Recibiste un PagomovilBDV..."
}
```

### GET /api/search (Frontend → Backend)

Header: `Authorization: Basic <base64(email:password)>`

```
/api/search?monto=1.025,00&ref=312438232670
```

---

## Desarrollo local

### Backend

```bash
cd backend
npm install
# Editar .env con DATABASE_URL local
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El proxy de Vite redirige `/api/*` al backend en `localhost:3000`.
