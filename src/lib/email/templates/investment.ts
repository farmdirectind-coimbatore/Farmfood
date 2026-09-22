import { emailTemplate, infoRow, buttonStyle } from './base';

export function purchaseSubmittedEmail(userName: string, shares: number, amount: number, dailyPayout: number, totalProjectedReturn: number): string {
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Payment Proof Received</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      We've received your payment proof for <strong>${shares} lot${shares > 1 ? 's' : ''}</strong> (₹${amount.toLocaleString('en-IN')}). 
      Our team will verify it shortly.
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${infoRow('Lots Purchased', shares.toString())}
      ${infoRow('Total Invested', `₹${amount.toLocaleString('en-IN')}`)}
      ${infoRow('Daily Payout (Weekdays)', `₹${dailyPayout.toLocaleString('en-IN')}`)}
      ${infoRow('Total Projected Return', `₹${totalProjectedReturn.toLocaleString('en-IN')}`)}
      ${infoRow('Payout Period', '249 weekdays (~1 year)')}
    </table>
    
    <p style="color: #52796f; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
      You'll receive a confirmation email once your payment is verified and your holding is activated. 
      Payouts will begin on the next weekday after activation.
    </p>
  `;
  
  return emailTemplate(content, 'Your payment proof has been received - verification pending');
}

export function purchaseApprovedEmail(userName: string, shares: number, amount: number, dailyPayout: number, totalProjectedReturn: number, startDate: Date): string {
  const formattedDate = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Payment Approved - Holding Activated</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      Great news! Your payment has been verified and your holding is now active. 
      Daily payouts will begin from <strong>${formattedDate}</strong> (next weekday).
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${infoRow('Lots', shares.toString())}
      ${infoRow('Total Invested', `₹${amount.toLocaleString('en-IN')}`)}
      ${infoRow('Daily Payout', `₹${dailyPayout.toLocaleString('en-IN')}`)}
      ${infoRow('Total Projected Return', `₹${totalProjectedReturn.toLocaleString('en-IN')}`)}
      ${infoRow('Start Date', formattedDate)}
      ${infoRow('End Date (249 weekdays)', calculateEndDate(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))}
    </table>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, 'View Dashboard')}
    </div>
    
    <p style="color: #52796f; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
      You can track your daily payouts and portfolio progress in your dashboard. 
      Payouts are credited on weekdays (Monday-Friday) only.
    </p>
  `;
  
  return emailTemplate(content, 'Your investment is now active - daily payouts starting soon');
}

function calculateEndDate(startDate: Date): Date {
  const current = new Date(startDate);
  let weekdaysCount = 0;
  
  while (weekdaysCount < 249) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      weekdaysCount++;
    }
  }
  
  return current;
}

export function purchaseRejectedEmail(userName: string, shares: number, amount: number, reason: string): string {
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Payment Verification Update</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      We've reviewed your payment proof for <strong>${shares} lot${shares > 1 ? 's' : ''}</strong> (₹${amount.toLocaleString('en-IN')}) 
      and unfortunately cannot approve it at this time.
    </p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #dc2626; font-weight: 600; margin: 0 0 8px;">Reason for Rejection:</p>
      <p style="color: #7f1d1d; margin: 0;">${reason}</p>
    </div>
    
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 24px 0 0;">
      You can submit a new payment proof with the correct details from your dashboard.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, 'Resubmit Payment Proof', '#dc2626')}
    </div>
  `;
  
  return emailTemplate(content, 'Payment verification update - action required');
}

export function cycleCompletedEmail(userName: string, shares: number, totalInvested: number, totalReceived: number): string {
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Investment Cycle Completed</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      Congratulations! Your investment cycle of <strong>249 weekdays</strong> has been completed. 
      Here's your final summary:
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${infoRow('Lots Held', shares.toString())}
      ${infoRow('Total Invested', `₹${totalInvested.toLocaleString('en-IN')}`)}
      ${infoRow('Total Received', `₹${totalReceived.toLocaleString('en-IN')}`)}
      ${infoRow('Net Profit', `₹${(totalReceived - totalInvested).toLocaleString('en-IN')}`)}
    </table>
    
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 24px 0 0;">
      Thank you for investing with FarmDirect. You can reinvest or withdraw your funds from your dashboard.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, 'View Dashboard')}
    </div>
  `;
  
  return emailTemplate(content, 'Your investment cycle has completed - final summary');
}

export function adminNewRequestEmail(userName: string, userEmail: string, shares: number, amount: number): string {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/login?redirect=${encodeURIComponent('/admin/verification')}`;

  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">New Payment Verification Request</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      A new payment verification request has been submitted and is awaiting your approval.
      Log in to the admin dashboard to review the payment proof.
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${infoRow('User', userName)}
      ${infoRow('Email', userEmail)}
      ${infoRow('Lots', shares.toString())}
      ${infoRow('Amount', `₹${amount.toLocaleString('en-IN')}`)}
    </table>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(reviewUrl, 'Login & Review Request')}
    </div>
  `;
  
  return emailTemplate(content, `New payment verification request: ${shares} lot${shares > 1 ? 's' : ''} from ${userName}`);
}

export function weeklyDigestEmail(userName: string, payouts: Array<{ date: string; amount: number }>, totalThisWeek: number): string {
  const rows = payouts.map(p => infoRow(p.date, `₹${p.amount.toLocaleString('en-IN')}`)).join('');
  
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Weekly Payout Summary</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      Here's a summary of your daily payouts for this week:
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${rows}
      <tr>
        <td style="padding: 12px 0; border-top: 2px solid #2d6a4f;">
          <span style="color: #1a2e1a; font-size: 16px; font-weight: 700;">Week Total</span>
          <span style="color: #2d6a4f; font-size: 16px; font-weight: 700; float: right;">₹${totalThisWeek.toLocaleString('en-IN')}</span>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, 'View Full History')}
    </div>
  `;
  
  return emailTemplate(content, `Weekly payout summary: ₹${totalThisWeek.toLocaleString('en-IN')}`);
}

export function welcomeEmail(userName: string): string {
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Welcome to FarmDirect!</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      Thank you for joining FarmDirect! We're excited to have you on board.
    </p>
    
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      FarmDirect lets you invest in sustainable farming and earn daily returns. Here's how it works:
    </p>
    
    <ul style="color: #52796f; font-size: 16px; line-height: 2; margin: 0 0 24px; padding-left: 20px;">
      <li><strong>1 Lot = ₹10,000</strong> - Invest in our vegetable farming operations</li>
      <li><strong>1% Daily Return</strong> - Earn ₹100 per lot every weekday</li>
      <li><strong>249 Weekdays</strong> - Payouts continue for approximately one year</li>
      <li><strong>Total Projected Return</strong> - ₹24,900 per lot (149% return)</li>
    </ul>
    
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      To get started, please complete your profile setup with your name, phone number, and bank details for payouts.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/welcome`, 'Complete Your Setup')}
    </div>
    
    <p style="color: #52796f; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
      If you have any questions, feel free to reach out to us at <a href="mailto:farmdirect.ind@gmail.com" style="color: #2d6a4f;">farmdirect.ind@gmail.com</a>.
    </p>
  `;
  
  return emailTemplate(content, 'Welcome to FarmDirect - Start earning daily returns');
}

export function investmentConfirmationEmail(userName: string, shares: number, amount: number, dailyPayout: number, totalProjectedReturn: number): string {
  const content = `
    <h1 style="color: #1a2e1a; margin: 0 0 16px; font-size: 24px;">Investment Confirmed</h1>
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Hi ${userName},<br><br>
      Your investment has been confirmed! Here are the details:
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${infoRow('Lots Purchased', shares.toString())}
      ${infoRow('Amount Invested', `₹${amount.toLocaleString('en-IN')}`)}
      ${infoRow('Daily Payout (Weekdays)', `₹${dailyPayout.toLocaleString('en-IN')}`)}
      ${infoRow('Total Projected Return', `₹${totalProjectedReturn.toLocaleString('en-IN')}`)}
      ${infoRow('Payout Period', '249 weekdays (~1 year)')}
      ${infoRow('First Payout', 'Next weekday after approval')}
    </table>
    
    <p style="color: #52796f; font-size: 16px; line-height: 1.6; margin: 24px 0 0;">
      Your daily payouts will begin on the next weekday after admin approval. You can track all payouts in your dashboard.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      ${buttonStyle(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`, 'View Dashboard')}
    </div>
  `;
  
  return emailTemplate(content, `Investment confirmed: ${shares} lot${shares > 1 ? 's' : ''} - ₹${amount.toLocaleString('en-IN')}`);
}