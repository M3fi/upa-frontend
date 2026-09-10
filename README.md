# upa-frontend

Dashboard web para profesores de la plataforma educativa gamificada Upa!.

## Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + TypeScript
- **Estilos:** Tailwind CSS
- **Gráficas:** Recharts
- **Íconos:** Lucide React

## Desarrollo

```bash
npm install
npm run dev
```

El dashboard corre en `http://localhost:3001` y proxea las llamadas a `/api/*` al backend en `http://localhost:3000/api/v1/*`.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Inicio |
| `/games` | Lista de juegos |
| `/classrooms` | Gestión de salones |
| `/metrics` | Analíticas |
| `/builder` | Constructor de juegos |
| `/builder/sequence` | Constructor de secuencias |
| `/play/[gameId]` | Player de juego embebido |

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t upa-frontend .
docker run -p 3001:3000 upa-frontend
```

## API

Se conecta al backend de Upa! (`upa-backend`). Ver el contrato en `upa-contracts`.
