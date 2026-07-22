export const activityStatusLabels = {
  registering: '报名中',
  ongoing: '进行中',
  upcoming: '即将开始',
  open: '长期开放',
  ended: '已结束',
} as const

export type ActivityStatus = keyof typeof activityStatusLabels

export function getActivityStatusLabel(status: ActivityStatus): string {
  return activityStatusLabels[status]
}
