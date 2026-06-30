# Tasks: 错误处理与并发治理

- [ ] T001 Create rate limiter in apps/api/app/services/rate_limiter.py — sliding window, 10 req/min per session
- [ ] T002 Integrate rate limiter into ChatStreamService in apps/api/app/services/chat_stream_service.py
- [ ] T003 [P] Add rate limit error response to chat router in apps/api/app/routers/chat.py
- [ ] T004 Verify existing: timeout (120s), validation, error normalization, session isolation
- [ ] T005 Python syntax check
