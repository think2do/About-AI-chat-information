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
