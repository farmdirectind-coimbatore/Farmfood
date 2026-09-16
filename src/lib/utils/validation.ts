import { z } from 'zod';

export const purchaseRequestSchema = z.object({
  shares: z.number().int().min(1).max(10000),
  screenshotFile: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
});

export const bankDetailsSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(20),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format').optional().or(z.literal('')),
});

export const adminActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.rejectionReason && data.rejectionReason.trim().length > 0),
  { message: 'Rejection reason is required', path: ['rejectionReason'] }
);

export const payoutMarkPaidSchema = z.object({
  holdingId: z.string().min(1),
  payoutDate: z.string().datetime(),
});

export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type AdminActionInput = z.infer<typeof adminActionSchema>;
export type PayoutMarkPaidInput = z.infer<typeof payoutMarkPaidSchema>;
export type NotificationMarkReadInput = z.infer<typeof notificationMarkReadSchema>;