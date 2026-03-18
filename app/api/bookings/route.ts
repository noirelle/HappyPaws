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
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        const allowedFields = [
            'pet_name', 'pet_type', 'breed', 'age', 'gender', 
            'visit_reason', 'symptoms', 'is_emergency', 
            'owner_name', 'email', 'phone', 
            'preferred_date', 'preferred_time', 'status', 'vet_id'
        ];

        // Map camelCase from frontend to snake_case for DB if necessary, 
        // but the current implementation seems to use a mix. 
        // Let's support both or just pass through what's mapped.
        // Based on the POST method, the DB uses snake_case.
        
        const fieldMapping: Record<string, string> = {
            petName: 'pet_name',
            petType: 'pet_type',
            visitReason: 'visit_reason',
            isEmergency: 'is_emergency',
            ownerName: 'owner_name',
            preferredDate: 'preferred_date',
            preferredTime: 'preferred_time',
            vetId: 'vet_id'
        };

        Object.keys(updates).forEach(key => {
            const dbKey = fieldMapping[key] || key;
            if (allowedFields.includes(dbKey)) {
                updateData[dbKey] = updates[key];
            }
        });

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
