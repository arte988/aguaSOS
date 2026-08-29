# aguaSOS

Aplicación para reportar emergencias de agua, ver alertas de la comunidad y dar seguimiento a un caso. Frontend Next.js 16, backend Convex y mapa MapLibre.

## Cómo empezar

1. Instala dependencias: `npm install`
2. Vincula Convex (una vez, con tu cuenta):

```bash
npx convex dev
```

Inicia sesión, crea o elige el proyecto. El comando escribe `.env.local` con `NEXT_PUBLIC_CONVEX_URL` y deja el watcher de funciones corriendo.

3. En otra terminal:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Páginas

- `/` — inicio
- `/mapa` — mapa MapLibre (OpenFreeMap)
- `/reportar` — formulario de emergencia
- `/alertas` — reportes recientes
- `/recursos` — qué hacer mientras llega ayuda
- `/seguimiento` — consulta por código SOS

Los reportes de emergencia se guardan en el navegador (localStorage) en esta primera versión.

## Scripts

- `npm run dev` — Next.js
- `npm run convex:dev` — sync de funciones Convex (`npx convex dev`)
- `npm run build` — build de producción
- `npm run start` — servir el build
- `npm run lint` — ESLint

Usa `npx convex dev` en desarrollo. `npx convex deploy` solo para producción.
