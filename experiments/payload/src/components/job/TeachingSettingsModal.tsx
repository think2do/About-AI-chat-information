'use client'

import { useEffect, useState } from 'react'

import { color, mono, radius, sans } from './theme'

interface ProviderConfig {
  apiKey: string
  baseUrl: string
  model: string
}

interface Settings {
  activeProvider: string
  providers: Record<string, ProviderConfig>
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openrouter: 'https://openrouter.ai/api/v1',
  aihubmix: 'https://aihubmix.com/v1',
  packy: 'https://api.packy.top/v1',
}

const PROVIDER_LABELS: Record<string, string> = {
  openrouter: 'OpenRouter',
  aihubmix: 'AI HubMix',
  packy: 'Packy API',
  custom: '自定义',
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('llm_viz_settings')
    if (!raw) return { activeProvider: 'openrouter', providers: {} }

    const parsed = JSON.parse(raw)
    if (parsed.apiKey && !parsed.providers) {
      return {
        activeProvider: 'openrouter',
        providers: {
          openrouter: {
            apiKey: parsed.apiKey || '',
            baseUrl: parsed.baseUrl || DEFAULT_BASE_URLS.openrouter,
            model: parsed.model || 'openai/gpt-4o',
          },
        },
      }
    }

    return {
      activeProvider: parsed.activeProvider || 'openrouter',
      providers: parsed.providers || {},
    }
  } catch {
    return { activeProvider: 'openrouter', providers: {} }
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem('llm_viz_settings', JSON.stringify(settings))
}

export function TeachingSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [activeProvider, setActiveProvider] = useState(settings.activeProvider)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const nextSettings = loadSettings()
      // Reload the browser-only settings each time the source modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(nextSettings)
      setActiveProvider(nextSettings.activeProvider)
      setSaved(false)
    }
  }, [isOpen])

  const currentConfig: ProviderConfig = settings.providers[activeProvider] || {
    apiKey: '',
    baseUrl: DEFAULT_BASE_URLS[activeProvider] || '',
    model: '',
  }

  const updateConfig = (field: keyof ProviderConfig, value: string) => {
    setSettings((previous) => ({
      ...previous,
      providers: {
        ...previous.providers,
        [activeProvider]: {
          ...(previous.providers[activeProvider] || {
            apiKey: '',
            baseUrl: DEFAULT_BASE_URLS[activeProvider] || '',
            model: '',
          }),
          [field]: value,
        },
      },
    }))
  }

  const handleSwitchProvider = (provider: string) => {
    setActiveProvider(provider)
    if (!settings.providers[provider]?.baseUrl && DEFAULT_BASE_URLS[provider]) {
      setSettings((previous) => ({
        ...previous,
        providers: {
          ...previous.providers,
          [provider]: {
            ...(previous.providers[provider] || { apiKey: '', model: '' }),
            baseUrl: DEFAULT_BASE_URLS[provider],
          },
        },
      }))
    }
  }

  const handleSave = () => {
    saveSettings({ activeProvider, providers: settings.providers })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(35,33,28,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: radius.lg,
          boxShadow: '0 8px 30px rgba(35,33,28,0.12)',
          width: 480,
          maxHeight: '80vh',
          overflow: 'auto',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: color.textPrimary, fontFamily: mono }}>
            ⚙ 设置
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: color.textTertiary,
              fontSize: 20,
              cursor: 'pointer',
            }}
            type="button"
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 11,
              color: color.textTertiary,
              fontFamily: mono,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleSwitchProvider(key)}
                style={{
                  padding: '8px 12px',
                  borderRadius: radius.sm,
                  border:
                    activeProvider === key
                      ? `1px solid ${color.brandYellow}`
                      : `1px solid ${color.borderSubtle}`,
                  background:
                    activeProvider === key ? color.brandYellowTint : color.surfaceSubtle,
                  color: activeProvider === key ? color.textPrimary : color.textTertiary,
                  fontSize: 12,
                  fontFamily: mono,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              color: color.textTertiary,
              fontFamily: mono,
              display: 'block',
              marginBottom: 6,
            }}
          >
            API Key
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              onChange={(event) => updateConfig('apiKey', event.target.value.trim())}
              placeholder="sk-..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: color.surfaceSubtle,
                border: `1px solid ${color.border}`,
                borderRadius: radius.sm,
                color: color.textPrimary,
                fontFamily: mono,
                fontSize: 12,
                outline: 'none',
              }}
              type="password"
              value={currentConfig.apiKey}
            />
            <button
              onClick={() => updateConfig('apiKey', '')}
              style={{
                padding: '8px 12px',
                background: `color-mix(in srgb, ${color.red} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color.red} 30%, transparent)`,
                borderRadius: radius.sm,
                color: color.red,
                fontSize: 11,
                fontFamily: mono,
                cursor: 'pointer',
              }}
              type="button"
            >
              清除
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              color: color.textTertiary,
              fontFamily: mono,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Base URL
          </label>
          <input
            onChange={(event) => updateConfig('baseUrl', event.target.value.trim())}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '8px 12px',
              background: color.surfaceSubtle,
              border: `1px solid ${color.border}`,
              borderRadius: radius.sm,
              color: color.textPrimary,
              fontFamily: mono,
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            type="text"
            value={currentConfig.baseUrl}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              color: color.textTertiary,
              fontFamily: mono,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Model ID
          </label>
          <input
            onChange={(event) => updateConfig('model', event.target.value.trim())}
            placeholder="openai/gpt-4o"
            style={{
              width: '100%',
              padding: '8px 12px',
              background: color.surfaceSubtle,
              border: `1px solid ${color.border}`,
              borderRadius: radius.sm,
              color: color.textPrimary,
              fontFamily: mono,
              fontSize: 12,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            type="text"
            value={currentConfig.model}
          />
        </div>

        <div
          style={{
            padding: '10px 14px',
            background: color.surfaceSubtle,
            border: `1px solid ${color.borderSubtle}`,
            borderRadius: radius.sm,
            marginBottom: 20,
            fontSize: 11,
            color: color.textTertiary,
            fontFamily: sans,
            lineHeight: 1.6,
          }}
        >
          🔒 API Key 只保存在当前浏览器。发送消息时，Key
          会临时传给本教学工具后端用于转发模型请求；后端不会保存 Key。对话内容会被保存用于学习记录和问题排查，默认
          30 天后过期。
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${color.border}`,
              borderRadius: radius.sm,
              color: color.textSecondary,
              fontSize: 12,
              fontFamily: mono,
              cursor: 'pointer',
            }}
            type="button"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              background: saved
                ? `color-mix(in srgb, ${color.teal} 15%, transparent)`
                : color.ctaBg,
              border: 'none',
              borderRadius: radius.sm,
              color: saved ? color.teal : color.ctaText,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: mono,
              cursor: 'pointer',
            }}
            type="button"
          >
            {saved ? '✓ 已保存' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
