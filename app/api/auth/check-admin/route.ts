import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('[check-admin] No authenticated user');
      return NextResponse.json({ isAdmin: false });
    }

    // Check if user has admin role
    // Table is 'profiles' (not 'user_profiles')
    // Primary key is 'id' (not 'user_id')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[check-admin] Database error:', profileError);
      return NextResponse.json({ isAdmin: false });
    }

    if (!profile) {
      console.log('[check-admin] No profile found for user:', user.id);
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = profile.role === 'admin';
    console.log('[check-admin] User:', user.email, 'Role:', profile.role, 'IsAdmin:', isAdmin);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('[check-admin] Unexpected error:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
