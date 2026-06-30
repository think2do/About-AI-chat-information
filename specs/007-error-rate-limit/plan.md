# Plan: 错误处理与并发治理

**Branch**: `007-error-rate-limit` | **Spec**: [spec.md](./spec.md)

## Summary

添加内存限流器（10 req/min per session）+ 并发隔离加固。超时/校验/错误归一已在 Spec 002 实现。

## Key Addition

`apps/api/app/services/rate_limiter.py` — 内存字典，per-session 滑动窗口计数
