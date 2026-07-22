import type { GlobalConfig } from 'payload'

import { anyone, authenticated } from '../collections/access'
import {
  defaultContactAboutCards,
  defaultContactJoinSteps,
  defaultContactRepositories,
  defaultContactSteps,
} from '../content/contact-defaults'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '官网设置',
  admin: { group: '官网管理' },
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '首页首屏',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: '网站名称',
              required: true,
              defaultValue: 'About AI',
            },
            {
              name: 'heroTitle',
              type: 'text',
              label: '首页主标题',
              required: true,
              defaultValue: 'AI 探索者社区',
            },
            {
              name: 'heroSlogan',
              type: 'text',
              label: '首页口号',
              required: true,
              defaultValue: '一起学习 AI，一起把灵感做成作品。',
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              label: '首页简介',
              required: true,
              defaultValue: '面向 AI 学习者、产品人、设计师与开发者的开放社区。',
            },
          ],
        },
        {
          label: '联系我们',
          fields: [
            {
              name: 'contactContentVersion',
              type: 'number',
              defaultValue: 0,
              admin: { hidden: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactEyebrow',
                  type: 'text',
                  label: '英文眉标',
                  defaultValue: 'CONTACT US',
                  admin: { width: '40%' },
                },
                {
                  name: 'contactTitle',
                  type: 'text',
                  label: '页面标题',
                  defaultValue: '联系我们',
                  admin: { width: '60%' },
                },
              ],
            },
            {
              name: 'contactIntro',
              type: 'textarea',
              label: '页面说明',
              defaultValue: '从上到下了解我们、Github 小组与二维码联系入口。',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactMissionLabel',
                  type: 'text',
                  label: '使命标签',
                  defaultValue: '我们的使命',
                  admin: { width: '30%' },
                },
                {
                  name: 'contactMission',
                  type: 'text',
                  label: '使命文案',
                  defaultValue: '让复杂的 AI 知识更易理解，让学习成果真正变成作品。',
                  admin: { width: '70%' },
                },
              ],
            },
            {
              name: 'contactAboutTitle',
              type: 'text',
              label: '介绍区标题',
              defaultValue: '介绍我们',
            },
            {
              name: 'contactAboutCards',
              type: 'array',
              label: '介绍卡片',
              labels: { singular: '介绍卡片', plural: '介绍卡片' },
              maxRows: 3,
              minRows: 3,
              defaultValue: defaultContactAboutCards,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'numberLabel',
                      type: 'text',
                      label: '编号',
                      admin: { width: '20%' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: '标题',
                      required: true,
                      admin: { width: '80%' },
                    },
                  ],
                },
                { name: 'description', type: 'textarea', label: '说明', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactGithubTitle',
                  type: 'text',
                  label: 'Github 区标题',
                  defaultValue: 'Github 小组',
                  admin: { width: '30%' },
                },
                {
                  name: 'contactGithubIntro',
                  type: 'textarea',
                  label: 'Github 小组说明',
                  defaultValue: '查看正在共建的项目，并了解如何通过 Issue 与 PR 参与协作。',
                  admin: { width: '70%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactRepositoriesTitle',
                  type: 'text',
                  label: '共建仓库区标题',
                  defaultValue: '正在共建',
                  admin: { width: '50%' },
                },
                {
                  name: 'contactJoinTitle',
                  type: 'text',
                  label: '加入步骤区标题',
                  defaultValue: '如何加入',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactOpenIssuesLabel',
                  type: 'text',
                  label: 'Issue 数量后缀',
                  defaultValue: 'open issues',
                  admin: { width: '50%' },
                },
                {
                  name: 'contactRepositoryMetaLabel',
                  type: 'text',
                  label: '仓库链接文案',
                  defaultValue: '仓库信息',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'contactRepositories',
              type: 'array',
              label: '共建仓库',
              labels: { singular: '共建仓库', plural: '共建仓库' },
              defaultValue: defaultContactRepositories,
              fields: [
                { name: 'name', type: 'text', label: '仓库名称', required: true },
                { name: 'description', type: 'text', label: '仓库说明', required: true },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'openIssues',
                      type: 'number',
                      label: 'Open Issues',
                      min: 0,
                      required: true,
                      admin: { width: '30%' },
                    },
                    {
                      name: 'repositoryURL',
                      type: 'text',
                      label: '仓库地址（选填）',
                      admin: { width: '70%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'contactJoinSteps',
              type: 'array',
              label: '如何加入',
              labels: { singular: '加入步骤', plural: '加入步骤' },
              defaultValue: defaultContactJoinSteps,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'numberLabel',
                      type: 'text',
                      label: '编号',
                      admin: { width: '20%' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: '步骤标题',
                      required: true,
                      admin: { width: '80%' },
                    },
                  ],
                },
                { name: 'description', type: 'text', label: '步骤说明', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactQRSectionTitle',
                  type: 'text',
                  label: '二维码区标题',
                  defaultValue: '二维码',
                  admin: { width: '30%' },
                },
                {
                  name: 'contactQRIntro',
                  type: 'textarea',
                  label: '二维码区域说明',
                  defaultValue: '扫码加入社区，获取学习讨论、热门活动与共建信息。',
                  admin: { width: '70%' },
                },
              ],
            },
            {
              name: 'contactQRTitle',
              type: 'text',
              label: '联系卡标题',
              defaultValue: '与我们建立联系',
            },
            {
              name: 'contactQRDescription',
              type: 'textarea',
              label: '联系卡说明',
              defaultValue:
                '你可以通过二维码加入社区，参与学习讨论、热门活动、作品展示与 Github 共建。',
            },
            {
              name: 'contactSteps',
              type: 'array',
              label: '二维码加入步骤',
              labels: { singular: '二维码步骤', plural: '二维码步骤' },
              defaultValue: defaultContactSteps,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'numberLabel',
                      type: 'text',
                      label: '编号',
                      admin: { width: '20%' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: '步骤标题',
                      required: true,
                      admin: { width: '80%' },
                    },
                  ],
                },
                { name: 'description', type: 'text', label: '步骤说明', required: true },
              ],
            },
            {
              name: 'contactQRCode',
              type: 'upload',
              relationTo: 'media',
              label: '社群二维码',
              filterOptions: {
                mimeType: { contains: 'image/' },
              },
              admin: {
                description: '未上传时，前台显示 Figma 原型中的二维码占位图。',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contactQRLabel',
                  type: 'text',
                  label: '二维码标题',
                  defaultValue: '二维码占位',
                  admin: { width: '50%' },
                },
                {
                  name: 'contactQRNote',
                  type: 'text',
                  label: '二维码备注',
                  defaultValue: '上线前替换为正式社群二维码',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: '页脚',
          fields: [
            {
              name: 'footerText',
              type: 'text',
              label: '页脚文字',
              required: true,
              defaultValue: '© 2026 · 由 AI 创造者社区发起',
            },
            {
              name: 'contactEmail',
              type: 'email',
              label: '联系邮箱',
              defaultValue: 'hello@about-ai.local',
            },
          ],
        },
      ],
    },
  ],
}
