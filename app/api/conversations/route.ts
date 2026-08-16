import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/conversations — list user's conversations
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await db.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
      listing: {
        select: { id: true, title: true, images: true, price: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  // Attach unread count for current user
  const withUnread = conversations.map((conv) => {
    const myParticipant = conv.participants.find((p) => p.userId === session.user.id);
    const otherParticipants = conv.participants.filter((p) => p.userId !== session.user.id);
    return {
      ...conv,
      unreadCount: myParticipant?.unreadCount ?? 0,
      otherParticipants,
      lastMessage: conv.messages[0] ?? null,
    };
  });

  return NextResponse.json({ conversations: withUnread });
}

// POST /api/conversations — start or get existing conversation
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId, listingId } = await request.json();

  if (!recipientId) return NextResponse.json({ error: "recipientId required" }, { status: 400 });
  if (recipientId === session.user.id) return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });

  // Check recipient exists
  const recipient = await db.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

  // Find existing conversation between these two users for this listing
  const existing = await db.conversation.findFirst({
    where: {
      listingId: listingId || null,
      participants: {
        every: { userId: { in: [session.user.id, recipientId] } },
      },
    },
  });

  if (existing) {
    return NextResponse.json({ conversationId: existing.id, isNew: false });
  }

  // Create new conversation
  const conversation = await db.conversation.create({
    data: {
      listingId: listingId || null,
      participants: {
        create: [
          { userId: session.user.id },
          { userId: recipientId },
        ],
      },
    },
  });

  return NextResponse.json({ conversationId: conversation.id, isNew: true }, { status: 201 });
}
