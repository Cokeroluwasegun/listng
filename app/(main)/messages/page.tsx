"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { getPusherClient, getConversationChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { Send, Image as ImageIcon, ArrowLeft, ShieldCheck, MoreVertical } from "lucide-react";
import { cn, formatTimeAgo, getInitials } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  conversationId: string;
  content: string;
  imageUrl?: string | null;
  sender: { id: string; name: string; image?: string | null };
  createdAt: string;
}

interface Participant {
  userId: string;
  user: { id: string; name: string; image?: string | null };
}

interface Conversation {
  id: string;
  listing?: { id: string; title: string; images: string[]; price: string } | null;
  otherParticipants: Participant[];
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!session) return;
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations || []);
        setLoading(false);
      });
  }, [session]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConvId) return;
    fetch(`/api/conversations/${selectedConvId}/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []));
  }, [selectedConvId]);

  // Subscribe to Pusher
  useEffect(() => {
    if (!selectedConvId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(getConversationChannel(selectedConvId));
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getConversationChannel(selectedConvId));
    };
  }, [selectedConvId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!messageInput.trim() || !selectedConvId || sending) return;
    setSending(true);
    const content = messageInput;
    setMessageInput("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConvId, content }),
    });
    setSending(false);
  }

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const otherUser = selectedConv?.otherParticipants[0]?.user;

  useEffect(() => {
    if (!session) router.push("/login?callbackUrl=/messages");
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ─── Conversations Sidebar ─── */}
      <div className={cn(
        "w-full flex-shrink-0 flex-col border-r border-[hsl(var(--border))] bg-white md:w-80",
        selectedConvId ? "hidden md:flex" : "flex"
      )}>
        <div className="border-b border-[hsl(var(--border))] px-4 py-4">
          <h1 className="font-display text-xl font-bold">Messages</h1>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--color-primary))] border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl">💬</div>
            <p className="mt-3 font-semibold text-[hsl(var(--foreground))]">No messages yet</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Start by clicking &ldquo;Send Message&rdquo; on any listing
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const other = conv.otherParticipants[0]?.user;
              const isSelected = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[hsl(var(--muted)/0.5)]",
                    isSelected && "bg-[hsl(var(--color-primary)/0.06)]"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-sm font-bold text-white">
                    {other?.image ? (
                      <img src={other.image} alt={other.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      getInitials(other?.name || "?")
                    )}
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{other?.name || "User"}</p>
                      {conv.lastMessage && (
                        <p className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                          {formatTimeAgo(conv.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                    {conv.listing && (
                      <p className="truncate text-xs text-[hsl(var(--color-primary))]">
                        Re: {conv.listing.title}
                      </p>
                    )}
                    {conv.lastMessage && (
                      <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                        {conv.lastMessage.senderId === session.user.id ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Chat Area ─── */}
      <div className={cn(
        "flex flex-1 flex-col bg-[hsl(var(--muted)/0.2)]",
        !selectedConvId && "hidden md:flex"
      )}>
        {!selectedConvId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="font-display text-xl font-bold">Select a conversation</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Choose a conversation from the left to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] bg-white px-4 py-3.5 shadow-sm">
              <button
                onClick={() => setSelectedConvId(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-sm font-bold text-white">
                {otherUser?.image ? (
                  <img src={otherUser.image} alt={otherUser.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  getInitials(otherUser?.name || "?")
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{otherUser?.name}</p>
                {selectedConv?.listing && (
                  <Link
                    href={`/listings/${selectedConv.listing.id}`}
                    className="text-xs text-[hsl(var(--color-primary))] hover:underline"
                  >
                    Re: {selectedConv.listing.title}
                  </Link>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isSelf = msg.sender.id === session.user.id;
                return (
                  <div key={msg.id} className={cn("flex gap-2", isSelf && "flex-row-reverse")}>
                    {!isSelf && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-xs font-bold text-white">
                        {getInitials(msg.sender.name)}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      isSelf
                        ? "rounded-br-sm bg-[hsl(var(--color-primary))] text-white"
                        : "rounded-bl-sm bg-white text-[hsl(var(--foreground))] shadow-sm"
                    )}>
                      {msg.content && <p>{msg.content}</p>}
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Attachment" className="max-w-xs rounded-lg" />
                      )}
                      <p className={cn("mt-1 text-[10px]", isSelf ? "text-white/60" : "text-[hsl(var(--muted-foreground))]")}>
                        {formatTimeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[hsl(var(--border))] bg-white p-3">
              <div className="flex items-end gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-3 py-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
