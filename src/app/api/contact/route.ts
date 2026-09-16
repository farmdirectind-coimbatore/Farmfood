import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import { emailTemplate } from '@/lib/email/templates/base';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email to admin
    const adminHtml = emailTemplate(`
      <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">New Contact Form Submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0;"><strong>Name:</strong></td><td style="padding: 8px 0;">${name}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Email:</strong></td><td style="padding: 8px 0;">${email}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Phone:</strong></td><td style="padding: 8px 0;">${phone || 'Not provided'}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Subject:</strong></td><td style="padding: 8px 0;">${subject}</td></tr>
        <tr><td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td><td style="padding: 8px 0;">${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    `, 'New contact form submission');

    await sendEmail({
      to: process.env.ADMIN_EMAILS || 'admin@farmdirect.ind',
      subject: `Contact Form: ${subject}`,
      html: adminHtml,
    });

    // Send confirmation to user
    const userHtml = emailTemplate(`
      <h2 className="text-xl font-bold text-[#1a2e1a] mb-4">We Received Your Message</h2>
      <p className="text-[#52796f] leading-relaxed">Hi ${name},</p>
      <p className="text-[#52796f] leading-relaxed">Thank you for contacting FarmDirect. We've received your message and will get back to you within 24 hours.</p>
      <div className="bg-[#f0f7f0] rounded-xl p-4 mt-4">
        <p className="text-sm text-[#52796f]"><strong>Subject:</strong> ${subject}</p>
        <p className="text-sm text-[#52796f] mt-1"><strong>Your Message:</strong></p>
        <p className="text-sm text-[#1a2e1a] mt-1">${message.replace(/\n/g, '<br>')}</p>
      </div>
    `, 'Message received - FarmDirect');

    await sendEmail({
      to: email,
      subject: 'We received your message - FarmDirect',
      html: userHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}