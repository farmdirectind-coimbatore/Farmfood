import { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - FarmDirect',
  description: 'Get in touch with FarmDirect. Visit our farm in Coimbatore, email us, or call for investment inquiries.',
};

export default function ContactPage() {
  return <ContactForm />;
}