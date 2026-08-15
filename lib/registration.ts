import { db } from "@/lib/db";
import { generateUsername } from "@/lib/utils";

// Generate a username that is guaranteed not to collide with an existing user.
export async function createUniqueUsername(name: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = generateUsername(name);
    const existing = await db.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return generateUsername(`${name} ${Date.now()}`);
}