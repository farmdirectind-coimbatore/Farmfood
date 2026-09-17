import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - FarmDirect',
  description: 'Terms and conditions for FarmDirect farm investment platform.',
};

export default function TermsPage() {
  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <article className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-[#d8f3dc]">
          <header className="mb-10 pb-6 border-b border-[#d8f3dc]">
            <span className="inline-block px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-xs font-semibold mb-4">
              Legal
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a]">Terms & Conditions</h1>
            <p className="text-[#52796f] mt-2 text-sm">Last updated: September 2026</p>
          </header>

          <div className="text-[#52796f] leading-relaxed space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing and using the FarmDirect platform (&quot;Platform&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). 
                If you do not agree with any part of these Terms, you may not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">2. Description of Service</h2>
              <p>
                FarmDirect operates a working farm in Coimbatore, Tamil Nadu, combining agriculture, livestock, hospitality, and agro-tourism. 
                The Platform allows individuals to purchase lots in the farm&apos;s revenue (&quot;Lots&quot;). 
                Each Lot represents a contractual right to receive a portion of the farm&apos;s net revenue as daily payouts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">3. Investment Terms</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>1 Lot = ₹10,000 (Indian Rupees Ten Thousand)</li>
                <li>Daily payout: 1% of invested amount per weekday (Monday–Friday)</li>
                <li>Payout period: 249 weekdays (approximately one calendar year)</li>
                <li>Total projected return per Lot: ₹24,900 over the full cycle</li>
                <li>Minimum withdrawal: ₹100 from accumulated wallet balance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">4. Purchase Process</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Select number of Lots using the calculator</li>
                <li>Transfer funds to the designated bank account</li>
                <li>Upload screenshot of payment proof</li>
                <li>Wait for verification (typically within 24 hours)</li>
                <li>Holding activated on next weekday; payouts begin</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">5. Risk Disclosure</h2>
              <p>
                <strong>This is a farm revenue-sharing product, not a guaranteed financial instrument.</strong> 
                Returns are generated from actual farm operations and may vary due to weather, market conditions, crop failure, livestock disease, 
                regulatory changes, and other agricultural risks. Past performance does not guarantee future results. 
                Please read the full <a href="/risk-disclosure" className="text-[#2d6a4f] underline">Risk Disclosure</a> before investing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">6. User Obligations</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate information during registration and KYC</li>
                <li>Use only your own funds for investment</li>
                <li>Comply with all applicable Indian laws and regulations</li>
                <li>Not use the Platform for money laundering or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">7. Intellectual Property</h2>
              <p>
                All content, branding, calculations, and proprietary systems on the Platform are owned by FarmDirect. 
                You may not reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">8. Limitation of Liability</h2>
              <p>
                FarmDirect shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform 
                or investment in Lots. Our maximum liability shall not exceed the amount you have invested.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">9. Termination</h2>
              <p>
                We may suspend or terminate your access to the Platform for violation of these Terms. 
                Upon termination, your existing holdings will continue their payout cycle unless otherwise required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">10. Governing Law & Disputes</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Coimbatore, Tamil Nadu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">11. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be communicated via email and/or Platform notification. 
                Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">12. Contact</h2>
              <p>
                For questions about these Terms, contact us at <a href="mailto:farmdirect.ind@gmail.com" className="text-[#2d6a4f] underline">farmdirect.ind@gmail.com</a> 
                or call +91 98408 30369.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}