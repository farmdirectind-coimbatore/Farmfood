export const APP_CONSTANTS = {
  SHARE_PRICE: 10000,
  DAILY_RETURN_RATE: 0.01,
  TOTAL_WEEKDAYS: 249,
  MIN_WITHDRAWAL: 100,
  MAX_SHARES_PER_USER: 10000,
  SCREENSHOT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SCREENSHOT_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const NOTIFICATION_TYPES = {
  PURCHASE_SUBMITTED: 'purchase_submitted',
  PURCHASE_APPROVED: 'purchase_approved',
  PURCHASE_REJECTED: 'purchase_rejected',
  PAYOUT_CREDITED: 'payout_credited',
  CYCLE_COMPLETED: 'cycle_completed',
} as const;

export const ROUTES = {
  HOME: '/',
  HOW_IT_WORKS: '/how-it-works',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  RISK_DISCLOSURE: '/risk-disclosure',
  CONTACT: '/contact',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PORTFOLIO: '/dashboard/portfolio',
  PAYOUTS: '/dashboard/payouts',
  NOTIFICATIONS: '/dashboard/notifications',
  PROFILE: '/dashboard/profile',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_BANK_DETAILS: '/admin/bank-details',
  ADMIN_AUDIT: '/admin/audit',
} as const;

export const QUERY_KEYS = {
  USER_PROFILE: 'userProfile',
  USER_HOLDINGS: 'userHoldings',
  USER_PAYOUTS: 'userPayouts',
  USER_NOTIFICATIONS: 'userNotifications',
  BANK_DETAILS: 'bankDetails',
  ADMIN_USERS: 'adminUsers',
  ADMIN_PENDING_REQUESTS: 'adminPendingRequests',
  ADMIN_TODAYS_PAYOUTS: 'adminTodaysPayouts',
  ADMIN_BANK_DETAILS: 'adminBankDetails',
  ADMIN_AUDIT_LOGS: 'adminAuditLogs',
} as const;