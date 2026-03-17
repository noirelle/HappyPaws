import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    // Use the service role or a public client if standard RLS is too restrictive
    // However, createClient() usually uses the user's session if available, 
    // but we want this to be public.
    const supabase = await createClient();

    let query = supabase
        .from('vets')
        .select('id, name, specialty, image, status')
        .eq('status', 'Available')
        .order('name', { ascending: true });

    if (search) {
        query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
