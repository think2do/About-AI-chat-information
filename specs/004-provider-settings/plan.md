# Implementation Plan: Provider 设置与 API Key 安全

**Branch**: `004-provider-settings` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

## Summary

实现全局设置面板——Provider 选择、API Key/Base URL/Model 配置、localStorage 持久化、隐私提示、旧格式迁移。纯前端功能，不涉及后端变更。

## Technical Context

**Changes**: 仅前端 `apps/web/src/components/SettingsModal.tsx` + NavSidebar 集成 + api.ts 配置读取优化

**Storage**: localStorage `llm_viz_settings` key

## Constitution Check

| Principle | Status |
|-----------|--------|
| I. 关注点分离 | ✅ 设置仅前端管理 |
| II. Spec 合规 | ✅ 8 FRs 全覆盖 |
| III. 第一性原理 | ✅ 零新依赖 |
| IV. 测试 | ✅ typecheck + manual |
| V. 可回溯 | ✅ 文档留档 |
