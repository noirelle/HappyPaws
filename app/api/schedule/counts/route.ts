import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Expecting YYYY-MM

    if (!month) {
        return NextResponse.json({ error: 'Month (YYYY-MM) is required' }, { status: 400 });
    }

    const startDate = `${month}-01`;
    // Get last day of month
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('bookings')
        .select('preferred_date')
        .gte('preferred_date', startDate)
        .lte('preferred_date', endDate);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate counts by date
    const counts: Record<string, number> = {};
    data.forEach((booking: any) => {
        counts[booking.preferred_date] = (counts[booking.preferred_date] || 0) + 1;
    });

    return NextResponse.json(counts);
}
