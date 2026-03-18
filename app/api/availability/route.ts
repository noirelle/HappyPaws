import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const vetId = searchParams.get('vetId');

    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    try {
        // 1. Fetch all active clinic slots
        const { data: slots, error: slotsError } = await supabase
            .from('clinic_slots')
            .select('time')
            .eq('is_active', true);

        if (slotsError) throw slotsError;

        // 1.5 Fetch total available vets count (for capacity check)
        const { count: availableVetsCount, error: vetsError } = await supabase
            .from('vets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Available');

        if (vetsError) throw vetsError;

        const totalCapacity = availableVetsCount || 0;

        // 2. Fetch bookings for that date
        let bookingsQuery = supabase
            .from('bookings')
            .select('preferred_time, vet_id')
            .eq('preferred_date', date)
            .neq('status', 'cancelled'); // Don't count cancelled as taken

        if (vetId && vetId !== 'any') {
            bookingsQuery = bookingsQuery.eq('vet_id', vetId);
        }

        const { data: bookings, error: bookingsError } = await bookingsQuery;

        if (bookingsError) throw bookingsError;

        const normalizeTime = (t: string) => t ? t.replace(/^0/, '') : '';

        // 3. Mark slots as taken
        const availability = slots.map(slot => {
            const bookingsAtTime = bookings?.filter(b => normalizeTime(b.preferred_time) === normalizeTime(slot.time)) || [];
            
            let isTaken = false;
            if (vetId && vetId !== 'any') {
                isTaken = bookingsAtTime.some(b => b.vet_id === parseInt(vetId));
            } else {
                // If vetId is 'any', it's taken ONLY if we hit total capacity (all vets booked)
                isTaken = totalCapacity > 0 ? bookingsAtTime.length >= totalCapacity : true; 
            }

            return {
                time: slot.time,
                isTaken
            };
        });

        return NextResponse.json(availability);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
