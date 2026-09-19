# Visual Campus

Интерактивный цифровой двойник университета: поиск помещений, карта кампуса, доступные маршруты и live-статусы зон.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/visual-campus` — основной React/Vite интерфейс карты кампуса.
- `artifacts/api-server/src/routes/campus.ts` — demo API для корпусов, мест, статусов и маршрутов.
- `lib/api-spec/openapi.yaml` — источник API-контракта; после изменений запускать codegen.
- `artifacts/visual-campus/src/index.css` — визуальная тема и map texture.

## Architecture decisions

- Клиент использует сгенерированные React Query hooks из OpenAPI-контракта.
- Карта в MVP — интерактивная SVG spatial-сцена: она быстрее загружается и сохраняет слои, этажи и маршруты без тяжёлой 3D-модели.
- Demo campus data вынесена в API route, чтобы заменить её на PostGIS/real-time adapters без переписывания интерфейса.

## Product

Visual Campus помогает студентам, гостям и сотрудникам находить аудитории и инфраструктуру, строить доступные маршруты по кампусу и видеть загруженность ключевых зон.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- После изменения `lib/api-spec/openapi.yaml` необходимо запускать `pnpm --filter @workspace/api-spec run codegen`.
- Для проверки приложения используйте workflow `artifacts/visual-campus: web`; API доступен через `/api`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
