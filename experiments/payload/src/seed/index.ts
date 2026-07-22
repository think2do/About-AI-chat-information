import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Payload, Where } from 'payload'

import {
  defaultContactAboutCards,
  defaultContactJoinSteps,
  defaultContactRepositories,
  defaultContactSteps,
} from '../content/contact-defaults'
import type { Config, ContentItem, SiteSetting } from '../payload-types'

type JsonRow = Record<string, unknown>
type CollectionSlug = keyof Config['collections']
type RecordID = Config['db']['defaultIDType']
type Difficulty = NonNullable<ContentItem['difficulty']>
type ItemType = NonNullable<ContentItem['itemType']>

type CategorySeed = {
  itemType: string
  key: string
  label: string
  moduleSlug: string
  slug: string
  sortOrder: number
}

type ItemSeed = {
  categoryKey?: string
  company?: string
  difficulty?: Difficulty
  itemType: ItemType
  key: string
  moduleSlug: string
  slug: string
  sortOrder: number
  source: JsonRow
  summary?: string
  tags?: string[]
  title: string
}

const modules = [
  {
    accentColor: '#8b5cf6',
    description: '大模型请求、上下文组装与生成管道的逐阶段教学内容。',
    label: 'Chat · 对话管道',
    slug: 'chat',
    sortOrder: 0,
  },
  {
    accentColor: '#06b6d4',
    description: '训练、Tokenizer、Function Call、推理与 RAG 的交互实验。',
    label: 'Lab · 机制实验',
    slug: 'lab',
    sortOrder: 1,
  },
  {
    accentColor: '#22c55e',
    description: 'Claude Code 工具、命令、终端模拟器与 Agent Loop 教学内容。',
    label: 'Code · 编码工具',
    slug: 'code',
    sortOrder: 2,
  },
  {
    accentColor: '#f59e0b',
    description: '面向学习者的 LLM 核心术语、白话解释与技术定义。',
    label: 'Jargon · 术语词典',
    slug: 'jargon',
    sortOrder: 3,
  },
  {
    accentColor: '#f43f5e',
    description: '按架构、算法、工程等主题组织的 100 道面试题。',
    label: 'Job · 面试题库',
    slug: 'job',
    sortOrder: 4,
  },
] as const

const isProductionSeed = process.env.NODE_ENV === 'production'

function readSeedCredential(name: string, developmentFallback: string) {
  const value = process.env[name]?.trim()
  if (value) return value

  if (isProductionSeed) {
    throw new Error(`生产 seed 缺少必填环境变量：${name}`)
  }

  return developmentFallback
}

function readSeedPassword(name: string, developmentFallback: string) {
  const password = readSeedCredential(name, developmentFallback)

  if (isProductionSeed && password.length < 12) {
    throw new Error(`生产 seed 的 ${name} 至少需要 12 个字符。`)
  }

  return password
}

function readSeedCredentials() {
  const adminEmail = readSeedCredential('SEED_ADMIN_EMAIL', 'admin@example.com')
  const adminPassword = readSeedPassword('SEED_ADMIN_PASSWORD', 'Payload@123456')
  const memberEmail = readSeedCredential('SEED_MEMBER_EMAIL', 'member@example.com')
  const memberPassword = readSeedPassword('SEED_MEMBER_PASSWORD', 'Member@123456')

  if (adminEmail === memberEmail) {
    throw new Error('SEED_ADMIN_EMAIL 与 SEED_MEMBER_EMAIL 必须使用不同邮箱。')
  }

  return { adminEmail, adminPassword, memberEmail, memberPassword }
}

export function validateSeedCredentials() {
  readSeedCredentials()
}

const activitySeeds = [
  {
    featured: true,
    participantCount: 86,
    registrationMode: 'internal',
    rules: '用 AI 完成一件有趣作品，并提交作品说明与创作过程。',
    slug: 'ai-fun-challenge',
    sortOrder: 0,
    activityStatus: 'registering',
    summary: '用 AI 完成一件有趣作品，并在社区展示你的创作过程。',
    title: 'AI 布好玩',
  },
  {
    featured: false,
    participantCount: 42,
    registrationMode: 'internal',
    rules: '连续 7 天完成指定学习任务并提交学习笔记。',
    slug: 'ai-learning-challenge',
    sortOrder: 1,
    activityStatus: 'ongoing',
    summary: '用一周时间建立稳定的 AI 学习节奏。',
    title: 'AI 学习挑战赛',
  },
  {
    featured: false,
    participantCount: 0,
    registrationMode: 'internal',
    rules: '围绕指定主题提交 Prompt、过程说明与效果截图。',
    slug: 'prompt-week',
    sortOrder: 2,
    activityStatus: 'upcoming',
    summary: '分享 Prompt 的设计思路、迭代过程与最终效果。',
    title: 'Prompt 创作周',
  },
  {
    featured: false,
    participantCount: 31,
    registrationMode: 'internal',
    rules: '认领 GitHub Issue，提交 PR 并完成小组 Review。',
    slug: 'open-source-day',
    sortOrder: 3,
    activityStatus: 'open',
    summary: '从一个真实 Issue 开始参与 AI 开源项目。',
    title: '开源共建日',
  },
] as const

const workSeeds = [
  {
    authorName: '林檎',
    category: '学习工具',
    featured: true,
    slug: 'llm-visualizer',
    sortOrder: 0,
    summary: '交互式理解 Token、Attention 与推理过程。',
    title: 'LLM 机制可视化工具',
  },
  {
    authorName: '小白',
    category: '求职产品',
    featured: true,
    slug: 'ai-interview-bank',
    sortOrder: 1,
    summary: '覆盖系统架构、模型选型、评测与产品策略。',
    title: 'AI 求职面试题库',
  },
  {
    authorName: '可可',
    category: '商业项目',
    featured: true,
    slug: 'yuanjing-ai-education',
    sortOrder: 2,
    summary: '面向教育与安全生产场景的 AI SaaS 产品。',
    title: '圆镜 AI 教育平台',
  },
  {
    authorName: '北辰',
    category: '创意工具',
    featured: true,
    slug: 'ai-inspiration-capsule',
    sortOrder: 3,
    summary: '收集、组织并重新激活日常 AI 创作灵感。',
    title: 'AI 灵感胶囊',
  },
] as const

const fixturesRoot = path.resolve(process.cwd(), '../../apps/api/app/db/seeds/content')

function readJSON<T>(...parts: string[]): T {
  const file = path.join(fixturesRoot, ...parts)
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function integer(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

function difficulty(value: unknown): Difficulty | undefined {
  return value === '简单' || value === '中等' || value === '困难' ? value : undefined
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function shorten(value: string, limit = 180): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized
}

function requiredID(ids: Map<string, RecordID>, key: string): RecordID {
  const id = ids.get(key)
  if (!id) throw new Error(`Payload seed 缺少关联记录：${key}`)
  return id
}

function buildSeeds(): { categories: CategorySeed[]; items: ItemSeed[] } {
  const categories: CategorySeed[] = []
  const items: ItemSeed[] = []

  const addCategory = (
    moduleSlug: string,
    slug: string,
    label: string,
    itemType: string,
    sortOrder: number,
  ) => {
    categories.push({
      itemType,
      key: `${moduleSlug}:${slug}`,
      label,
      moduleSlug,
      slug,
      sortOrder,
    })
  }

  const jargonCategories = readJSON<JsonRow[]>('jargon', 'categories.json')
  for (const row of jargonCategories) {
    addCategory('jargon', text(row.slug), text(row.label), 'term', integer(row.sort_order))
  }
  const jargonTerms = readJSON<JsonRow[]>('jargon', 'terms.json')
  for (const row of jargonTerms) {
    const slug = text(row.slug)
    items.push({
      categoryKey: `jargon:${text(row.category_slug)}`,
      itemType: 'term',
      key: `jargon:${slug}`,
      moduleSlug: 'jargon',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.plain),
      tags: [text(row.en)].filter(Boolean),
      title: `${text(row.emoji)} ${text(row.cn)}`.trim(),
    })
  }

  const jobCategories = readJSON<JsonRow[]>('job', 'categories.json')
  for (const row of jobCategories) {
    addCategory('job', text(row.slug), text(row.label), 'question', integer(row.sort_order))
  }
  const jobQuestions = readJSON<JsonRow[]>('job', 'questions.json')
  for (const row of jobQuestions) {
    const slug = text(row.id)
    items.push({
      categoryKey: `job:${text(row.category_slug)}`,
      company: text(row.company),
      difficulty: difficulty(row.difficulty),
      itemType: 'question',
      key: `job:${slug}`,
      moduleSlug: 'job',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: shorten(text(row.answer)),
      tags: stringArray(row.tags),
      title: text(row.title),
    })
  }

  const codeCategorySources = [
    { file: 'tool_categories.json', itemType: 'tool' },
    { file: 'command_categories.json', itemType: 'command' },
  ] as const
  for (const categorySource of codeCategorySources) {
    const rows = readJSON<JsonRow[]>('code', categorySource.file)
    for (const row of rows) {
      addCategory(
        'code',
        text(row.slug),
        text(row.label),
        categorySource.itemType,
        integer(row.sort_order),
      )
    }
  }
  addCategory('code', 'simulator', '终端模拟器', 'simulator-step', 20)
  addCategory('code', 'agent-loop', 'Agent Loop', 'agent-step', 21)
  addCategory('code', 'hidden', '隐藏功能', 'hidden-feature', 22)

  const tools = readJSON<JsonRow[]>('code', 'tools.json')
  for (const row of tools) {
    const slug = text(row.slug)
    items.push({
      categoryKey: `code:${text(row.category_slug)}`,
      itemType: 'tool',
      key: `code:tool:${slug}`,
      moduleSlug: 'code',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.plain),
      title: `${text(row.emoji)} ${text(row.name)} · ${text(row.title)}`.trim(),
    })
  }

  const commands = readJSON<JsonRow[]>('code', 'commands.json')
  for (const row of commands) {
    const slug = text(row.slug)
    items.push({
      categoryKey: `code:${text(row.category_slug)}`,
      itemType: 'command',
      key: `code:command:${slug}`,
      moduleSlug: 'code',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.plain),
      title: `${text(row.emoji)} ${text(row.cmd)} · ${text(row.title)}`.trim(),
    })
  }

  const simulator = readJSON<JsonRow[]>('code', 'simulator.json')
  for (const row of simulator) {
    const slug = text(row.slug)
    const seq = (row.seq || {}) as JsonRow
    items.push({
      categoryKey: 'code:simulator',
      itemType: 'simulator-step',
      key: `code:${slug}`,
      moduleSlug: 'code',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(seq.desc),
      title: text(seq.title) || `终端模拟步骤 ${integer(row.sort_order) + 1}`,
    })
  }

  const agentLoop = readJSON<JsonRow[]>('code', 'agent_loop.json')
  for (const row of agentLoop) {
    const slug = text(row.slug)
    items.push({
      categoryKey: 'code:agent-loop',
      itemType: 'agent-step',
      key: `code:${slug}`,
      moduleSlug: 'code',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.desc),
      title: `${text(row.num)}. ${text(row.title)}`,
    })
  }

  const hidden = readJSON<JsonRow[]>('code', 'hidden.json')
  for (const row of hidden) {
    const slug = text(row.slug)
    items.push({
      categoryKey: 'code:hidden',
      itemType: 'hidden-feature',
      key: `code:${slug}`,
      moduleSlug: 'code',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.desc),
      title: text(row.name),
    })
  }

  addCategory('lab', 'config', '实验配置', 'module-config', 0)
  addCategory('lab', 'function-call', 'Function Call', 'function-call-step', 1)
  addCategory('lab', 'inference', '推理过程', 'inference-step', 2)
  addCategory('lab', 'rag', 'RAG 流程', 'rag-step', 3)

  const labConfigs = [
    { file: 'training.json', slug: 'training', title: 'SFT 训练实验配置' },
    { file: 'tokenizer.json', slug: 'tokenizer', title: 'Tokenizer 实验配置' },
  ] as const
  for (const entry of labConfigs) {
    const row = readJSON<JsonRow>('lab', entry.file)
    items.push({
      categoryKey: 'lab:config',
      itemType: 'module-config',
      key: `lab:${entry.slug}`,
      moduleSlug: 'lab',
      slug: entry.slug,
      sortOrder: 0,
      source: row,
      summary: '用于驱动前端交互实验的结构化配置。',
      title: entry.title,
    })
  }

  const labStepSources = [
    {
      categoryKey: 'lab:function-call',
      file: 'function_call.json',
      itemType: 'function-call-step',
    },
    { categoryKey: 'lab:inference', file: 'inference.json', itemType: 'inference-step' },
    { categoryKey: 'lab:rag', file: 'rag.json', itemType: 'rag-step' },
  ] as const
  for (const stepSource of labStepSources) {
    const rows = readJSON<JsonRow[]>('lab', stepSource.file)
    for (const row of rows) {
      const slug = text(row.slug)
      items.push({
        categoryKey: stepSource.categoryKey,
        itemType: stepSource.itemType,
        key: `lab:${slug}`,
        moduleSlug: 'lab',
        slug,
        sortOrder: integer(row.sort_order),
        source: row,
        summary: text(row.desc) || text(row.content),
        title: text(row.title) || text(row.label) || slug,
      })
    }
  }

  addCategory('chat', 'pipeline', '对话生成管道', 'pipeline-stage', 0)
  const pipeline = readJSON<JsonRow[]>('chat', 'pipeline.json')
  for (const row of pipeline) {
    const slug = text(row.slug)
    items.push({
      categoryKey: 'chat:pipeline',
      itemType: 'pipeline-stage',
      key: `chat:${slug}`,
      moduleSlug: 'chat',
      slug,
      sortOrder: integer(row.sort_order),
      source: row,
      summary: text(row.detail),
      title: `${text(row.num)}. ${text(row.label)}`,
    })
  }

  return { categories, items }
}

async function findRecord(
  payload: Payload,
  collection: CollectionSlug,
  field: string,
  value: string,
): Promise<{ id: RecordID; status?: 'draft' | 'published' } | undefined> {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { [field]: { equals: value } } as Where,
  })
  const doc = result.docs[0]
  if (!doc) return undefined
  return {
    id: doc.id as RecordID,
    status: '_status' in doc ? (doc._status as 'draft' | 'published' | undefined) : undefined,
  }
}

let inFlight: Promise<void> | undefined

export function seedExperience(payload: Payload): Promise<void> {
  if (!inFlight) {
    inFlight = runSeed(payload)
  }
  return inFlight
}

async function runSeed(payload: Payload): Promise<void> {
  const { adminEmail, adminPassword, memberEmail, memberPassword } = readSeedCredentials()
  const moduleIDs = new Map<string, RecordID>()
  const categoryIDs = new Map<string, RecordID>()
  let createdModules = 0
  let createdCategories = 0
  let createdItems = 0
  let createdActivities = 0
  let createdWorks = 0

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: true,
  })
  const contactContentVersion = 2
  if ((siteSettings.contactContentVersion ?? 0) < contactContentVersion) {
    const withNumberLabels = <T extends { numberLabel?: null | string }>(rows: T[]) =>
      rows.map((row, index) => ({
        ...row,
        numberLabel: row.numberLabel || String(index + 1).padStart(2, '0'),
      }))
    const contactDefaultsPatch: Partial<SiteSetting> = {
      contactAboutCards: siteSettings.contactAboutCards?.length
        ? withNumberLabels(siteSettings.contactAboutCards)
        : defaultContactAboutCards,
      contactAboutTitle: siteSettings.contactAboutTitle || '介绍我们',
      contactContentVersion,
      contactGithubTitle: siteSettings.contactGithubTitle || 'Github 小组',
      contactJoinSteps: siteSettings.contactJoinSteps?.length
        ? withNumberLabels(siteSettings.contactJoinSteps)
        : defaultContactJoinSteps,
      contactJoinTitle: siteSettings.contactJoinTitle || '如何加入',
      contactOpenIssuesLabel: siteSettings.contactOpenIssuesLabel || 'open issues',
      contactRepositories: siteSettings.contactRepositories?.length
        ? siteSettings.contactRepositories
        : defaultContactRepositories,
      contactRepositoriesTitle: siteSettings.contactRepositoriesTitle || '正在共建',
      contactRepositoryMetaLabel: siteSettings.contactRepositoryMetaLabel || '仓库信息',
      contactQRSectionTitle: siteSettings.contactQRSectionTitle || '二维码',
      contactSteps: siteSettings.contactSteps?.length
        ? withNumberLabels(siteSettings.contactSteps)
        : defaultContactSteps,
    }
    await payload.updateGlobal({
      slug: 'site-settings',
      data: contactDefaultsPatch,
      overrideAccess: true,
    })
  }

  const existingAdmin = await findRecord(payload, 'users', 'email', adminEmail)
  if (!existingAdmin) {
    await payload.create({
      collection: 'users',
      context: { trustedUserCreate: true },
      data: {
        email: adminEmail,
        name: 'Payload 体验管理员',
        password: adminPassword,
        role: 'admin',
        accountStatus: 'active',
      },
      overrideAccess: true,
    })
  }

  const existingMember = await findRecord(payload, 'users', 'email', memberEmail)
  if (!existingMember) {
    await payload.create({
      collection: 'users',
      context: { trustedUserCreate: true },
      data: {
        accountStatus: 'active',
        email: memberEmail,
        name: '诗轩体验用户',
        password: memberPassword,
        role: 'member',
      },
      overrideAccess: true,
    })
  }

  for (const moduleSeed of modules) {
    const existing = await findRecord(payload, 'content-modules', 'slug', moduleSeed.slug)
    let id = existing?.id
    if (!id) {
      const created = await payload.create({
        collection: 'content-modules',
        data: { ...moduleSeed, _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
      id = created.id
      createdModules += 1
    } else if (existing?.status !== 'published') {
      await payload.update({
        collection: 'content-modules',
        id,
        data: { _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
    }
    moduleIDs.set(moduleSeed.slug, id)
  }

  const { categories, items } = buildSeeds()
  for (const category of categories) {
    const existing = await findRecord(payload, 'content-categories', 'sourceKey', category.key)
    let id = existing?.id
    if (!id) {
      const created = await payload.create({
        collection: 'content-categories',
        data: {
          _status: 'published',
          itemType: category.itemType,
          label: category.label,
          module: requiredID(moduleIDs, category.moduleSlug),
          slug: category.slug,
          sortOrder: category.sortOrder,
          sourceKey: category.key,
        },
        draft: false,
        overrideAccess: true,
      })
      id = created.id
      createdCategories += 1
    } else if (existing?.status !== 'published') {
      await payload.update({
        collection: 'content-categories',
        id,
        data: { _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
    }
    categoryIDs.set(category.key, id)
  }

  for (const item of items) {
    const existing = await findRecord(payload, 'content-items', 'sourceKey', item.key)
    if (existing) {
      if (existing.status !== 'published') {
        await payload.update({
          collection: 'content-items',
          id: existing.id,
          data: { _status: 'published' },
          draft: false,
          overrideAccess: true,
        })
      }
      continue
    }

    await payload.create({
      collection: 'content-items',
      data: {
        _status: 'published',
        category: item.categoryKey ? categoryIDs.get(item.categoryKey) : undefined,
        company: item.company || undefined,
        difficulty: item.difficulty || undefined,
        itemType: item.itemType,
        module: requiredID(moduleIDs, item.moduleSlug),
        slug: item.slug,
        sortOrder: item.sortOrder,
        source: item.source,
        sourceKey: item.key,
        summary: item.summary || undefined,
        tags: item.tags?.map((tag) => ({ tag })),
        title: item.title,
      },
      draft: false,
      overrideAccess: true,
    })
    createdItems += 1
  }

  for (const activity of activitySeeds) {
    const existing = await findRecord(payload, 'activities', 'slug', activity.slug)
    if (!existing) {
      await payload.create({
        collection: 'activities',
        data: { ...activity, _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
      createdActivities += 1
    }
  }

  for (const work of workSeeds) {
    const existing = await findRecord(payload, 'works', 'slug', work.slug)
    if (!existing) {
      await payload.create({
        collection: 'works',
        data: { ...work, _status: 'published' },
        draft: false,
        overrideAccess: true,
      })
      createdWorks += 1
    }
  }

  payload.logger.info(
    `Payload 体验数据已就绪：新增 ${createdModules} 模块、${createdCategories} 分类、${createdItems} 条内容、${createdActivities} 个活动、${createdWorks} 个作品。`,
  )
}
