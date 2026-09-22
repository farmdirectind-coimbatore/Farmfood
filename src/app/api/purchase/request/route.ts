import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { calculateInvestment, INVESTMENT_CONSTANTS } from '@/lib/calculations/investment';
import { sendEmail } from '@/lib/email/resend';
import { purchaseSubmittedEmail, adminNewRequestEmail } from '@/lib/email/templates/investment';
import { getSignedUploadUrl } from '@/lib/supabase/storage';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: userProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const lots = parseInt((formData.get('lots') ?? formData.get('shares')) as string, 10);
    const screenshotFile = formData.get('screenshot') as File;

    // Validate lots
    if (!lots || lots < 1 || lots > INVESTMENT_CONSTANTS.MAX_SHARES_PER_USER) {
      return NextResponse.json({ error: 'Invalid number of lots' }, { status: 400 });
    }

    // Validate screenshot
    if (!screenshotFile || screenshotFile.size === 0) {
      return NextResponse.json({ error: 'Screenshot is required' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(screenshotFile.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    if (screenshotFile.size > INVESTMENT_CONSTANTS.SCREENSHOT_MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Calculate investment
    const investment = calculateInvestment(lots);

    // Upload screenshot to Supabase Storage
    const uploadResult = await getSignedUploadUrl(
      userProfile.id,
      screenshotFile.name
    );

    if ('error' in uploadResult) {
      return NextResponse.json({ error: 'Failed to prepare upload' }, { status: 500 });
    }

    const uploadUrl = uploadResult.url;
    const storagePath = uploadResult.path;

    // Upload file
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': screenshotFile.type },
      body: screenshotFile,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
    }

    // Create purchase request
    const { data: purchaseRequest, error: prError } = await adminClient
      .from('purchase_requests')
      .insert({
        user_id: userProfile.id,
        shares: lots,
        amount: investment.totalInvested,
        daily_payout: investment.dailyPayout,
        total_projected_return: investment.totalProjectedReturn,
        screenshot_url: storagePath,
        status: 'PENDING',
      })
      .select()
      .single();

    if (prError) throw prError;

    // Create notification for user
    await adminClient.from('notifications').insert({
      user_id: userProfile.id,
      type: 'purchase_submitted',
      title: 'Payment Proof Submitted',
      message: `We've received your payment proof for ${lots} lot${lots > 1 ? 's' : ''} (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(investment.totalInvested)}). Our team will verify it within 24 hours.`,
      data: {
        purchase_request_id: purchaseRequest.id,
        lots,
        amount: investment.totalInvested,
      },
    });

    // Create audit log
    await adminClient.from('audit_logs').insert({
      admin_id: userProfile.id,
      action: 'create_purchase_request',
      entity_type: 'purchase_request',
      entity_id: purchaseRequest.id,
      new_data: { lots, amount: investment.totalInvested },
    });

    // Send email to user
    await sendEmail({
      to: user.email!,
      subject: 'Payment Proof Received - FarmDirect',
      html: purchaseSubmittedEmail(
        user.user_metadata?.full_name || 'Investor',
        lots,
        investment.totalInvested,
        investment.dailyPayout,
        investment.totalProjectedReturn
      ),
    });

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAILS || 'farmdirect.ind@gmail.com',
      subject: `New Purchase Request: ${lots} lot${lots > 1 ? 's' : ''} from ${user.email}`,
      html: adminNewRequestEmail(
        user.user_metadata?.full_name || 'Investor',
        user.email!,
        lots,
        investment.totalInvested
      ),
    });

    return NextResponse.json({ 
      success: true, 
      purchaseRequest: {
        id: purchaseRequest.id,
        lots: purchaseRequest.shares,
        amount: investment.totalInvested,
        status: purchaseRequest.status,
      }
    });
  } catch (error) {
    console.error('Purchase request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit purchase request' },
      { status: 500 }
    );
  }
}

// Also provide GET endpoint for signed upload URL
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile } = await adminClient
      .from('users')
      .select('id')
      .eq('supabase_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName') || 'payment-proof.jpg';

    const result = await getSignedUploadUrl(userProfile.id, fileName);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Signed upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}