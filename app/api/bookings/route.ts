import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/schemas';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Route protection
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    if (status && status !== 'All') {
        query = query.eq('status', status.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();

        // Validate with Zod
        const validation = bookingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation Error',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    pet_name: validation.data.petName,
                    pet_type: validation.data.petType,
                    breed: validation.data.breed,
                    age: validation.data.age,
                    gender: validation.data.gender,
                    visit_reason: validation.data.visitReason,
                    symptoms: validation.data.symptoms,
                    is_emergency: validation.data.isEmergency,
                    owner_name: validation.data.ownerName,
                    email: validation.data.email,
                    phone: validation.data.phone,
                    preferred_date: validation.data.preferredDate,
                    preferred_time: validation.data.preferredTime,
                    status: validation.data.status,
                    vet_id: validation.data.vet_id,
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err) {
        console.error('Server Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
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
        const { id, status, vet_id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (vet_id !== undefined) updateData.vet_id = vet_id;

        const { data, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
