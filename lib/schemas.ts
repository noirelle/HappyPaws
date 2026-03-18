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
    vet_id: z.number().nullable().optional(),
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

export const serviceSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Service name is required"),
    description: z.string().optional(),
    duration: z.string().optional(),
    price: z.number().optional(),
    is_active: z.boolean().default(true),
    created_at: z.string().optional(),
    icon_name: z.string().optional(),
    image_url: z.string().optional()
});

export const carePackageSchema = z.object({
    id: z.number().optional(),
    icon: z.string().default('🐶'),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    discount: z.string().optional(),
    color: z.string().optional(),
    discount_color: z.string().optional(),
    is_active: z.boolean().default(true),
});

export type Booking = z.infer<typeof bookingSchema>;
export type Vet = z.infer<typeof vetSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type CarePackage = z.infer<typeof carePackageSchema>;
