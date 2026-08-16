import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations/[id]/messages — list a conversation's messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: id,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  const messages = await db.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      conversationId: true,
      content: true,
      imageUrl: true,
      createdAt: true,
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  // Mark the conversation as read for the requesting user.
  await db.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId: id,
        userId: session.user.id,
      },
    },
    data: { unreadCount: 0, lastReadAt: new Date() },
  });

  return NextResponse.json({ messages });
}
