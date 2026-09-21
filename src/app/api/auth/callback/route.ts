import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { welcomeEmail } from '@/lib/email/templates/investment';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    let redirectTo = searchParams.get('redirect') || '/dashboard';

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await adminClient
          .from('users')
          .select('id, role')
          .eq('supabase_id', user.id)
          .single();

        if (!existing) {
          await adminClient.from('users').insert({
            supabase_id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            role: 'USER',
          });

          const { data: newUser } = await adminClient
            .from('users')
            .select('id')
            .eq('supabase_id', user.id)
            .single();

          if (newUser) {
            await adminClient.from('profiles').insert({ user_id: newUser.id });
          }

          // Send welcome email
          try {
            await sendEmail({
              to: user.email!,
              subject: 'Welcome to FarmDirect!',
              html: welcomeEmail(user.user_metadata?.full_name || 'Investor'),
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }

          redirectTo = '/welcome';
        }
      }
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
}