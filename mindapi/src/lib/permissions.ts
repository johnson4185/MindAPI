import { UserRole } from './types'

const roleRank: Record<UserRole, number> = {
  Viewer: 1,
  Billing: 2,
  Developer: 3,
  Admin: 4,
  Owner: 5,
}

export function canManageApis(role: UserRole) {
  return roleRank[role] >= roleRank.Developer
}

export function canManageConsumers(role: UserRole) {
  return roleRank[role] >= roleRank.Developer
}

export function canManageWorkspace(role: UserRole) {
  return roleRank[role] >= roleRank.Admin
}

export function canViewBilling(role: UserRole) {
  return role === 'Owner' || role === 'Admin' || role === 'Billing'
}
