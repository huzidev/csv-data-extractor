import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticateAdmin } from "~/db/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ error: "Username and password are required" }, { status: 400 });
    }

    const result = await authenticateAdmin(username, password);

    if (!result.success) {
      return json({ error: result.error }, { status: 401 });
    }

    return json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
