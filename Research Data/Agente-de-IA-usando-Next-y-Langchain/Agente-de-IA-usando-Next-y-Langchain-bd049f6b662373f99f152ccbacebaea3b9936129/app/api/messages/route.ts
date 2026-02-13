import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/messages?chatId=... - List messages for a chat
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT id, chat_id as "chatId", content, role, created_at as "createdAt" FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId]
    );

    // Convert to format expected by frontend
    const messages = result.rows.map(row => ({
      _id: row.id.toString(),
      _creationTime: row.createdAt,
      chatId: row.chatId.toString(),
      content: row.content,
      role: row.role,
      createdAt: row.createdAt,
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Create a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, content, role } = body;

    if (!chatId || !content || !role) {
      return NextResponse.json({ error: 'chatId, content, and role are required' }, { status: 400 });
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Role must be "user" or "assistant"' }, { status: 400 });
    }

    const createdAt = Date.now();
    const sanitizedContent = content.replace(/\n/g, '\\n');

    const result = await pool.query(
      'INSERT INTO messages (chat_id, content, role, created_at) VALUES ($1, $2, $3, $4) RETURNING id, chat_id as "chatId", content, role, created_at as "createdAt"',
      [chatId, sanitizedContent, role, createdAt]
    );

    const message = result.rows[0];
    return NextResponse.json({
      _id: message.id.toString(),
      _creationTime: message.createdAt,
      chatId: message.chatId.toString(),
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
