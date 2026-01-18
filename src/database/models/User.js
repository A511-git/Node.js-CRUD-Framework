import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            
        },
        fullName: {
            type: String,
            trim: true,
            maxlength: 128
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        },
        refreshToken: {
            type: String,
            select: false
        },
        lastLogin: {
            type: Date,
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.__v;
            }
        }
    }
);
UserSchema.plugin(mongoosePaginate);

export const UserModel = mongoose.model("user", UserSchema);
