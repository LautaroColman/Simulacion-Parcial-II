# Simulación Parcial II

Aplicación web interactiva desarrollada con Phaser y Vite. Presenta un emisor de gotas en la mitad izquierda y una simulación del Juego de la Vida en la mitad derecha.

## Requisitos

- Node.js 20.19.0 o superior dentro de la rama 20.x, o Node.js 22.12.0 o superior.
- npm.

## Instalación y ejecución local

Desde la carpeta raíz del proyecto:

```bash
npm ci
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

Para previsualizar la compilación:

```bash
npm run preview
```

## Controles

- **Mouse:** arrastrar para mover el canal de la mitad izquierda.
- **H:** mostrar u ocultar las instrucciones.
- **R:** reiniciar la simulación.

Se gana al alcanzar 50 células vivas en el autómata. La partida termina si el temporizador llega a cero.

## Publicación en GitHub Pages

El proyecto está configurado para publicarse como sitio de proyecto en:

`https://<TU-USUARIO>.github.io/Simulacion-Parcial-II/`

La ruta base se configura en `vite.config.js`. Si cambiás el nombre del repositorio, actualizá también esa propiedad.

La publicación está automatizada mediante GitHub Actions en `.github/workflows/deploy.yml`. En GitHub, abrí **Settings → Pages** y elegí **GitHub Actions** como fuente de publicación. Cada `push` a `main` o `master` ejecuta la instalación con `npm ci`, compila con `npm run build` y publica la carpeta `dist/`. También se puede iniciar el flujo manualmente desde la pestaña **Actions**.

No se incluye `node_modules`, `.git` ni `dist`; GitHub Actions instala las dependencias desde `package-lock.json` y genera el directorio de publicación.
