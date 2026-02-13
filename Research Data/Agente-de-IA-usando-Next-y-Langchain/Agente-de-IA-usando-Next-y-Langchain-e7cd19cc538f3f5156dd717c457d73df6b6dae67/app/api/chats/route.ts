import { NextResponse } from 'next/server';
import { pool, initDatabase } from '@/lib/db';

// Initialize database on first request
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

// GET /api/chats - List all chats
export async function GET() {
  try {
    await ensureDbInitialized();
    
    // Note: Since we removed authentication, we'll return all chats
    // In a real app, you'd filter by userId from session/token
    const result = await pool.query(
      'SELECT id, title, user_id as "userId", created_at as "createdAt" FROM chats ORDER BY created_at DESC'
    );

    // Convert to format expected by frontend
    const chats = result.rows.map(row => ({
      _id: row.id.toString(),
      _creationTime: row.createdAt,
      title: row.title,
      userId: row.userId,
      createdAt: row.createdAt,
    }));

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Since we removed authentication, use a placeholder userId
    // In a real app, you'd get this from session/token
    const userId = 'anonymous';
    const createdAt = Date.now();

    const result = await pool.query(
      'INSERT INTO chats (title, user_id, created_at) VALUES ($1, $2, $3) RETURNING id, title, user_id as "userId", created_at as "createdAt"',
      [title, userId, createdAt]
    );

    const chat = result.rows[0];
    return NextResponse.json({
      _id: chat.id.toString(),
      _creationTime: chat.createdAt,
      title: chat.title,
      userId: chat.userId,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

// DELETE /api/chats/[id] - Delete a chat
export async function DELETE(request: Request) {
  try {
    await ensureDbInitialized();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Delete messages first (CASCADE should handle this, but being explicit)
    await pool.query('DELETE FROM messages WHERE chat_id = $1', [id]);
    
    // Delete the chat
    await pool.query('DELETE FROM chats WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
