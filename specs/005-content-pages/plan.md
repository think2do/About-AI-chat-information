# Implementation Plan: 教学内容页面迁移

**Branch**: `005-content-pages` | **Spec**: [spec.md](./spec.md)

## Summary

将 Lab/Code/Jargon/Job 四个页面从静态 Demo 迁移到 Next.js React 组件。内容数据独立为 typed modules。

## Pages

| Page | Tabs/Sections | Source |
|------|--------------|--------|
| Lab | 训练对比, 函数调用, 白盒实验, 推理全过程, RAG | Lab.dc.html |
| Code | 模拟器, Agent循环, 工具系统, 命令目录, 隐藏功能 | Code.dc.html |
| Jargon | 6分类层级树, 43词条详情 | Jargon.dc.html |
| Job | 5分类筛选, 100题详情 | Job.dc.html, Job.data.js |
