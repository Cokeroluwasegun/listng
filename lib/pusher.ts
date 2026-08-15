// Client-safe Pusher module.
// NOTE: this module must stay free of server-only imports (the `pusher`
// package) so it can be safely bundled into client components.

import PusherClient from "pusher-js";

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherClientInstance;
}

export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  TYPING: "typing",
  NOTIFICATION: "notification",
} as const;

export function getConversationChannel(conversationId: string) {
  return `private-conversation-${conversationId}`;
}

export function getUserChannel(userId: string) {
  return `private-user-${userId}`;
}