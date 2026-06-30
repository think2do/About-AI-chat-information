"""Provider adapter package — factory function and all concrete adapters."""

from app.models.request import ProviderId, ChatStreamRequest
from app.adapters.base import BaseProviderAdapter
from app.adapters.openrouter_adapter import OpenRouterAdapter
from app.adapters.aihubmix_adapter import AIHubMixAdapter
from app.adapters.packy_adapter import PackyAdapter
from app.adapters.custom_adapter import CustomAdapter


def get_adapter(provider: ProviderId, base_url: str) -> BaseProviderAdapter:
    """Factory: return the correct adapter for a given Provider.

    Args:
        provider: The provider identifier from the request.
        base_url: The base URL to use (from request or adapter default).

    Returns:
        A concrete BaseProviderAdapter instance.
    """
    adapters = {
        ProviderId.OPENROUTER: OpenRouterAdapter,
        ProviderId.AIHUBMIX: AIHubMixAdapter,
        ProviderId.PACKY: PackyAdapter,
        ProviderId.CUSTOM: CustomAdapter,
    }
    adapter_cls = adapters.get(provider)
    if adapter_cls is None:
        raise ValueError(f"Unknown provider: {provider}")
    return adapter_cls(base_url)
