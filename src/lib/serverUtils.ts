import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function checkIfAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token?.value || !process.env.JWT_SECRET) {
    return false;
  }

  const verified = jwt.verify(token.value, process.env.JWT_SECRET) as unknown as {
    role: string;
  };

  if (!verified.role || verified.role !== "admin") {
    return false;
  }

  return true;
}
