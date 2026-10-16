# modsapk

Sitio estático para GitHub Pages.

## Archivos
- `index.html` – el sitio público.
- `apps.json` – página 1 de las apps. Si existen `apps-2.json`, `apps-3.json`… y `pages.json`, el sitio muestra un paginador.
- `admin.html` – panel para agregar apps (solo genera archivos, no publica nada).
- `.nojekyll` – evita que GitHub Pages procese los archivos con Jekyll.

## Publicar
1. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
2. Entra a `https://TU-USUARIO.github.io/TU-REPO/`.

## Agregar apps
1. Abre `admin.html` (`.../TU-REPO/admin.html`), importa todos los `apps*.json` y agrega tus apps.
2. Pulsa **Descargar por páginas (.zip)**, descomprime y sube todos los archivos al repositorio (cada uno debe pesar menos de 25 MB).
3. Espera 1–2 minutos a que GitHub Pages se actualice.
