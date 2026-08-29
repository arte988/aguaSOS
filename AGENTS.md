# aguaSOS — enfoque del producto

aguaSOS conecta a quien **reporta escasez de agua** con las **fuentes de suministro más cercanas**, y deja visible a quien tiene agua para compartir. El mensaje central tiene dos lados:

- **Comunidad:** reporta la escasez en tu casa, tu cuadra o tu comunidad y te mostramos los suministradores más cercanos dónde abastecerte, con su teléfono.
- **Suministradores:** si tienes pozo, un nacimiento, un tanque o venta de agua, regístrate como suministrador para quedar visible en el mapa cuando alguien reporta cerca. El objetivo es hacer más accesible el recurso hídrico.

**No es un sistema de seguimiento de casos.** No existe un área gubernamental que reciba, revise ni actualice el estado de los reportes. El campo `status` (`open` / `acknowledged` / `resolved`) en `convex/schema.ts` es un remanente sin actor que lo cambie: trátalo como dato estático, no como un flujo que el producto impulse. Si una tarea asume que alguien actualiza estados, es una premisa incorrecta.

Por este motivo se eliminaron la página `/seguimiento`, el componente `TrackReport`, y todo el sistema legacy basado en localStorage (`src/lib/reports.ts`, `ReportForm`, `AlertsList`, la página `/alertas`); no reintroducirlos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
