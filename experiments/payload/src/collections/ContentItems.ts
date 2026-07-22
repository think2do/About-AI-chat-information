import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from './access'

export const ContentItems: CollectionConfig = {
  slug: 'content-items',
  labels: {
    singular: '教学条目',
    plural: '教学条目',
  },
  admin: {
    group: '教学内容',
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'itemType', 'difficulty', '_status', 'updatedAt'],
    description: '统一承载术语、面试题、工具、命令和交互演示步骤；原始 fixture 保留在结构化数据字段。',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本信息',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'module',
                  type: 'relationship',
                  label: '所属模块',
                  relationTo: 'content-modules',
                  required: true,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'category',
                  type: 'relationship',
                  label: '内容分类',
                  relationTo: 'content-categories',
                  index: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'title',
              type: 'text',
              label: '标题',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  type: 'text',
                  label: '条目标识',
                  required: true,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'itemType',
                  type: 'select',
                  label: '内容类型',
                  required: true,
                  index: true,
                  admin: { width: '50%' },
                  options: [
                    { label: '术语', value: 'term' },
                    { label: '面试题', value: 'question' },
                    { label: '工具', value: 'tool' },
                    { label: '命令', value: 'command' },
                    { label: '终端模拟步骤', value: 'simulator-step' },
                    { label: 'Agent 步骤', value: 'agent-step' },
                    { label: '隐藏功能', value: 'hidden-feature' },
                    { label: '模块配置', value: 'module-config' },
                    { label: 'Lab 配置', value: 'lab-config' },
                    { label: 'Function Call 步骤', value: 'function-call-step' },
                    { label: '推理步骤', value: 'inference-step' },
                    { label: 'RAG 步骤', value: 'rag-step' },
                    { label: 'Chat 管道阶段', value: 'pipeline-stage' },
                  ],
                },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: '摘要',
              admin: {
                description: '列表、搜索和运营预览使用的简短说明。',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'difficulty',
                  type: 'select',
                  label: '难度',
                  admin: { width: '50%' },
                  options: [
                    { label: '简单', value: '简单' },
                    { label: '中等', value: '中等' },
                    { label: '困难', value: '困难' },
                  ],
                },
                {
                  name: 'company',
                  type: 'text',
                  label: '适用公司/场景',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'tags',
              type: 'array',
              label: '标签',
              labels: { singular: '标签', plural: '标签' },
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  label: '标签名',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: '编辑备注',
          fields: [
            {
              name: 'editorialNotes',
              type: 'richText',
              label: '富文本编辑区',
              admin: {
                description: '用于体验 Lexical 富文本、内部编辑说明和内容补充。',
              },
            },
          ],
        },
        {
          label: '结构化数据',
          fields: [
            {
              name: 'source',
              type: 'json',
              label: '原始 fixture JSON',
              required: true,
              admin: {
                description: '完整保留当前项目 JSON 数据，便于比较 CMS 对复杂结构的承载方式。',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'sourceKey',
      type: 'text',
      label: '导入标识',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 0,
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  defaultSort: 'sortOrder',
  versions: {
    drafts: true,
    maxPerDoc: 30,
  },
}
