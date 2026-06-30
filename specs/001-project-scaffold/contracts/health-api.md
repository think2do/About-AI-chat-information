# API Contract: GET /health

**Version**: 0.1.0 | **Feature**: 001-project-scaffold

## Endpoint

```
GET /health
```

## Purpose

服务健康检查。用于：
- Docker Compose `healthcheck` 指令
- 部署后快速验证服务是否存活
- 负载均衡器存活探测

## Request

No headers required. No query parameters. No request body.

## Response

### 200 OK

```json
{
  "status": "ok",
  "service": "teaching-tool-api",
  "version": "0.1.0"
}
```

**Fields**:

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| status | string | yes | Fixed `"ok"` when healthy |
| service | string | yes | Fixed `"teaching-tool-api"` |
| version | string | yes | API version from app config |

### Error Responses

None defined at this stage. Health check should always return 200 while the server process is running.

## Caching

Responses MUST NOT be cached. Set `Cache-Control: no-store` header.

## Example (curl)

```sh
curl -s http://localhost:8000/health
# {"status":"ok","service":"teaching-tool-api","version":"0.1.0"}
```
