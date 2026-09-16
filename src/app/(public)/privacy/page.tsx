import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - FarmDirect',
  description: 'Privacy policy for FarmDirect farm investment platform.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <article className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-[#d8f3dc]">
          <header className="mb-10 pb-6 border-b border-[#d8f3dc]">
            <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-4">
              Legal
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a]">Privacy Policy</h1>
            <p className="text-[#52796f] mt-2 text-sm">Last updated: September 2026</p>
          </header>

          <div className="text-[#52796f] leading-relaxed space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Account Information:</strong> Name, email address (from Google OAuth), profile picture</li>
                <li><strong>Profile Information:</strong> Phone number, address, PAN number (optional, for KYC)</li>
                <li><strong>Transaction Information:</strong> Share purchases, payment proofs, payout history</li>
                <li><strong>Communication:</strong> Emails, support requests, feedback</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Create and manage your investment account</li>
                <li>Process share purchases and verify payments</li>
                <li>Calculate and distribute daily payouts</li>
                <li>Send transactional emails (confirmations, notifications, statements)</li>
                <li>Comply with legal and regulatory requirements (KYC, anti-money laundering)</li>
                <li>Improve our Platform and customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information only in these circumstances:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Service Providers:</strong> Supabase (database/auth), Resend (email), Google (OAuth) — under strict data processing agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, regulation, or valid legal request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">4. Data Security</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>All data encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
                <li>Supabase Row Level Security ensures users only access their own data</li>
                <li>Admin access logged in audit trail</li>
                <li>Payment proofs stored in private Supabase Storage with signed URLs</li>
                <li>Regular security reviews and dependency updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">5. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Account data: Retained while account is active, plus 7 years after closure for regulatory compliance</li>
                <li>Transaction records: Retained for 7 years per financial regulations</li>
                <li>Payment proofs: Retained for 3 years after verification</li>
                <li>Email logs: Retained for 1 year</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">6. Your Rights</h2>
              <p>Under applicable law, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request deletion (subject to legal retention requirements)</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent for marketing communications</li>
              </ul>
              <p>To exercise these rights, email <a href="mailto:farmdirect.ind@gmail.com" className="text-[#2d6a4f] underline">farmdirect.ind@gmail.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">7. Cookies & Tracking</h2>
              <p>We use minimal cookies:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Essential: Session management, authentication, CSRF protection</li>
                <li>Analytics: None (we respect your privacy)</li>
                <li>Marketing: None</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">8. Third-Party Services</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Google OAuth:</strong> Handles authentication; we receive only name, email, profile picture</li>
                <li><strong>Supabase:</strong> Database and auth infrastructure; data stored in their secure cloud</li>
                <li><strong>Resend:</strong> Transactional email delivery; emails contain only necessary transaction data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">9. Children&apos;s Privacy</h2>
              <p>Our Platform is not intended for individuals under 18. We do not knowingly collect data from minors. 
              If you believe a minor has provided data, contact us immediately for deletion.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">10. International Transfers</h2>
              <p>Your data may be processed on servers located outside India (Supabase cloud infrastructure). 
              We ensure adequate safeguards through standard contractual clauses and data processing agreements.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">11. Changes to This Policy</h2>
              <p>We may update this Privacy Policy. Material changes will be notified via email and Platform notice. 
              The &quot;Last updated&quot; date above reflects the most recent revision.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">12. Contact</h2>
              <p>For privacy concerns or to exercise your rights, contact our Data Protection Officer at 
              <a href="mailto:farmdirect.ind@gmail.com" className="text-[#2d6a4f] underline">farmdirect.ind@gmail.com</a>.</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}