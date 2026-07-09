import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "mock",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "mock",
  secret: process.env.PUSHER_SECRET || "mock",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mock",
  useTLS: true,
});
