export type BankProfile = {
  phone?: string | null;
  account_holder_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  upi_id?: string | null;
};

export function normalizeProfile(value: unknown): BankProfile | null {
  if (Array.isArray(value)) {
    return (value[0] ?? null) as BankProfile | null;
  }
  if (value && typeof value === 'object') {
    return value as BankProfile;
  }
  return null;
}