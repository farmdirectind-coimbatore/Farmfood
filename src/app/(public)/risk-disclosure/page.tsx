import { Metadata } from 'next';
import { AlertCircle, Shield, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Risk Disclosure - FarmDirect',
  description: 'Important risk disclosure for FarmDirect farm revenue-sharing investment. This is not a guaranteed financial product.',
};

export default function RiskDisclosurePage() {
  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Warning Banner */}
        <div className="bg-[#fff8f0] border border-[#fecaca] rounded-2xl p-5 sm:p-6 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#dc2626]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#1a2e1a] mb-2">Important Risk Warning</h2>
              <p className="text-[#7f1d1d] text-sm leading-relaxed">
                <strong>FarmDirect is a farm revenue-sharing product, NOT a bank deposit, fixed deposit, or guaranteed financial instrument.</strong> 
                Your returns depend entirely on actual farm revenue. You could lose some or all of your invested capital.
              </p>
            </div>
          </div>
        </div>

        <article className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-[#d8f3dc]">
          <header className="mb-10 pb-6 border-b border-[#d8f3dc]">
            <span className="inline-block px-3 py-1 bg-[#fecaca] text-[#dc2626] rounded-full text-xs font-semibold mb-4">
              Risk Disclosure
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1a2e1a]">Risk Disclosure Statement</h1>
            <p className="text-[#52796f] mt-2 text-sm">Read carefully before investing. Last updated: September 2026</p>
          </header>

          <div className="text-[#52796f] leading-relaxed space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#dc2626]" />
                1. Nature of Investment
              </h2>
              <p>
                When you purchase Shares in FarmDirect, you are acquiring a contractual right to receive a share of the farm&apos;s net revenue 
                as daily payouts for a defined period (249 weekdays). This is <strong>not</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>A bank deposit, fixed deposit, or savings account</li>
                <li>A bond, debenture, or regulated debt instrument</li>
                <li>A mutual fund, ETF, or collective investment scheme</li>
                <li>Insured by DICGC, RBI, SEBI, or any government agency</li>
                <li>Guaranteed, assured, or protected against loss</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[#dc2626]" />
                2. Key Risks
              </h2>
              
              <h3 className="text-lg font-semibold text-[#1a2e1a] mt-4 mb-2">Agricultural & Operational Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Weather & Climate:</strong> Drought, floods, unseasonal rain, extreme temperatures can destroy crops and reduce yield</li>
                <li><strong>Pests & Diseases:</strong> Crop pests, plant diseases, livestock illness can significantly reduce production</li>
                <li><strong>Market Price Volatility:</strong> Vegetable, fruit, and livestock prices fluctuate daily based on supply/demand</li>
                <li><strong>Input Cost Increases:</strong> Seeds, feed, fertilizer, labor, electricity, fuel costs may rise unexpectedly</li>
                <li><strong>Labor Issues:</strong> Shortages, strikes, wage disputes can disrupt operations</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1a2e1a] mt-4 mb-2">Business & Financial Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Revenue Shortfall:</strong> Farm revenue may be insufficient to cover projected payouts</li>
                <li><strong>Liquidity Risk:</strong> Your capital is locked for 249 weekdays; early withdrawal of principal is not available</li>
                <li><strong>Concentration Risk:</strong> All revenue comes from a single farm location in Coimbatore</li>
                <li><strong>Expansion Risk:</strong> Planned growth (new outlets, processing) may not materialize or may lose money</li>
                <li><strong>Partner Risk:</strong> Dependence on partner farmers who may default or supply poor quality</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1a2e1a] mt-4 mb-2">Regulatory & Legal Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Regulatory Changes:</strong> New laws on agriculture, land use, investment products, or taxation</li>
                <li><strong>Compliance Costs:</strong> Increased licensing, reporting, or environmental compliance expenses</li>
                <li><strong>Land Title Issues:</strong> Disputes, encumbrances, or government acquisition of farm land</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#1a2e1a] mt-4 mb-2">Platform & Operational Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Technology Failure:</strong> System outages, data loss, payment processing errors</li>
                <li><strong>Cybersecurity:</strong> Hacking, data breaches, unauthorized access to accounts</li>
                <li><strong>Key Person Risk:</strong> Dependence on founding team; loss of key personnel</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#2d6a4f]" />
                3. Risk Mitigation Measures
              </h2>
              <p>We implement several measures to reduce (but not eliminate) risks:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li><strong>Diversified Revenue:</strong> Multiple income streams — crops, livestock, restaurant, tourism, wholesale</li>
                <li><strong>Zero-Waste Processing:</strong> Surplus converted to shelf-stable products (powders, snacks)</li>
                <li><strong>Partner Network:</strong> 200+ farmers reduce single-source dependency</li>
                <li><strong>Insurance:</strong> Crop and livestock insurance where available</li>
                <li><strong>Reserves:</strong> Maintaining cash reserves for lean periods</li>
                <li><strong>Transparent Reporting:</strong> Daily payout tracking, regular farm updates for investors</li>
                <li><strong>Asset Backing:</strong> Investment tied to tangible farm assets (land, equipment, livestock)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#dc2626]" />
                4. What You Could Lose
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Partial Returns:</strong> Daily payouts may be lower than projected if farm revenue falls short</li>
                <li><strong>Delayed Payouts:</strong> Cash flow gaps may cause temporary delays in wallet credits</li>
                <li><strong>Capital Loss:</strong> In extreme scenarios (total crop failure, regulatory shutdown), you could lose your entire invested principal</li>
                <li><strong>No Compensation:</strong> There is no investor protection fund, insurance, or government backstop</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">5. Who Should NOT Invest</h2>
              <p>Do not invest if you:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Cannot afford to lose your entire investment</li>
                <li>Need guaranteed returns or capital protection</li>
                <li>Require immediate liquidity (funds locked ~1 year)</li>
                <li>Do not understand agricultural business risks</li>
                <li>Are investing borrowed money or emergency funds</li>
                <li>Are under 18 years of age</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">6. No Advice or Recommendation</h2>
              <p>
                FarmDirect does not provide financial, tax, or legal advice. The information on this Platform is for educational purposes only. 
                You should consult your own financial advisor, tax consultant, and legal counsel before investing. 
                Past or projected returns are not indicative of future performance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">7. Regulatory Status</h2>
              <p>
                FarmDirect operates as a private farm revenue-sharing arrangement. 
                It is not registered with SEBI, RBI, or any financial regulator as an investment product. 
                The contractual relationship is governed by the Terms & Conditions and Indian Contract Act, 1872.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1a2e1a] mb-3">8. Acknowledgment</h2>
              <p>
                By investing through FarmDirect, you acknowledge that you have read, understood, and accepted these risks. 
                You confirm that your investment decision is based on your own judgment and risk tolerance, 
                not on any representation or guarantee by FarmDirect or its representatives.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}