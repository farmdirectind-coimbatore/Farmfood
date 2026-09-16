import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works - FarmDirect Investment',
  description: 'Learn how FarmDirect investment works. 1 share = ₹10,000, 1% daily returns on weekdays for 249 days. Use our live calculator to see your projected returns.',
};

import HowItWorksClient from './HowItWorksClient';

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}