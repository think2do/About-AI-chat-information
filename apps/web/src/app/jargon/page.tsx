"use client";

import { useState } from "react";

const CATEGORIES: Record<string, { name: string; terms: { emoji: string; cn: string; en: string; plain: string; tech: string }[] }> = {
  "模型架构": {
    name: "模型架构",
    terms: [
      { emoji: "🧱", cn: "Transformer", en: "Transformer", plain: "一种完全基于注意力机制的神经网络架构，是当前几乎所有大语言模型的基础。你可以把它理解为 LLM 的骨骼结构。", tech: "基于自注意力机制（Self-Attention）的 Seq2Seq 架构，通过多头注意力和位置编码替代了 RNN 的循环结构。" },
      { emoji: "👀", cn: "注意力机制", en: "Attention", plain: "模型在生成每个词时「关注」输入中不同位置的能力，类似于你阅读一段文字时眼睛聚焦在关键词上。", tech: "通过 Query、Key、Value 三个矩阵计算注意力权重：Attention(Q,K,V) = softmax(QKᵀ/√d_k)V。" },
      { emoji: "🔢", cn: "嵌入向量", en: "Embedding", plain: "将文字、图片等非数字信息转化为一串数字（向量），这样计算机才能进行计算。相似含义的词会有相似的向量。", tech: "将高维稀疏的 one-hot 向量映射到低维稠密的连续向量空间，捕捉语义和语法关系。" },
      { emoji: "📏", cn: "位置编码", en: "Positional Encoding", plain: "告诉模型每个词在句子中的位置，因为 Transformer 不像人一样天然知道词的先后顺序。", tech: "通过正弦/余弦函数或可学习参数，为每个 token 添加位置信息，使 Self-Attention 能感知序列顺序。" },
      { emoji: "🔮", cn: "前馈网络", en: "Feed-Forward Network", plain: "Transformer 每个层中的「思考」部分，对注意力层提取的信息进行非线性变换和加工。", tech: "两层全连接网络 + 激活函数（通常为 GELU）：FFN(x) = W₂·GELU(W₁·x + b₁) + b₂。" },
      { emoji: "🔗", cn: "残差连接", en: "Residual Connection", plain: "把输入直接跳到输出端加上去，防止深层网络训练时信息丢失，就像高速公路的「快车道」。", tech: "输出 = LayerNorm(x + Sublayer(x))，缓解深层网络的梯度消失问题，使数百层模型可训练。" },
    ],
  },
  "训练方法": {
    name: "训练方法",
    terms: [
      { emoji: "📚", cn: "预训练", en: "Pre-training", plain: "在超大规模文本数据上训练模型学习语言的通用规律，相当于 AI 的通识教育阶段。", tech: "通过自监督学习（如因果语言建模 CLM 或掩码语言建模 MLM）在海量语料上优化模型参数。" },
      { emoji: "🎯", cn: "监督微调", en: "SFT", plain: "用高质量的人工标注数据（问答对、指令-回复对）对预训练模型进行精调，让模型学会「听懂人话」。", tech: "Supervised Fine-Tuning：在指令-回复数据集上用交叉熵损失继续训练预训练模型，进行参数更新。" },
      { emoji: "👍", cn: "RLHF", en: "RLHF", plain: "用人类的偏好反馈来训练模型生成更符合人类期望的回答，相当于让「用户满意度」直接参与训练。", tech: "Reinforcement Learning from Human Feedback：先训练奖励模型（Reward Model），再用 PPO 算法优化策略。" },
      { emoji: "🎓", cn: "知识蒸馏", en: "Knowledge Distillation", plain: "用大模型（老师）教小模型（学生），让小模型学会大模型的能力但体积更小、速度更快。", tech: "Teacher-Student 范式：用教师模型的输出概率分布（软标签）作为学生模型的训练目标，实现能力迁移。" },
      { emoji: "🔄", cn: "迁移学习", en: "Transfer Learning", plain: "把在一个任务上学到的知识用在另一个相关任务上，不需要从头训练，省时省算力。", tech: "利用源域预训练模型的参数作为目标域的初始化，通过微调适应下游任务，减少训练数据需求。" },
      { emoji: "🎲", cn: "Dropout", en: "Dropout", plain: "训练时随机「关掉」一部分神经元，让模型不依赖特定神经元，相当于让模型学会「独立思考」。", tech: "训练时以概率 p 随机置零神经元输出，推理时乘以 (1-p)。是一种正则化技术，防止过拟合。" },
      { emoji: "📉", cn: "损失函数", en: "Loss Function", plain: "衡量模型预测和正确答案之间差距的「成绩单」，训练的目标就是让这个分数尽可能低。", tech: "常见：交叉熵损失（分类任务）、均方误差（回归任务）。LLM 通常用负对数似然损失（NLL）。" },
    ],
  },
  "推理技术": {
    name: "推理技术",
    terms: [
      { emoji: "🔍", cn: "RAG", en: "RAG", plain: "检索增强生成：在生成回答前先去知识库中查找相关资料，把找到的内容和问题一起给模型，提高回答准确性。", tech: "Retrieval-Augmented Generation：检索器从知识库检索 Top-K 相关文档，拼接到 prompt 中由 LLM 生成。" },
      { emoji: "💭", cn: "思维链", en: "Chain of Thought", plain: "让模型像人类一样「一步一步想」，把推理过程写出来再给答案，准确率大幅提升。", tech: "CoT Prompting：在 prompt 中加入中间推理步骤（如 'Let's think step by step'），引导模型显式生成推理路径。" },
      { emoji: "🌳", cn: "思维树", en: "Tree of Thoughts", plain: "让模型同时探索多条思考路径，像下棋一样预判几步，选择最优的推理方向。", tech: "ToT：构建搜索树，每个节点代表一个思考状态，通过 BFS/DFS + 自评估选择最优路径。" },
      { emoji: "🛠", cn: "函数调用", en: "Function Calling", plain: "模型可以直接调用外部工具和 API，比如查天气、发邮件、操作数据库，而不只是生成文字。", tech: "模型输出结构化 JSON 映射到预定义函数签名，程序执行后将结果返回给模型继续生成。" },
      { emoji: "🗳", cn: "多数投票", en: "Majority Voting", plain: "让同一个问题跑多次，取出现最多的答案。像班级投票选班长一样，多数票决定最终结果。", tech: "Self-Consistency：采样多条推理路径，对最终答案进行多数表决，提高推理可靠性。" },
      { emoji: "⚙", cn: "束搜索", en: "Beam Search", plain: "生成时保留最优的几个候选序列，而不是只选当前最好的一个，类似「下棋多想几步」。", tech: "Beam Width K 的广度优先搜索，每个时间步保留概率最高的 K 个候选序列，平衡全局最优与计算开销。" },
    ],
  },
  "性能评估": {
    name: "性能评估",
    terms: [
      { emoji: "😵", cn: "幻觉", en: "Hallucination", plain: "模型自信地说出不存在的事实，就像一个人梦游时坚定地说自己看到了外星人。", tech: "模型生成了与输入事实不一致、无法被知识源验证的内容。根本原因是训练数据的统计偏差和推理不确定性。" },
      { emoji: "📊", cn: "基准测试", en: "Benchmark", plain: "用标准化的考试题来评估和比较不同模型的能力，类似于模型的「期末考试」。", tech: "常用 LLM benchmark：MMLU（多任务语言理解）、HumanEval（代码生成）、GSM8K（数学推理）、HellaSwag（常识推理）。" },
      { emoji: "🔤", cn: "分词器", en: "Tokenizer", plain: "把文本切成一个个小块（token），是模型理解文字的第一步。就像把「苹果很好吃」切成「苹果/很/好吃」。", tech: "将文本分解为模型可处理的 token 序列。主流算法：BPE（GPT系）、WordPiece（BERT）、SentencePiece（多语言）。" },
      { emoji: "⏱", cn: "首字延迟", en: "TTFT", plain: "Time To First Token — 从发送请求到看到第一个字的等待时间，衡量模型的「反应速度」。", tech: "TTFT = 首个 token 生成时间 - 请求发送时间。受模型大小、prompt 长度、网络延迟影响。" },
      { emoji: "💰", cn: "Token 定价", en: "Token Pricing", plain: "按使用的 token 数量收费。输入和输出通常不同价，像打电话一样「主叫和被叫」分别计费。", tech: "通常：输入 token 价格 < 输出 token 价格。GPT-4o: $2.50/1M in + $10/1M out。长上下文模型输入更贵。" },
      { emoji: "📏", cn: "困惑度", en: "Perplexity", plain: "模型在预测下一个词时有多「困惑」——困惑度越低说明模型对语言理解越好。", tech: "PPL = exp(cross-entropy loss)。衡量语言模型对测试集的预测能力，PPL 越低表示模型对文本序列越确定。" },
    ],
  },
  "部署优化": {
    name: "部署优化",
    terms: [
      { emoji: "📦", cn: "量化", en: "Quantization", plain: "用低精度（如 4-bit）存储模型参数，大幅减少显存占用和推理成本，但精度损失很小。", tech: "将 FP32/FP16 权重映射到 INT8/INT4：W_q = round(W / scale + zero_point)。GPTQ、AWQ、GGUF 是主流方案。" },
      { emoji: "⚡", cn: "KV Cache", en: "KV Cache", plain: "把之前生成过的 Key 和 Value 缓存起来，避免重复计算，是流式生成的速度关键。", tech: "推理时缓存每个已生成 token 的 K/V 投影，避免对历史 token 重复计算 Self-Attention。" },
      { emoji: "🖥", cn: "GPU 显存", en: "VRAM", plain: "显卡的高速存储空间，模型参数和计算中间结果就放在这里。显存不够，模型就跑不起来。", tech: "推理所需 VRAM ≈ 参数量 × 量化精度字节数 + KV Cache + 激活值。如 7B FP16 模型 ≈ 14GB。" },
      { emoji: "🚀", cn: "推测解码", en: "Speculative Decoding", plain: "用小模型快速「猜」几个字，大模型一次性验证，比一个一个生成快好几倍。", tech: "草稿模型生成 K 个候选 token，目标模型并行验证并接受/拒绝。理想加速比接近 K 倍。" },
      { emoji: "🔄", cn: "批处理推理", en: "Batch Inference", plain: "同时处理多个请求，充分利用 GPU 并行计算能力，提高服务吞吐量。", tech: "将多个请求 padding 到相同长度后拼接为 batch，利用 GPU 矩阵运算并行处理，吞吐量提升 Linear 倍。" },
    ],
  },
  "安全对齐": {
    name: "安全对齐",
    terms: [
      { emoji: "🛡", cn: "对齐", en: "Alignment", plain: "确保模型的价值观和行为与人类期望一致——不要胡说八道、不要教人造炸弹、不要歧视。", tech: "Alignment 三层次：Helpful（有帮助）、Harmless（无害）、Honest（诚实）。HHH 原则 + Constitutional AI。" },
      { emoji: "💉", cn: "提示注入", en: "Prompt Injection", plain: "有人故意在输入中插入恶意指令试图劫持模型行为，类似于给 AI 下「迷魂药」。", tech: "攻击者通过精心构造的 prompt 覆盖系统指令。防御：指令分隔符、输入过滤、权限最小化、输出审核。" },
      { emoji: "🛑", cn: "护栏", en: "Guardrails", plain: "部署在模型前后的安全检查机制，确保输入输出符合安全规范，拦截有害内容。", tech: "NeMo Guardrails、Llama Guard 等框架提供输入/输出过滤、话题边界控制、PII 脱敏等安全层。" },
      { emoji: "🌡", cn: "Temperature", en: "Temperature", plain: "控制模型输出的「创造力」程度。温度高 → 更天马行空；温度低 → 更保守确定。", tech: "T 控制 logits 的概率分布锐度：p_i = exp(z_i/T) / Σ exp(z_j/T)。T→0 时接近确定性，T→∞ 时趋于均匀分布。" },
      { emoji: "🎯", cn: "Top-P 采样", en: "Top-P Sampling", plain: "只从概率累计达到 P 的那些候选词中随机选，过滤掉不太可能的选项，避免生成跑偏。", tech: "核采样（Nucleus Sampling）：选择最小候选集使累计概率 ≥ P（通常 P=0.9），平衡多样性与质量。" },
      { emoji: "🔁", cn: "重复惩罚", en: "Repetition Penalty", plain: "对已经出现过的词施加惩罚，避免 AI 像复读机一样不断重复同样的话。", tech: "对已生成 token 的 logits 施加惩罚因子 θ（通常 1.0-1.3）：logit_i /= θ if token_i already exists。" },
    ],
  },
};

export default function JargonPage() {
  const [expandedCat, setExpandedCat] = useState<string | null>("模型架构");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const allCats = Object.entries(CATEGORIES);

  const findTerm = (cn: string) => {
    for (const [, cat] of allCats) {
      const t = cat.terms.find((t) => t.cn === cn);
      if (t) return t;
    }
    return null;
  };

  const term = selectedTerm ? findTerm(selectedTerm) : null;

  return (
    <div style={{ display: "flex", height: "100%", color: "#c9d1d9", fontFamily: "Inter, sans-serif" }}>
      <aside style={{ width: 280, minWidth: 280, height: "100vh", background: "#0a0e14", borderRight: "1px solid #21262d", overflow: "auto", padding: "16px 0" }}>
        <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #21262d", marginBottom: 8 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>📖 黑话词典</h2>
          <p style={{ fontSize: 11, color: "#484f58", marginTop: 4 }}>43 个术语 · 6 大分类</p>
        </div>
        {allCats.map(([key, cat]) => (
          <div key={key}>
            <button onClick={() => setExpandedCat(expandedCat === key ? null : key)} style={{
              width: "100%", padding: "8px 16px", background: "transparent", border: "none",
              color: expandedCat === key ? "#00ffa0" : "#8b949e", fontSize: 12,
              fontFamily: "JetBrains Mono, monospace", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 10, transition: "transform 0.2s", transform: expandedCat === key ? "rotate(90deg)" : "none" }}>▶</span>
              {cat.name} ({cat.terms.length})
            </button>
            {expandedCat === key && cat.terms.map((t) => (
              <button key={t.cn} onClick={() => setSelectedTerm(t.cn)} style={{
                width: "100%", padding: "6px 16px 6px 36px", background: selectedTerm === t.cn ? "rgba(0,255,160,0.06)" : "transparent",
                border: "none", borderLeft: selectedTerm === t.cn ? "3px solid #00ffa0" : "3px solid transparent",
                color: selectedTerm === t.cn ? "#e6edf3" : "#8b949e", fontSize: 12, cursor: "pointer", textAlign: "left",
              }}>{t.emoji} {t.cn}</button>
            ))}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        {term ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{term.emoji}</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>{term.cn}</h1>
            <p style={{ fontSize: 12, color: "#484f58", fontFamily: "JetBrains Mono, monospace", marginBottom: 24 }}>{term.en}</p>
            <div style={{ background: "rgba(0,255,160,0.04)", border: "1px solid rgba(0,255,160,0.1)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, color: "#00ffa0", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>通俗解释</h3>
              <p style={{ fontSize: 13, color: "#c9d1d9", lineHeight: 1.7 }}>{term.plain}</p>
            </div>
            <div style={{ background: "#0a0e14", border: "1px solid #21262d", borderRadius: 8, padding: 16 }}>
              <h3 style={{ fontSize: 11, color: "#58a6ff", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>技术解释</h3>
              <p style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.7 }}>{term.tech}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <p style={{ color: "#484f58", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>从左侧选择一个术语查看详情</p>
          </div>
        )}
      </main>
    </div>
  );
}
