import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { inviteUserSchema } from '@/lib/schemas';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Join with roles
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(name)')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const validation = inviteUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation Error', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { email, first_name, last_name, role_id } = validation.data;

        // Use Admin Client to invite user
        const supabaseAdmin = createAdminClient();
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { first_name, last_name } // Metadata for new user trigger if any
        });

        if (inviteError) {
            return NextResponse.json({ error: inviteError.message }, { status: 500 });
        }

        // Create Profile manually if trigger not set up or just to be safe/explicit
        const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
            id: authData.user.id,
            email: authData.user.email,
            first_name,
            last_name,
            role_id,
            is_approved: true, // Auto-approve invited users
            is_banned: false
        });

        if (profileError) {
            return NextResponse.json({ error: 'User invited but profile creation failed: ' + profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
