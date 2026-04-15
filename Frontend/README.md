# Otrix Frontend (Next.js)

Frontend migrado de Angular a **Next.js (App Router + TypeScript)**.

## Requisitos

- Node.js 20+

## Variables de entorno

Puedes configurar el backend con:

```bash
NEXT_PUBLIC_API_URL=https://otrix-dev.up.railway.app
```

Si no se define, se usa ese mismo endpoint por defecto.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://127.0.0.1:5500`.

## Build de producción

```bash
npm run build
npm run start
```

## Rutas

- `/` Home
- `/login`
- `/signin`
- `/stats`
- `/videogame`
