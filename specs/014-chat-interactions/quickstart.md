# Quickstart: 验证 014 Chat 交互增强

## 测试
```sh
cd apps/api && python -m pytest tests/ -q          # 含新 adapter 测试 + 无回归
cd apps/web && npm run typecheck                    # tsc 通过
```

## 手动 QA（浏览器）
```sh
cd apps/api && python -m uvicorn app.main:app --port 8000 &
cd apps/web && npm run dev   # http://localhost:3000
```
1. **概率图**：拖 temperature 高→柱子变平；top-p 调低→尾部 token 截断/压窄并有标记；frequency/presence>0→"已用"token 橙色且概率降。标注「模拟」。
2. **JSON 联动**：拖任一滑块→右侧/下方 JSON 请求体对应字段绿色闪烁 ~1.5s。
3. **逐条指标**：配置好 Provider/Key 发一条消息→回复下方显示「输出 N tok · TPS X · TTFT Yms」。
4. **CoT**：OpenRouter 下开「🧠 思维链」→发消息→思维链橙框单独显示、答案在下；关闭/非 OpenRouter→普通回答、无报错。
5. 浏览器 console 无未捕获错误；既有流式/取消/会话保存正常；设计系统一致。

## 验收对照
SC-001→QA1/2；SC-002→QA3；SC-003→QA4；SC-004（params 到后端）→pytest/Network 面板看请求体；SC-005→测试+回归。
