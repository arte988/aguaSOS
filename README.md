# aguaSOS

Aplicación para reportar emergencias de agua, ver alertas de la comunidad y dar seguimiento a un caso.

## Cómo empezar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Páginas

- `/` — inicio
- `/reportar` — formulario de emergencia
- `/alertas` — reportes recientes
- `/recursos` — qué hacer mientras llega ayuda
- `/seguimiento` — consulta por código SOS

Los reportes se guardan en el navegador (localStorage) en esta primera versión.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servir el build
- `npm run lint` — ESLint
