# Gastos MG

Aplicacion web tipo PWA para registrar gastos e ingresos, analizar balances mensuales y sincronizar datos en la nube con Supabase.

Demo: https://gastos-mg.vercel.app/

## Objetivo del proyecto

Construir una app de finanzas personales simple y rapida de usar desde iPhone y web, con foco en:

- carga de movimientos en segundos
- lectura mensual clara (ingresos, gastos, ahorro)
- seguimiento visual con graficos e insights

## Funcionalidades principales

- Carga rapida en 1 toque para categorias frecuentes.
- Alta manual de transacciones con categoria, fecha, detalle y tipo.
- Resumen mensual con ingresos, gastos y balance.
- Comparativas y tendencia de ultimos meses.
- Graficos interactivos (barras + donut) con tooltip en mouse/touch.
- Insight automatico de alerta de gasto (semaforo vs promedio de 3 meses cerrados).
- Calendario de movimientos por dia con edicion, duplicado y borrado.
- Exportacion a Excel de movimientos filtrados.
- Tema claro/oscuro.
- Soporte PWA (instalable en iPhone desde Safari).
- Sincronizacion en la nube con Supabase (auth + RLS).

## Stack tecnico

- Frontend: HTML, CSS, JavaScript vanilla
- Backend as a Service: Supabase (Auth + Postgres + REST)
- Deploy: Vercel
- Versionado: Git + GitHub

## Arquitectura del repo

```text
.
|- index.html
|- styles.css
|- app.js
|- historico.json
|- manifest.webmanifest
|- sw.js
|- icons/
|- docs/
|  |- images/
|- Iniciar Gastos MG.bat
|- vercel.json
|- README.md
```

## Ejecucion local

```powershell
cd "C:\Users\MARIANO\OneDrive\Scripts\Gastos MG"
py -m http.server 8091
```

Abrir en navegador:

`http://localhost:8091/index.html?app=gastos-mg-personal`

## Deploy

La app esta desplegada en Vercel y conectada a este repositorio de GitHub. Cada push a `main` publica una nueva version.

## Uso en iPhone (como app)

1. Abrir la URL publica en Safari.
2. Compartir.
3. Agregar a pantalla de inicio.

## Seguridad y datos

- Cada usuario ve solo sus movimientos (RLS en Supabase).
- La sesion puede guardarse de forma persistente en el dispositivo.
- La app funciona en modo local aunque no haya login.

## Proximas mejoras

- Capturas de pantalla en `docs/images`.
- Mas insights automaticos (gasto por categoria vs promedio).
- Mejoras de UX en filtros y comparativas.

## Autor

Proyecto personal de Mariano Giorgi.
