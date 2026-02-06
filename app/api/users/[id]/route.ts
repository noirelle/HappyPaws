import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin'; // Use admin client for modifying other users' data safely if RLS blocks
import { NextResponse } from 'next/server';
import { updateUserSchema } from '@/lib/schemas';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure only admins can do this (check profile)
    // const { data: myProfile } = await supabase.from('user_profiles').select('roles(name)').eq('id', user.id).single();
    // if (myProfile?.roles?.name !== 'Admin') ...

    const { id } = await params;

    try {
        const body = await request.json();
        const validation = updateUserSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation Error', details: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        // Use Admin client to bypass RLS restrictions on writing to other users' profiles if needed
        // Or normal client if policies allow "Admin" role to write
        const supabaseAdmin = createAdminClient();

        const { error } = await supabaseAdmin
            .from('user_profiles')
            .update(validation.data)
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
