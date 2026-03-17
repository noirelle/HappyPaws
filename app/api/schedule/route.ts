import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Route protection
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Optional date filter (YYYY-MM-DD)
    const vetId = searchParams.get('vetId');

    let query = supabase
        .from('bookings')
        .select('*, vets(id, name, color)')
        .order('preferred_time', { ascending: true });

    if (date) {
        query = query.eq('preferred_date', date);
    }
    
    if (vetId) {
        query = query.eq('vet_id', vetId);
    }

    const { data: bookings, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Grouping for the UI if needed, but for now just return the sorted list
    // The client can group it or we can do a basic structure here
    return NextResponse.json(bookings);
}
