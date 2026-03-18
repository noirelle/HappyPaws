import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Fetch Stats
    const { count: upcomingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('preferred_date', today)
        .neq('status', 'cancelled');

    const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { count: cancelledCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

    // Recent activity (increased limit for filtering)
    const { data: recentActivity } = await supabase
        .from('bookings')
        .select('*, vets(name)')
        .order('created_at', { ascending: false })
        .limit(50);

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
        cancelledCount: cancelledCount || 0,
        totalClients: totalClients || 0,
        activeVets: activeVets || 0,
        recentActivity
    });
}
