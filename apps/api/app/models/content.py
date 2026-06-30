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
