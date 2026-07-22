export type ContactCardDefault = {
  description: string
  numberLabel: string
  title: string
}

export type ContactRepositoryDefault = {
  description: string
  name: string
  openIssues: number
  repositoryURL?: string
}

export const defaultContactAboutCards: ContactCardDefault[] = [
  {
    description: '由 AI 学习者、产品经理、设计师与开发者共同组成。',
    numberLabel: '01',
    title: '我们是谁',
  },
  {
    description: '整理知识、举办活动、展示作品，并推动 Github 共建。',
    numberLabel: '02',
    title: '我们在做什么',
  },
  {
    description: '系统学习路径、实践反馈、协作伙伴与作品曝光。',
    numberLabel: '03',
    title: '你可以获得什么',
  },
]

export const defaultContactRepositories: ContactRepositoryDefault[] = [
  {
    description: 'AI 学习地图与名词知识库',
    name: 'about-ai/learning-map',
    openIssues: 12,
  },
  {
    description: 'AI 产品与技术面试题库',
    name: 'about-ai/interview-kit',
    openIssues: 8,
  },
  {
    description: '社区创意实验与 Demo',
    name: 'about-ai/creative-lab',
    openIssues: 5,
  },
]

export const defaultContactJoinSteps: ContactCardDefault[] = [
  { description: '从兴趣与技能匹配的仓库开始。', numberLabel: '01', title: '选择项目' },
  {
    description: '在小组中同步范围与交付时间。',
    numberLabel: '02',
    title: '认领 Issue',
  },
  { description: '完成代码、文档与 Review。', numberLabel: '03', title: '提交 PR' },
  { description: '参与版本迭代与经验分享。', numberLabel: '04', title: '持续共建' },
]

export const defaultContactSteps: ContactCardDefault[] = [
  {
    description: '打开常用扫码工具识别右侧二维码。',
    numberLabel: '01',
    title: '扫码加入',
  },
  {
    description: '备注你的方向：产品 / 设计 / 开发 / 研究。',
    numberLabel: '02',
    title: '填写备注',
  },
  {
    description: '管理员会邀请你进入对应学习与共建小组。',
    numberLabel: '03',
    title: '进入小组',
  },
]
