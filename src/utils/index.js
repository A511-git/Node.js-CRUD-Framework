import {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY
} from "../config/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ================= PASSWORD =================

export const GeneratePassword = async (password, salt) =>
  bcrypt.hash(password, salt);

export const ValidatePassword = async (enteredPassword, savedPassword) =>
  bcrypt.compare(enteredPassword, savedPassword);

// ================= TOKENS =================
export const GenerateAccessToken = ({ _id, email, role }) =>{
  const payload = { _id, email, role};
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const GenerateRefreshToken = ({ _id, email, name, role }) =>{
  const payload = { _id, email, name, role };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const ValidateAccessToken = async (req) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) return false;

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, ACCESS_SECRET);

    req.user = payload;
    return true;
  } catch {
    return false;
  }
};

export const ValidateRefreshToken = (token) => {
  
  return jwt.verify(token, REFRESH_SECRET);
}

// ================= FORMAT =================
export const FormateData = (data) => {
  if (!data) throw new Error("Data not found");
  return { data };
};
