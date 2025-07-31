import dotenv from "dotenv";
dotenv.config();

export const jwtUserSecret = process.env.JWT_USER_SECRET;
export const jwtAdminSecret = process.env.JWT_ADMIN_SECRET;
export const mongoUri = process.env.MONGO_URI;
export const userSaltRounds = Number(process.env.USER_SALT_ROUNDS || 10);
export const adminSaltRounds = Number(process.env.ADMIN_SALT_ROUNDS || 12);