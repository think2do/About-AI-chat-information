"""Teaching content response models (Spec 009).

Field names/shape mirror packages/shared/src/content.ts (cross-layer contract).
"""

from typing import Literal

from pydantic import BaseModel


class JargonTerm(BaseModel):
    slug: str
    emoji: str
    cn: str
    en: str
    plain: str
    tech: str


class JargonCategory(BaseModel):
    slug: str
    label: str
    terms: list[JargonTerm]


class JargonResponse(BaseModel):
    module: Literal["jargon"] = "jargon"
    total: int
    categories: list[JargonCategory]


# --- Job (Spec 010) ---


class JobTag(BaseModel):
    key: str
    label: str
    emoji: str
    count: int


class JobSummary(BaseModel):
    id: str
    title: str
    category: str
    tag: str
    difficulty: str
    company: str
    tags: list[str]


class JobQuestion(JobSummary):
    answer: str
    code: str | None = None
    codeLabel: str | None = None
    codeLines: int | None = None
    keyPoints: list[str]
    related: list[str]


class JobListResponse(BaseModel):
    module: Literal["job"] = "job"
    total: int
    all_tags: list[JobTag]
    items: list[JobSummary]


# --- Code (Spec 011) ---


class CodeTool(BaseModel):
    name: str
    emoji: str
    title: str
    plain: str
    example: str
    isExp: bool


class CodeCommand(BaseModel):
    cmd: str
    emoji: str
    title: str
    plain: str
    example: str
    isExp: bool


class CodeToolCategory(BaseModel):
    slug: str
    label: str
    count: int
    tools: list[CodeTool]


class CodeCommandCategory(BaseModel):
    slug: str
    label: str
    count: int
    commands: list[CodeCommand]


class SimSeq(BaseModel):
    tag: str
    tagColor: str
    title: str
    desc: str
    code: str | None = None


class SimStep(BaseModel):
    terminal: list[str]
    seq: SimSeq


class AgentStep(BaseModel):
    num: str
    title: str
    src: str
    desc: str
    code: str | None = None


class HiddenFeature(BaseModel):
    name: str
    desc: str


class CodeToolsGroup(BaseModel):
    categories: list[CodeToolCategory]


class CodeCommandsGroup(BaseModel):
    categories: list[CodeCommandCategory]


class CodeResponse(BaseModel):
    module: Literal["code"] = "code"
    tools: CodeToolsGroup
    commands: CodeCommandsGroup
    simulator: list[SimStep]
    agentLoop: list[AgentStep]
    hidden: list[HiddenFeature]


# --- Lab (Spec 012) ---

from typing import Any  # noqa: E402


class FcStep(BaseModel):
    icon: str
    label: str
    color: str
    content: str | None = None
    jsonObj: Any | None = None
    isCode: bool
    highlight: bool


class InferStep(BaseModel):
    num: str
    icon: str
    title: str
    desc: str
    code: str | None = None


class RagStep(BaseModel):
    num: str
    icon: str
    title: str
    desc: str
    code: str | None = None
    phase: str | None = None
    phaseColor: str | None = None


class TokenizerBar(BaseModel):
    label: str
    value: str
    valueColor: str
    widthPct: int
    barColor: str
    sample: str | None = None


class TokenizerGroup(BaseModel):
    title: str
    titleColor: str
    bars: list[TokenizerBar]


class TokenizerNote(BaseModel):
    text: str
    color: str


class TokenizerMode(BaseModel):
    key: str
    label: str
    intro: str
    groups: list[TokenizerGroup]
    note: TokenizerNote


class TokenizerQuickCard(BaseModel):
    label: str
    zh: str
    zhColor: str
    en: str


class TokenizerQuickref(BaseModel):
    title: str
    cards: list[TokenizerQuickCard]
    footnote: str


class TokenizerData(BaseModel):
    modes: list[TokenizerMode]
    quickref: TokenizerQuickref


class TrainingData(BaseModel):
    defaultQuestion: str
    baseTemplate: str
    sftAnswer: str


class LabResponse(BaseModel):
    module: Literal["lab"] = "lab"
    training: TrainingData | None = None
    functionCall: list[FcStep]
    tokenizer: TokenizerData | None = None
    inference: list[InferStep]
    rag: list[RagStep]


# --- Chat pipeline (Spec 013) ---


class PipelineStageContent(BaseModel):
    num: str
    label: str
    short: str
    detail: str
    color: str


class ChatPipelineResponse(BaseModel):
    module: Literal["chat"] = "chat"
    stages: list[PipelineStageContent]
