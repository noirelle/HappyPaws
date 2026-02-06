import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { vetSchema } from '@/lib/schemas';

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('vets')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate with Zod
        const validation = vetSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation Error',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { error } = await supabase.from('vets').insert(validation.data);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
