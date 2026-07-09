import PusherClient from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

export const pusherClient = key 
  ? new PusherClient(key, { cluster: cluster || "mt1" })
  : {
      subscribe: () => ({ bind: () => {}, unbind: () => {} }),
      unsubscribe: () => {},
      bind: () => {},
      unbind: () => {},
    } as unknown as PusherClient;
