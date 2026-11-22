# Simulación II - Emisor de líquido y Juego de la Vida

Proyecto web realizado con **Phaser 4** y **Vite**. La pantalla está dividida en dos áreas: a la izquierda se emiten gotas que interactúan con un canal móvil y, a la derecha, cada gota que llega al borde inferior genera un patrón en el Juego de la Vida.

## Requisitos

- Node.js 20.19.0 o superior dentro de la rama 20.x, o 22.12.0 o superior.
- npm (incluido con Node.js).

## Instalación y ejecución

Desde la carpeta raíz del proyecto, ejecutar:

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir el juego en el navegador.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Genera la versión de producción en dist/
npm run preview  # Previsualiza la versión compilada
```

## Controles

- **Mouse:** arrastrar para mover el canal de la mitad izquierda.
- **H:** mostrar u ocultar las instrucciones.
- **R:** reiniciar la simulación.

Se gana al alcanzar 50 células vivas en el autómata. La partida termina si el temporizador llega a cero.

## Estructura principal

- `src/main.js`: configuración de Phaser, temporizador, victoria, derrota y reinicio.
- `src/scenes/liquid.js`: emisor de gotas, canal móvil y detección de impactos.
- `src/scenes/sperm.js`: grilla y reglas del Juego de la Vida.
- `public/assets/`: imágenes utilizadas por el juego.

Las dependencias se declaran en `package.json` y `package-lock.json`. La carpeta `node_modules` no se incluye; se genera localmente al ejecutar `npm install`.

## Publicación en GitHub Pages

El proyecto está configurado para publicarse como sitio de proyecto en:
`https://<TU-USUARIO>.github.io/Simulacion-II-Parcial/`. La opción `base` de
`vite.config.js` y las rutas de imágenes usan esa subruta. Si cambiás el nombre
del repositorio, actualizá también `base` en `vite.config.js`.

La publicación está automatizada mediante GitHub Actions en
`.github/workflows/deploy.yml`. En GitHub, abrí **Settings → Pages** y elegí
**GitHub Actions** como fuente de publicación. Cada `push` a la rama `main`
instala las dependencias con `npm ci`, ejecuta `npm run build` y publica `dist/`.
También podés iniciar el flujo manualmente desde la pestaña **Actions**.

No se incluye `node_modules`; GitHub Actions instala las dependencias a partir
de `package-lock.json`.
