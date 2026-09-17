'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Loader2, Upload, X, Copy, Check } from 'lucide-react';
import { ShareCalculator } from '@/components/calculator/ShareCalculator';
import { calculateInvestment } from '@/lib/calculations/investment';
import { formatINR } from '@/lib/utils/currency';
import { APP_CONSTANTS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string | null;
  gpay_id: string | null;
  phonepay_id: string | null;
}

interface CopyButtonProps {
  text: string;
  field: string;
  copied: string | null;
  onCopy: (text: string, field: string) => void;
}

function CopyButton({ text, field, copied, onCopy }: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onCopy(text, field)}
      className="p-1.5 rounded-lg hover:bg-[#d8f3dc] transition-colors"
      title="Copy"
    >
      {copied === field ? <Check className="w-4 h-4 text-[#166534]" /> : <Copy className="w-4 h-4 text-[#95d5b2]" />}
    </button>
  );
}

export function PurchaseForm() {
  const router = useRouter();
  const [shares, setShares] = useState(1);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'calculator' | 'upload' | 'submitting' | 'success'>('calculator');
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const investment = calculateInvestment(shares);

  const { data: bankDetails } = useQuery({
    queryKey: ['bankDetails'],
    queryFn: async (): Promise<BankDetails | null> => {
      const res = await fetch('/api/admin/bank-details');
      if (!res.ok) return null;
      const data = await res.json();
      const record = Array.isArray(data) ? (data.find((d: BankDetails & { is_active?: boolean }) => d.is_active) ?? data[0]) : data;
      return record || null;
    },
  });

  const handleScreenshotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > APP_CONSTANTS.SCREENSHOT_MAX_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setPreview(null);
    if (preview) URL.revokeObjectURL(preview);
  };

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!screenshot) throw new Error('Screenshot required');

      const formData = new FormData();
      formData.append('shares', shares.toString());
      formData.append('screenshot', screenshot);

      const res = await fetch('/api/purchase/request', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      return data;
    },
    onSuccess: () => {
      setStep('success');
    },
    onError: (err: Error) => {
      setError(err.message);
      setStep('upload');
    },
  });

  const handleSubmit = () => {
    if (!screenshot) {
      setError('Please upload a payment screenshot');
      return;
    }
    setError(null);
    setStep('submitting');
    purchaseMutation.mutate();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const buildUpiLink = (upiId: string) => {
    if (!upiId) return null;
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(bankDetails?.account_name || 'FarmDirect')}&am=${investment.totalInvested}&cu=INR&tn=${encodeURIComponent('FarmDirect Share Purchase')}`;
  };

  const gpayLink = bankDetails ? buildUpiLink(bankDetails.gpay_id || bankDetails.upi_id || '') : null;
  const phonepayLink = bankDetails ? buildUpiLink(bankDetails.phonepay_id || bankDetails.upi_id || '') : null;

  if (step === 'calculator') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-[#d8f3dc]">
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-6">Select Your Shares</h2>
          <ShareCalculator
            initialShares={shares}
            onChange={(calc) => setShares(calc.shares)}
            maxShares={1000}
            unit="share"
          />
        </div>

        {/* Bank Details */}
        <div className="bg-[#f0f7f0] rounded-2xl p-6 border border-[#d8f3dc]">
          <h3 className="font-semibold text-[#1a2e1a] mb-4">Bank Details for Transfer</h3>
          {bankDetails ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#52796f]">Bank</span>
                <span className="font-medium text-[#1a2e1a]">{bankDetails.bank_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52796f]">Account Name</span>
                <span className="font-medium text-[#1a2e1a]">{bankDetails.account_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52796f]">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1a2e1a] font-mono">{bankDetails.account_number}</span>
                  <CopyButton text={bankDetails.account_number} field="account" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52796f]">IFSC</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#1a2e1a] font-mono">{bankDetails.ifsc_code}</span>
                  <CopyButton text={bankDetails.ifsc_code} field="ifsc" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>
              {bankDetails.upi_id && (
                <div className="flex items-center justify-between">
                  <span className="text-[#52796f]">UPI ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a2e1a] font-mono">{bankDetails.upi_id}</span>
                    <CopyButton text={bankDetails.upi_id} field="upi" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>
              )}
              {(bankDetails.gpay_id || bankDetails.upi_id) && (
                <div className="flex items-center justify-between">
                  <span className="text-[#52796f]">GPay ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a2e1a] font-mono">{bankDetails.gpay_id || bankDetails.upi_id}</span>
                    <CopyButton text={bankDetails.gpay_id || bankDetails.upi_id!} field="gpay" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>
              )}
              {(bankDetails.phonepay_id || bankDetails.upi_id) && (
                <div className="flex items-center justify-between">
                  <span className="text-[#52796f]">PhonePe ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1a2e1a] font-mono">{bankDetails.phonepay_id || bankDetails.upi_id}</span>
                    <CopyButton text={bankDetails.phonepay_id || bankDetails.upi_id!} field="phonepay" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#52796f]">
              Payment details are being configured. Please check back shortly, or email{' '}
              <a href="mailto:farmdirect.ind@gmail.com" className="text-[#2d6a4f] font-medium underline">
                farmdirect.ind@gmail.com
              </a>{' '}
              for transfer details.
            </p>
          )}

          <p className="text-xs text-[#52796f] mt-4">
            Transfer <strong>{formatINR(investment.totalInvested)}</strong> for {shares} share{shares > 1 ? 's' : ''}, then upload a screenshot of the payment confirmation.
          </p>
        </div>

        {/* UPI Payment Buttons */}
        {(gpayLink || phonepayLink) && (
          <div className="grid gap-3">
            {gpayLink && (
              <a
                href={gpayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#5f3dc4] text-white font-semibold py-3.5 px-6 rounded-2xl hover:bg-[#4f2da6] transition-colors shadow-md"
              >
                Pay {formatINR(investment.totalInvested)} with GPay
              </a>
            )}
            {phonepayLink && (
              <a
                href={phonepayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#342d7e] text-white font-semibold py-3.5 px-6 rounded-2xl hover:bg-[#241f57] transition-colors shadow-md"
              >
                Pay {formatINR(investment.totalInvested)} with PhonePe
              </a>
            )}
          </div>
        )}

        <button
          onClick={() => setStep('upload')}
          className="w-full bg-[#2d6a4f] text-white font-semibold py-3.5 px-6 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
        >
          Continue to Upload Proof
        </button>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-[#d8f3dc]">
          <h2 className="text-xl font-bold text-[#1a2e1a] mb-6">Upload Payment Proof</h2>

          <div className="bg-[#f0f7f0] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-[#1a2e1a]">{shares} Share{shares > 1 ? 's' : ''}</span>
              <span className="text-[#2d6a4f] font-bold">{formatINR(investment.totalInvested)}</span>
            </div>
            <p className="text-sm text-[#52796f]">Daily: {formatINR(investment.dailyPayout)} · Payout Days: 249</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm text-[#52796f] mb-2 font-medium">Payment Screenshot *</span>
              {preview ? (
                <div className="relative group">
                  <div className="aspect-video rounded-xl overflow-hidden border border-[#d8f3dc] bg-white">
                    <img src={preview} alt="Payment proof preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="aspect-video rounded-xl border-2 border-dashed border-[#d8f3dc] flex flex-col items-center justify-center cursor-pointer hover:border-[#2d6a4f] hover:bg-[#fafdf7] transition-colors"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-[#95d5b2] mb-2" />
                  <p className="text-[#52796f]">Click or drag to upload</p>
                  <p className="text-xs text-[#95d5b2]">JPEG, PNG, WebP · Max 5MB</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleScreenshotChange}
                className="hidden"
              />
            </label>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-[#dc2626] text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('calculator')}
                className="flex-1 px-4 py-3 bg-white border border-[#d8f3dc] text-[#52796f] rounded-xl font-medium hover:bg-[#f0f7f0] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={purchaseMutation.isPending || !preview}
                className="flex-1 px-4 py-3 bg-[#2d6a4f] text-white rounded-xl font-medium hover:bg-[#1a4d3a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#fff8f0] border border-[#fde68a] rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#92400e] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#92400e]">
              <p className="font-semibold">Important:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ensure the screenshot shows the transaction ID, amount, date, and recipient details clearly</li>
                <li>Verification typically takes 24 hours during business days</li>
                <li>You will receive an email once your payment is approved or if there are any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 text-[#2d6a4f] animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1a2e1a] mb-2">Submitting Your Request</h3>
        <p className="text-[#52796f]">Please wait while we process your payment proof...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-[#166534]" />
        </div>
        <h3 className="text-2xl font-bold text-[#1a2e1a] mb-2">Payment Proof Submitted!</h3>
        <p className="text-[#52796f] mb-6 max-w-md mx-auto">
          We have received your payment proof for {shares} share{shares > 1 ? 's' : ''}. Our team will verify it within 24 hours. You will receive an email once approved.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-[#2d6a4f] text-white font-semibold py-3 px-8 rounded-2xl hover:bg-[#1a4d3a] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return null;
}