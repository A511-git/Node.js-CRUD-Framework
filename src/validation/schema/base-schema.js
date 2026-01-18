import { z } from "zod"

const BaseSchema = {
    fullName: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email"),
    password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
    status: z.enum(["ACTIVE", "INACTIVE"], "Invalid status"),
    role: z.enum(["USER", "ADMIN"], "Invalid role"),
    token: z.string("Invalid token"),
    id: z.string("Invalid id"),
};

export {BaseSchema}

