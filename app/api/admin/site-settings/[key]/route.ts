import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/guards';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAuth('admin');
    const { key } = await params;
    const body = await req.json();
    
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('site_settings')
      .update({
        value: body.value,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
