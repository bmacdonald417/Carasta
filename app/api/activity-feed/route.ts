import { sseActivityBuffer } from "@/lib/pusher";
import { activityEmitter } from "@/lib/activity-emitter";
import type { ActivityEvent } from "@/lib/pusher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: ActivityEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (_) {}
      };

      sseActivityBuffer.forEach(send);

      const handler = (event: ActivityEvent) => send(event);
      activityEmitter.on("activity", handler);

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (_) {
          clearInterval(keepAlive);
        }
      }, 15000);

      cleanup = () => {
        activityEmitter.off("activity", handler);
        clearInterval(keepAlive);
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
