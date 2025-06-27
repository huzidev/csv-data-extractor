import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ error: "Username and password are required" }, { status: 400 });
    }

    // Simple authentication check
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || admin.password !== password) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    return json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
