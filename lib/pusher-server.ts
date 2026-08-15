// Server-only Pusher module. Import this from API routes / server code.
import Pusher from "pusher";
import { PUSHER_EVENTS, getConversationChannel, getUserChannel } from "@/lib/pusher";
import { logger } from "@/lib/logger";

function hasPusherConfig(): boolean {
  return ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"].every(
    (name) => !!process.env[name]
  );
}

export function getPusherServer(): Pusher {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;
  if (!appId || !key || !secret || !cluster) {
    throw new Error(
      "Missing required environment variables: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER"
    );
  }
  return new Pusher({ appId, key, secret, cluster, useTLS: true });
}

let cachedPusher: Pusher | null = null;

// Lazily-created instance; returns null when Pusher isn't configured so the
// rest of the app (message persistence, etc.) keeps working without it.
export function getPusherOrNull(): Pusher | null {
  if (!hasPusherConfig()) return null;
  if (!cachedPusher) {
    cachedPusher = getPusherServer();
  }
  return cachedPusher;
}

// Best-effort broadcast. A failed realtime push must never fail the
// underlying operation (the message is already persisted in the DB).
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: unknown
): Promise<void> {
  const pusher = getPusherOrNull();
  if (!pusher) return;
  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    logger.error("Failed to broadcast event", { err: String(error) });
  }
}

export { PUSHER_EVENTS, getConversationChannel, getUserChannel };