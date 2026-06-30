# Plan: 生产部署与环境配置

**Branch**: `008-production-deployment` | **Spec**: [spec.md](./spec.md)

## Changes

- `docker-compose.yml` — add PostgreSQL service + persistent volume
- `.env.example` — add DATABASE_URL
- `apps/api/app/db/connection.py` — support DATABASE_URL env var
- `apps/api/app/routers/health.py` — add DB connectivity check
- `docs/deployment/` — acceptance checklist + deployment README
- Database migration script for SQLite→PostgreSQL
