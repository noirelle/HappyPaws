import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch Stats
    const { count: upcomingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('preferred_date', new Date().toISOString())
        .neq('status', 'cancelled');

    const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Recent activity
    const { data: recentActivity } = await supabase
        .from('bookings')
        .select('*, vets(name)')
        .order('created_at', { ascending: false })
        .limit(5);

    // Total clients (distinct emails)
    const { count: totalClients } = await supabase
        .from('bookings')
        .select('email', { count: 'exact', head: true });

    // Active vets
    const { count: activeVets } = await supabase
        .from('vets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Available');

    return NextResponse.json({
        upcomingCount,
        pendingCount,
        totalClients: totalClients || 0,
        activeVets: activeVets || 0,
        recentActivity
    });
}
