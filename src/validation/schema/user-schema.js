import { z } from "zod";
import { BaseSchema } from "./base-schema.js";


export const UserSchema = {
    register: z.object({
        fullName: BaseSchema.fullName,
        email: BaseSchema.email,
        password: BaseSchema.password,
    }),

    login: z.object({
        email: BaseSchema.email,
        password: BaseSchema.password,
    }),

    refresh: z.object({
        token: BaseSchema.token,
    }),

    updatePassword: z.object({
        oldPassword: BaseSchema.password,
        newPassword: BaseSchema.password,
    }),

    update: z.object({
        id: BaseSchema.id.optional(),
        status: BaseSchema.status.optional(),
        email: BaseSchema.email.optional(),
        fullName: BaseSchema.fullName.optional(),
    }).refine(
        (data) =>
            Object.values(data).some((value) => value !== undefined),
        {
            message: "At least one field must be provided for update",
        }
    ).refine(
    ({ id, status }) =>
        (id && status) || (!id && !status),
    {
        message: "id and status must be provided together",
        path: ["status"],
    }
)
};
