'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Landmark, CheckCircle2, Loader2, Star, CreditCard, Hash, Link2, Pencil, X, Save, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

interface BankDetail {
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

async function fetchBankDetails(): Promise<BankDetail[]> {
  const res = await fetch('/api/admin/bank-details');
  if (!res.ok) throw new Error('Failed to load bank details');
  return res.json();
}

export default function AdminBankDetailsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminBankDetails'],
    queryFn: fetchBankDetails,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminBankDetails'] });
  };

  const setActive = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/admin/bank-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: true }),
      });
      if (!res.ok) throw new Error('Failed to update active account');
      return res.json();
    },
    onSuccess: invalidate,
  });

  const saveDetails = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BankDetail> }) => {
      const res = await fetch('/api/admin/bank-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update bank details');
      return data;
    },
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
        <Loader2 className="w-10 h-10 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <p className="text-[#52796f]">Loading bank details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-[#fecaca]">
        <p className="text-[#dc2626]">Failed to load bank details.</p>
      </div>
    );
  }

  const activeRecord = data.find(d => d.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2e1a]">Bank Details</h1>
        <p className="text-sm text-[#52796f] mt-1">
          The active account is shown to investors on the Buy Shares page. Edit values and they appear on the site instantly.
        </p>
      </div>

      {!activeRecord && (
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-2xl p-4 text-sm text-[#92400e]">
          No active bank account set. Investors will not see transfer details — mark one of the accounts below as active.
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-[#d8f3dc]">
          <Building2 className="w-16 h-16 text-[#95d5b2] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">No bank accounts recorded</h3>
          <p className="text-[#52796f]">Add a record in the bank_details table to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map(record => (
            <div
              key={record.id}
              className={`bg-white rounded-2xl border p-6 transition-colors ${
                record.is_active ? 'border-[#2d6a4f] ring-1 ring-[#2d6a4f]' : 'border-[#d8f3dc]'
              }`}
            >
              {editingId === record.id ? (
                <EditForm
                  record={record}
                  isSaving={saveDetails.isPending}
                  error={saveDetails.error ? (saveDetails.error as Error).message : null}
                  onSave={(updates) => saveDetails.mutate({ id: record.id, updates })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      record.is_active ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#f0f7f0] text-[#95d5b2]'
                    }`}>
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(record.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d6a4f] bg-[#f0f7f0] hover:bg-[#d8f3dc] rounded-full transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      {record.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">
                          <Star className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => setActive.mutate(record.id)}
                          disabled={setActive.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d6a4f] bg-[#d8f3dc] hover:bg-[#2d6a4f] hover:text-white rounded-full transition-colors disabled:opacity-50"
                        >
                          {setActive.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Set Active
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-[#1a2e1a]">{record.account_name || 'Account'}</h3>
                  <p className="text-sm text-[#52796f] mb-4">{record.bank_name}</p>

                  <div className="space-y-2 text-sm">
                    <DetailRow icon={CreditCard} label="Account Number" value={record.account_number} />
                    <DetailRow icon={Hash} label="IFSC Code" value={record.ifsc_code} />
                    {record.upi_id && <DetailRow icon={Link2} label="UPI ID" value={record.upi_id} />}
                    {record.gpay_id && <DetailRow icon={Smartphone} label="GPay ID" value={record.gpay_id} />}
                    {record.phonepay_id && <DetailRow icon={Smartphone} label="PhonePe ID" value={record.phonepay_id} />}
                  </div>

                  <p className="text-xs text-[#95d5b2] mt-4">
                    Updated {format(new Date(record.updated_at ?? record.created_at), 'dd MMM yyyy, h:mm a')}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditForm({ record, isSaving, error, onSave, onCancel }: {
  record: BankDetail;
  isSaving: boolean;
  error: string | null;
  onSave: (updates: Partial<BankDetail>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    bank_name: record.bank_name || '',
    account_name: record.account_name || '',
    account_number: record.account_number || '',
    ifsc_code: record.ifsc_code || '',
    upi_id: record.upi_id || '',
    gpay_id: record.gpay_id || '',
    phonepay_id: record.phonepay_id || '',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      bank_name: form.bank_name.trim(),
      account_name: form.account_name.trim(),
      account_number: form.account_number.trim(),
      ifsc_code: form.ifsc_code.trim().toUpperCase(),
      upi_id: form.upi_id.trim() || null,
      gpay_id: form.gpay_id.trim() || null,
      phonepay_id: form.phonepay_id.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-[#1a2e1a]">Edit Bank Details</h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[#f0f7f0] transition-colors" title="Cancel">
          <X className="w-4 h-4 text-[#52796f]" />
        </button>
      </div>

      <Field label="Bank Name" value={form.bank_name} onChange={set('bank_name')} />
      <Field label="Account Name" value={form.account_name} onChange={set('account_name')} />
      <Field label="Account Number" value={form.account_number} onChange={set('account_number')} />
      <Field label="IFSC Code" placeholder="SBIN0001234" value={form.ifsc_code} onChange={set('ifsc_code')} />
      <Field label="UPI ID" placeholder="name@bank" value={form.upi_id} onChange={set('upi_id')} />
      <Field label="GPay UPI ID" placeholder="name@oksbi" value={form.gpay_id} onChange={set('gpay_id')} />
      <Field label="PhonePe UPI ID" placeholder="name@ybl" value={form.phonepay_id} onChange={set('phonepay_id')} />

      {error && (
        <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-[#f0f7f0] text-[#52796f] text-sm font-semibold rounded-xl hover:bg-[#e0efe2] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#52796f] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#f0f7f0] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#2d6a4f]"
      />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#fafdf7] rounded-xl px-3 py-2">
      <Icon className="w-4 h-4 text-[#2d6a4f] flex-shrink-0" />
      <span className="text-[#52796f] w-32 flex-shrink-0">{label}</span>
      <span className="font-medium text-[#1a2e1a] break-all">{value}</span>
    </div>
  );
}