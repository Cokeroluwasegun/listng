import { NextRequest, NextResponse } from "next/server";
import { triggerPusherEvent, getConversationChannel, PUSHER_EVENTS } from "@/lib/pusher-server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, content, imageUrl } = body;

  if (!conversationId || (!content && !imageUrl)) {
    return NextResponse.json({ error: "conversationId and content required" }, { status: 400 });
  }

  // Verify sender is a participant
  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Create message
  const message = await db.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content || "",
      imageUrl,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  // Update conversation last message time
  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Increment unread count for other participants
  await db.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: session.user.id },
    },
    data: { unreadCount: { increment: 1 } },
  });

  // Broadcast via Pusher (best-effort — never fails the message send)
  await triggerPusherEvent(
    getConversationChannel(conversationId),
    PUSHER_EVENTS.NEW_MESSAGE,
    {
      id: message.id,
      conversationId,
      content: message.content,
      imageUrl: message.imageUrl,
      sender: message.sender,
      createdAt: message.createdAt,
    }
  );

  return NextResponse.json({ success: true, message });
}
