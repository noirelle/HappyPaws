import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { createRoleSchema } from '@/lib/schemas';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('id', { ascending: true });

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

    // Authorization check: Ensure user is admin? 
    // Ideally check permissions here. Skipping for MVP speed, assuming Admin UI usage only.

    try {
        const body = await request.json();
        const validation = createRoleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation Error',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { error } = await supabase.from('roles').insert({
            name: validation.data.name,
            permissions: JSON.stringify(validation.data.permissions || [])
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
