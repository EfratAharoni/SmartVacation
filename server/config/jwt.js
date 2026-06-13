const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

export const JWT_SECRET = secret || "dev_jwt_secret_change_me";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
