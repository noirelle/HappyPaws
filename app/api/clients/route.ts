import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Route protection
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all bookings with vet details for aggregation
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, vets(name)')
        .order('preferred_date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate data by owner email
    const clientsMap = new Map();

    bookings?.forEach(booking => {
        const email = (booking.email || 'no-email').toLowerCase();
        
        if (!clientsMap.has(email)) {
            clientsMap.set(email, {
                id: booking.id, // Use latest booking ID as a ref
                name: booking.owner_name,
                email: booking.email,
                phone: booking.phone,
                pets: [],
                visitCount: 0,
                lastVisit: booking.preferred_date,
                preferredVet: booking.vets?.name || 'Any',
                status: booking.status,
                adminNotes: booking.admin_notes || '',
                fullHistory: []
            });
        }

        const client = clientsMap.get(email);
        
        // Pick the latest non-empty note if current is empty
        if (!client.adminNotes && booking.admin_notes) {
            client.adminNotes = booking.admin_notes;
        }

        client.fullHistory.push({
            id: booking.id,
            pet_name: booking.pet_name,
            visit_reason: booking.visit_reason,
            symptoms: booking.symptoms,
            date: booking.preferred_date,
            time: booking.preferred_time,
            status: booking.status,
            vet: booking.vets?.name,
            adminNotes: booking.admin_notes
        });
        
        // Add pet if not already in list
        const petKey = `${booking.pet_name}-${booking.pet_type}`.toLowerCase();
        if (!client.pets.some((p: any) => `${p.name}-${p.type}`.toLowerCase() === petKey)) {
            client.pets.push({
                name: booking.pet_name,
                type: booking.pet_type,
                breed: booking.breed
            });
        }

        client.visitCount += 1;
        
        // Update last visit if this one is newer (already sorted by date desc, so usually first is latest)
        if (new Date(booking.preferred_date) > new Date(client.lastVisit)) {
            client.lastVisit = booking.preferred_date;
            client.status = booking.status;
        }
    });

    const clients = Array.from(clientsMap.values());

    return NextResponse.json(clients);
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    
    // Route protection
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, note } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Update all bookings for this email to keep notes in sync across the "Client" profile
        const { data, error } = await supabase
            .from('bookings')
            .update({ admin_notes: note })
            .ilike('email', email);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
