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
        // Logic: A slot is taken if there's a booking for that time+vet
        // If vetId is 'any', a slot is only taken if it's "Full" (e.g., all available vets booked)
        // For simplicity: If vetId is specific, check that vet. If vetId is 'any', check if ANY vet is available.
        
        const availability = slots.map(slot => {
            const bookingsAtTime = bookings?.filter(b => normalizeTime(b.preferred_time) === normalizeTime(slot.time)) || [];
            
            let isTaken = false;
            if (vetId && vetId !== 'any') {
                isTaken = bookingsAtTime.some(b => b.vet_id === parseInt(vetId));
            } else {
                // If vetId is 'any', we might want to check total capacity
                // For now, let's just mark it as taken if there's ANY booking for that time 
                // to be safe, or we could fetch total vet count.
                isTaken = bookingsAtTime.length > 0; 
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
