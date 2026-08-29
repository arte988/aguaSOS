# Contra Corriente (aguaSOS)

Aplicación Next.js 16 + Convex para reportes hídricos.

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

## Scripts

- `npm run dev` — Next.js
- `npm run convex:dev` — sync de funciones Convex (`npx convex dev`)
- `npm run build` — build de producción
- `npm run start` — servir el build
- `npm run lint` — ESLint

Usa `npx convex dev` en desarrollo. `npx convex deploy` solo para producción.
