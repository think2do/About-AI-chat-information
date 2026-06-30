# Plan: Chat 管道可视化与参数面板

**Branch**: `006-pipeline-visualization` | **Spec**: [spec.md](./spec.md)

## Summary

实现 7 阶段管道可视化、5 参数滑块、性能指标面板、自回归日志、Token 概率分布。集成到 Chat 页面。

## Components

- `PipelineVisualization.tsx` — 7 阶段动画
- `ModelParamsPanel.tsx` — 5 参数滑块 + Token 概率分布图
- `PerformanceMetrics.tsx` — TTFT/TPS/Token/Cost
- `DecodeLog.tsx` — 自回归解码日志

## Constitution: ✅ All 5 passed
