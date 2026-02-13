
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "@/lib/types";
import { NextResponse } from "next/server";

function sendSSEMessage(writer: WritableStreamDefaultWriter<Uint8Array>, data: StreamMessage) {
  const encoder = new TextEncoder();
  return writer.write(encoder.encode(`${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`));
}

export async function POST(request: Request) {
  try {
    // Authentication removed - no longer required for research purposes
    const body = (await request.json()) as ChatRequestBody;
    const { messages, newMessage, chatId } = body;

    //* Create stream with larger queue strategy for better performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });


    //* Send the initial message to the client

    const startStream = async () => {
      try {
        //* Send initial connection stableshed message
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });
        //* Send user message to PostgreSQL via API
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            content: newMessage,
            role: 'user',
          }),
        });
      } catch (error) {
        console.error("Error in chat Api: ", error);
        return NextResponse.json({ error: "Failed to process chat request" } as const, { status: 500 });
      }
    };

    startStream();
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process chat request" } as const, { status: 500 });
  }
}
