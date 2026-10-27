export const PORT = Number(process.env.PORT || 3000);
export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";
export const JWT_SECRET = process.env.JWT_SECRET;

export function validateAuthConfig() {
  if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET) < 32) {
    throw new Error(
      "JWT_SECRET debe estar configurado con al menos 32 bytes en el archivo .env.",
    );
  }
}
