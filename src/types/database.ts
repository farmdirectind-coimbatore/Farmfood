export type UserRole = 'USER' | 'ADMIN';
export type PurchaseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type HoldingStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  supabase_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  phone: string | null;
  address: string | null;
  pan_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankDetails {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  gpay_id: string | null;
  phonepay_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequest {
  id: string;
  user_id: string;
  shares: number;
  amount: number;
  daily_payout: number;
  total_projected_return: number;
  screenshot_url: string;
  status: PurchaseStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Holding {
  id: string;
  user_id: string;
  purchase_request_id: string;
  shares: number;
  amount_invested: number;
  daily_payout: number;
  total_projected_return: number;
  start_date: string;
  end_date: string;
  weekdays_paid: number;
  total_paid: number;
  status: HoldingStatus;
  created_at: string;
  updated_at: string;
  purchase_request?: PurchaseRequest;
  payouts?: Payout[];
}

export interface Payout {
  id: string;
  holding_id: string;
  user_id: string;
  payout_date: string;
  amount: number;
  running_total: number;
  weekdays_paid: number;
  marked_by: string | null;
  marked_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  admin?: User;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface DashboardStats {
  totalShares: number;
  totalInvested: number;
  dailyPayoutRate: number;
  weekdaysPaid: number;
  totalReceived: number;
  projectedRemaining: number;
}

export interface HoldingWithProgress extends Holding {
  progress: {
    weekdaysPaid: number;
    amountReceived: number;
    amountRemaining: number;
    daysLeft: number;
    isComplete: boolean;
    progressPercent: number;
  };
}