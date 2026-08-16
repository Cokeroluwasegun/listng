import { NextRequest, NextResponse } from "next/server";
import { getPusherOrNull, getUserChannel } from "@/lib/pusher-server";
import { auth } from "@/lib/auth";

// Pusher auth for private channels
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pusher = getPusherOrNull();
  if (!pusher) {
    return NextResponse.json({ error: "Pusher is not configured" }, { status: 503 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id")!;
  const channelName = params.get("channel_name")!;

  // Authorize based on channel type
  if (channelName.startsWith("private-conversation-")) {
    // Any authenticated user can attempt — the message handler validates participation
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  if (channelName === getUserChannel(session.user.id)) {
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
