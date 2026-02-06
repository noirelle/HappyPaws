import { z } from 'zod';

export const bookingSchema = z.object({
    petName: z.string().min(1, "Pet name is required"),
    petType: z.string().min(1, "Pet type is required"),
    breed: z.string().optional(),
    age: z.string().optional(),
    gender: z.string().optional(),
    spayedNeutered: z.string().optional(),
    visitReason: z.string().min(1, "Reason for visit is required"),
    symptoms: z.string().optional(),
    isEmergency: z.boolean().default(false),
    ownerName: z.string().min(1, "Owner name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    preferredDate: z.string().min(1, "Date is required"),
    preferredTime: z.string().min(1, "Time is required"),
    status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
});

export const vetSchema = z.object({
    name: z.string().min(2, "Name is required"),
    specialty: z.string().min(2, "Specialty is required"),
    status: z.enum(["Available", "Busy", "On Leave"]),
    image: z.string().optional(),
    patients: z.number().int().nonnegative().default(0),
    experience: z.string().min(1, "Experience is required"),
    color: z.string().optional()
});

export const inviteUserSchema = z.object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    role_id: z.number()
});

export const updateUserSchema = z.object({
    role_id: z.number().optional(),
    is_banned: z.boolean().optional(),
    is_approved: z.boolean().optional()
});

export const createRoleSchema = z.object({
    name: z.string().min(1),
    permissions: z.array(z.string()).optional()
});

export type Booking = z.infer<typeof bookingSchema>;
export type Vet = z.infer<typeof vetSchema>;
