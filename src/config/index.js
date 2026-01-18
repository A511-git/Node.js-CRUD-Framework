import dotEnv from "dotenv"


dotEnv.config()

export const PORT = process.env.PORT;
export const DB_URL = process.env.DB_URI;
export const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
export const FRONTEND_URL = process.env.FRONTEND_URL;