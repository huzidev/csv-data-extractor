import { prisma } from "~/lib/prisma";

export async function authenticateAdmin(username: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || admin.password !== password) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true, admin: { id: admin.id, username: admin.username } };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}
